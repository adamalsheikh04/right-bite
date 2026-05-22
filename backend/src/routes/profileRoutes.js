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
      photoBase64,
    } = req.body;

    let photoPath = undefined;
    if (photoBase64) {
      const path = require("path");
      const fs = require("fs");
      const matches = photoBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, "base64");
        
        const uploadsDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filename = `profile_${userId}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        photoPath = `/uploads/${filename}`;
      }
    }

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

    if (photoPath !== undefined) {
      profileData.photoPath = photoPath;
    }

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
