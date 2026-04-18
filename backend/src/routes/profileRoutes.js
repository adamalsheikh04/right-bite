const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const { calculateTargets } = require("../lib/nutritionCalculator");

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Profile Route] ${req.method} ${req.path}`);
  next();
});

// GET current user's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("GET profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// CREATE or UPDATE profile
router.put("/profile", authMiddleware, async (req, res) => {
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

    // 1. Basic Validation
    if (!fullName || !age || !sex || !heightCm || !currentWeightKg || !goal || !activityLevel) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // 2. Calculate Nutritional Targets
    const targets = calculateTargets({
      age: Number(age),
      sex,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      goal,
      activityLevel,
    });

    // 3. Upsert Profile (Update if exists, Create if not)
    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        fullName,
        age: Number(age),
        sex,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        goal,
        activityLevel,
        primaryDietaryStyle,
        allergiesText: allergiesText || "",
        dislikedFoodsText: dislikedFoodsText || "",
        ...targets, // Spreads targetCalories, targetProteinG, etc.
      },
      create: {
        userId: userId,
        fullName,
        age: Number(age),
        sex,
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        goal,
        activityLevel,
        primaryDietaryStyle,
        allergiesText: allergiesText || "",
        dislikedFoodsText: dislikedFoodsText || "",
        ...targets,
      },
    });

    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
