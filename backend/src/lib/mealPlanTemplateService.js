/**
 * Service for generating the 7-day plan structure and scaling macros
 */
const { DAYS } = require("./mealBank");
const { getFilteredPool } = require("./mealPlanSelectorService");

/**
 * Generates a 7-day plan based on preferences and profile targets
 * @param {object} preferences - User preferences
 * @param {object} profile - User profile (with targetCalories)
 * @returns {Array} - Array of 7 day objects with scaled meals
 */
function generateTemplatePlan(preferences, profile) {
  const mealsPerDay = preferences.mealsPerDay || 3;
  const targetCalories = profile?.targetCalories || 2000;

  // Determine which meal types to use based on frequency
  const mealTypes =
    mealsPerDay >= 4
      ? ["Breakfast", "Lunch", "Dinner", "Snack"]
      : ["Breakfast", "Lunch", "Dinner"];

  // Pre-fetch filtered pools for each type
  const poolByType = {};
  for (const type of mealTypes) {
    poolByType[type] = getFilteredPool(type, preferences);
  }

  // Calculate target calories per meal
  const caloriesPerMeal = Math.round(targetCalories / mealTypes.length);

  // Build 7 days
  const days = DAYS.map((dayName, dayIndex) => {
    const meals = [];
    let order = 1;

    for (const type of mealTypes) {
      const pool = poolByType[type];
      // Pick meal from pool (rotation for basic variety)
      const picked = pool[dayIndex % pool.length];

      // Scale factor: ratio of daily target per meal to the template meal's base calories
      const scale = caloriesPerMeal / (picked.calories || 1);

      const scaledMeal = {
        mealType: type,
        mealOrder: order++,
        mealName: picked.name,
        description: "",
        ingredientsText: picked.ingredients,
        calories: Math.round(picked.calories * scale),
        proteinG: Math.round(picked.protein * scale),
        carbsG: Math.round(picked.carbs * scale),
        fatG: Math.round(picked.fat * scale),
      };
      meals.push(scaledMeal);
    }

    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProteinG = meals.reduce((s, m) => s + m.proteinG, 0);
    const totalCarbsG = meals.reduce((s, m) => s + m.carbsG, 0);
    const totalFatG = meals.reduce((s, m) => s + m.fatG, 0);

    return {
      dayName,
      dayOrder: dayIndex + 1,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      meals,
    };
  });

  return days;
}

module.exports = {
  generateTemplatePlan,
};
