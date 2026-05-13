/**
 * Service for selecting eligible meals from the bank
 */
const { MEAL_BANK } = require("./mealBank");

/**
 * Filter the meal bank based on user preferences
 * @param {string} type - Meal type (Breakfast, Lunch, etc.)
 * @param {object} preferences - User preferences object
 * @returns {Array} - List of eligible meals
 */
function getEligibleMeals(type, preferences) {
  const proteinSources = preferences.proteinSourcesJson
    ? JSON.parse(preferences.proteinSourcesJson)
    : [];
  const avoidText = (preferences.avoidFoodsText || "").toLowerCase();
  const cuisineStyle = preferences.cuisineStyle || "mixed";
  const effortPref = preferences.cookingEffort || "any";

  return MEAL_BANK.filter((m) => {
    // Basic type check
    if (m.type !== type) return false;

    // 1. Avoid Foods filter
    if (avoidText) {
      const ingredients = m.ingredients.toLowerCase();
      // Simple string inclusion check (can be improved later)
      const avoidList = avoidText.split(",").map(i => i.trim()).filter(i => i !== "");
      if (avoidList.some(avoid => ingredients.includes(avoid))) {
        return false;
      }
    }

    // 2. Cooking Effort filter
    if (effortPref !== "any" && m.effort !== effortPref) {
      return false;
    }

    // 3. Cuisine Style filter (mixed means no filter)
    if (cuisineStyle !== "mixed" && m.cuisine !== cuisineStyle && m.cuisine !== "mixed") {
      return false;
    }

    // 4. Protein Sources filter
    // If user selected specific sources, we filter to meals that match OR have NO specific protein tags (generic)
    if (proteinSources.length > 0) {
      const mealProteins = m.proteins || [];
      if (mealProteins.length > 0) {
        const matches = mealProteins.some((p) => proteinSources.includes(p));
        if (!matches) return false;
      }
    }

    return true;
  });
}

/**
 * Ensures a pool has enough variety; falls back to full bank if too few options
 * @param {string} type - Meal type
 * @param {object} preferences - User preferences
 * @returns {Array} - Final filtered pool
 */
function getFilteredPool(type, preferences) {
  let pool = getEligibleMeals(type, preferences);
  
  // Fallback if pool is too small to ensure variety across 7 days
  if (pool.length < 3) {
    pool = MEAL_BANK.filter((m) => m.type === type);
  }
  
  return pool;
}

module.exports = {
  getFilteredPool,
};
