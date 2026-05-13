const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { profileUpsertSchema } = require("../lib/validators/profileValidator");
const { calculateTargets } = require("../lib/nutritionCalculator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/profile — Get the logged-in user's profile
// ─────────────────────────────────────────────────────────────────────────────
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      return sendError(res, "Profile not found. Please complete your profile setup.", 404);
    }

    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/profile — Create or update the user's profile
// ─────────────────────────────────────────────────────────────────────────────
router.put("/profile", authMiddleware, validateRequest(profileUpsertSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      age,
      sex,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      goal,
      activityLevel,
      primaryDietaryStyle,
      allergiesText,
      dislikedFoodsText,
    } = req.body;

    // Calculate nutritional targets from validated data
    const targets = calculateTargets({ age, sex, heightCm, currentWeightKg, goal, activityLevel });

    const profileData = {
      fullName,
      age,
      sex,
      heightCm,
      currentWeightKg,
      targetWeightKg: targetWeightKg ?? null,
      goal,
      activityLevel,
      primaryDietaryStyle: primaryDietaryStyle || "none",
      allergiesText: allergiesText || "",
      dislikedFoodsText: dislikedFoodsText || "",
      ...targets,
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
    });

    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
