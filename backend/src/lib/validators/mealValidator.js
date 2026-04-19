const { z } = require("zod");

/**
 * Validator for Meal Logging
 */
const mealLogSchema = z.object({
  mealName: z.string().trim().min(1, "Meal name is required"),
  mealType: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"], {
    errorMap: () => ({ message: "Meal type must be Breakfast, Lunch, Dinner, or Snack" }),
  }),
  calories: z.coerce.number().min(0, "Calories cannot be negative"),
  proteinG: z.coerce.number().min(0, "Protein cannot be negative"),
  carbsG: z.coerce.number().min(0, "Carbs cannot be negative"),
  fatG: z.coerce.number().min(0, "Fat cannot be negative"),
  description: z.string().trim().optional().default(""),
  loggedDate: z.string().optional(), // In Phase 1 we use Date.now() in route, but schema allows it
});

module.exports = {
  mealLogSchema,
};
