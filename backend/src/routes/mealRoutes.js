const express = require("express");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mealLogSchema } = require("../lib/validators/mealValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get start and end of today in UTC
// ─────────────────────────────────────────────────────────────────────────────
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { startOfDay, endOfDay };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meals — Log a new meal
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meals", authMiddleware, validateRequest(mealLogSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { mealName, mealType, calories, proteinG, carbsG, fatG, description, photoBase64 } = req.body;

    let photoPath = null;
    let source = "manual";

    if (photoBase64 && photoBase64.startsWith("data:image/")) {
      source = "photo";
      const matches = photoBase64.match(/^data:image\/([A-Za-z+-]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, "base64");
        
        const uploadsDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filename = `meal_${userId}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        photoPath = `/uploads/${filename}`;
      }
    }

    const now = new Date();
    const meal = await prisma.mealLog.create({
      data: {
        userId,
        mealName,
        mealType,
        description: description || "",
        calories: Math.round(calories),
        proteinG: Math.round(proteinG),
        carbsG: Math.round(carbsG),
        fatG: Math.round(fatG),
        source,
        photoPath,
        loggedDate: now,
        loggedTime: now,
      },
    });

    return sendSuccess(res, meal, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meals/today — Get today's meals + aggregated totals
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meals/today", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { loggedDate: "asc" },
    });

    const summary = meals.reduce(
      (acc, meal) => {
        acc.totalCalories += meal.calories;
        acc.totalProteinG += meal.proteinG;
        acc.totalCarbsG += meal.carbsG;
        acc.totalFatG += meal.fatG;
        return acc;
      },
      { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
    );

    return sendSuccess(res, { summary, meals });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/meals/:id — Delete a meal (ownership enforced)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/meals/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const mealId = Number(req.params.id);

    if (isNaN(mealId)) {
      return sendError(res, "Invalid meal ID", 400);
    }

    const meal = await prisma.mealLog.findUnique({ where: { id: mealId } });

    if (!meal) {
      return sendError(res, "Meal not found", 404);
    }
    if (meal.userId !== userId) {
      return sendError(res, "You are not authorized to delete this meal", 403);
    }

    await prisma.mealLog.delete({ where: { id: mealId } });
    return sendSuccess(res, { message: "Meal deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
