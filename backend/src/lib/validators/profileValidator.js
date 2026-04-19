const { z } = require("zod");

/**
 * Validator for Profile Create/Update
 */
const profileUpsertSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  age: z.coerce.number().int().min(10, "Minimum age is 10").max(120, "Maximum age is 120"),
  sex: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Sex must be either 'male' or 'female'" }),
  }),
  heightCm: z.coerce.number().min(50, "Minimum height is 50cm").max(300, "Maximum height is 300cm"),
  currentWeightKg: z.coerce.number().min(20, "Minimum weight is 20kg").max(500, "Maximum weight is 500kg"),
  targetWeightKg: z.coerce.number().min(20, "Minimum weight is 20kg").max(500, "Maximum weight is 500kg").nullable().optional(),
  goal: z.enum(["lose", "maintain", "gain"], {
    errorMap: () => ({ message: "Goal must be 'lose', 'maintain', or 'gain'" }),
  }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"], {
    errorMap: () => ({ message: "Invalid activity level" }),
  }),
  primaryDietaryStyle: z.string().trim().default("none"),
  allergiesText: z.string().trim().default(""),
  dislikedFoodsText: z.string().trim().default(""),
});

module.exports = {
  profileUpsertSchema,
};
