const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { preferencesSchema } = require("../lib/validators/mealPlanValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

// Services
const { generateTemplatePlan } = require("../lib/mealPlanTemplateService");
const { extractGroceryItems } = require("../lib/mealPlanGroceryService");
const { saveFullPlan, getActivePlan, getPlanHistory, getPlanById } = require("../lib/mealPlanPersistenceService");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/preferences — Save (upsert) wizard preferences
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/preferences", authMiddleware, validateRequest(preferencesSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      mealsPerDay,
      proteinSources,
      avoidFoodsText,
      cookingEffort,
      budgetLevel,
      cuisineStyle,
      varietyLevel,
      extraNotes,
    } = req.body;

    // Upsert: one preferences record per user (update if exists)
    const existing = await prisma.mealPlanPreference.findFirst({ where: { userId } });

    const data = {
      userId,
      mealsPerDay,
      proteinSourcesJson: JSON.stringify(proteinSources),
      avoidFoodsText,
      cookingEffort,
      budgetLevel,
      cuisineStyle,
      varietyLevel,
      extraNotes,
    };

    let preference;
    if (existing) {
      preference = await prisma.mealPlanPreference.update({ where: { id: existing.id }, data });
    } else {
      preference = await prisma.mealPlanPreference.create({ data });
    }

    return sendSuccess(res, preference);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/generate — Generate a 7-day template plan
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/generate", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 1. Fetch latest preferences and profile
    const preference = await prisma.mealPlanPreference.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (!preference) {
      return sendError(res, "Please complete the meal wizard first", 400);
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return sendError(res, "Please complete your profile first", 400);
    }

    // 2. Generate plan structure using Template Service
    const days = generateTemplatePlan(preference, profile);

    // 3. Extract grocery list using Grocery Service
    const groceryItems = extractGroceryItems(days);

    // 4. Save to DB using Persistence Service (Atomic Transaction)
    const plan = await saveFullPlan(userId, preference.id, days, groceryItems, {
      generationMode: "template",
      generatedByModel: "template_v1",
      generationNotes: "Initial template-based generation"
    });

    return sendSuccess(res, plan, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/latest — Get the user's current active plan
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/latest", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const plan = await getActivePlan(userId);

    if (!plan) {
      return sendError(res, "No active meal plan found", 404);
    }

    return sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/history — Get all archived plans
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/history", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const plans = await getPlanHistory(userId);
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/:id — Get a specific plan by ID
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.id);

    if (isNaN(planId)) return next();

    const plan = await getPlanById(userId, planId);
    if (!plan) {
      return sendError(res, "Meal plan not found or access denied", 404);
    }
    return sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/meal/:mealId/log — Log a planned meal directly to tracker
// ─────────────────────────────────────────────────────────────────────────────
const { logPlannedMeal } = require("../lib/mealLogBridgeService");

router.post("/meal-plan/meal/:mealId/log", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const mealId = Number(req.params.mealId);

    const loggedMeal = await logPlannedMeal(userId, mealId);
    return sendSuccess(res, loggedMeal, 201);
  } catch (error) {
    if (error.message === "Meal not found") {
      return sendError(res, error.message, 404);
    }
    if (error.message === "Access denied") {
      return sendError(res, error.message, 403);
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/:planId/groceries — Get all grocery items for a plan
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/:planId/groceries", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.planId);

    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const items = await prisma.groceryItem.findMany({
      where: { mealPlanId: planId },
      orderBy: [{ isChecked: "asc" }, { createdAt: "asc" }],
    });

    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/:planId/groceries — Add a custom grocery item
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/:planId/groceries", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.planId);
    const { itemName, quantityText, category } = req.body;

    if (!itemName || !itemName.trim()) {
      return sendError(res, "Item name is required", 400);
    }

    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const item = await prisma.groceryItem.create({
      data: {
        mealPlanId: planId,
        itemName: itemName.trim(),
        quantityText: quantityText || "",
        category: category || "General",
        isChecked: false,
        isUserAdded: true,
      },
    });

    return sendSuccess(res, item, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/meal-plan/:planId/groceries/:itemId — Toggle isChecked
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/meal-plan/:planId/groceries/:itemId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { mealPlan: true },
    });

    if (!item || item.mealPlan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: { isChecked: !item.isChecked },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/meal-plan/:planId/groceries/:itemId — Delete an item
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/meal-plan/:planId/groceries/:itemId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { mealPlan: true },
    });

    if (!item) {
      return sendError(res, "Item not found", 404);
    }
    if (item.mealPlan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    await prisma.groceryItem.delete({ where: { id: itemId } });
    return sendSuccess(res, { message: "Item deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
