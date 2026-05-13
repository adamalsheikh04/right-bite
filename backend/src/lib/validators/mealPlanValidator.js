const { z } = require("zod");

/**
 * Validator for Meal Wizard Preferences
 */
const preferencesSchema = z.object({
  mealsPerDay: z.coerce.number().int().min(3).max(6),
  proteinSources: z.array(z.string()).min(1, "Select at least one protein source"),
  avoidFoodsText: z.string().trim().default(""),
  cookingEffort: z.enum(["easy", "moderate", "any"]).default("any"),
  budgetLevel: z.enum(["low", "medium", "flexible"]).default("medium"),
  cuisineStyle: z.enum(["arabic", "western", "mixed", "other"]).default("mixed"),
  varietyLevel: z.enum(["low", "medium", "high"]).default("medium"),
  extraNotes: z.string().trim().optional().default(""),
});

/**
 * Validator for a Generated Meal (used for internal consistency & AI output)
 */
const generatedMealSchema = z.object({
  mealType: z.string(),
  mealOrder: z.number().int().positive(),
  mealName: z.string().min(1),
  description: z.string().default(""),
  ingredientsText: z.string().default(""),
  calories: z.number().int().nonnegative(),
  proteinG: z.number().int().nonnegative(),
  carbsG: z.number().int().nonnegative(),
  fatG: z.number().int().nonnegative(),
});

/**
 * Validator for a Generated Day
 */
const generatedDaySchema = z.object({
  dayName: z.string(),
  dayOrder: z.number().int().positive(),
  totalCalories: z.number().int().nonnegative(),
  totalProteinG: z.number().int().nonnegative(),
  totalCarbsG: z.number().int().nonnegative(),
  totalFatG: z.number().int().nonnegative(),
  meals: z.array(generatedMealSchema),
});

/**
 * Validator for a Full Generated Plan
 */
const generatedPlanSchema = z.object({
  days: z.array(generatedDaySchema).length(7, "A plan must have exactly 7 days"),
  groceryItems: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    category: z.string().default("General"),
  })),
});

module.exports = {
  preferencesSchema,
  generatedPlanSchema,
};
