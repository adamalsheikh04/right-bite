/**
 * Service for extracting grocery lists from meal plans
 */

const CATEGORY_MAP = {
  // Protein
  "chicken": "🥩 Protein", "beef": "🥩 Protein", "pork": "🥩 Protein", "fish": "🥩 Protein", "salmon": "🥩 Protein", "tuna": "🥩 Protein", "egg": "🥩 Protein", "tofu": "🥩 Protein", "steak": "🥩 Protein", "turkey": "🥩 Protein",
  // Produce
  "apple": "🥦 Produce", "banana": "🥦 Produce", "broccoli": "🥦 Produce", "spinach": "🥦 Produce", "onion": "🥦 Produce", "garlic": "🥦 Produce", "tomato": "🥦 Produce", "carrot": "🥦 Produce", "lettuce": "🥦 Produce", "pepper": "🥦 Produce", "potato": "🥦 Produce", "lemon": "🥦 Produce", "lime": "🥦 Produce",
  // Dairy
  "milk": "🧀 Dairy & Eggs", "cheese": "🧀 Dairy & Eggs", "yogurt": "🧀 Dairy & Eggs", "butter": "🧀 Dairy & Eggs",
  // Grains
  "bread": "🍞 Grains", "rice": "🍞 Grains", "pasta": "🍞 Grains", "oats": "🍞 Grains", "flour": "🍞 Grains", "tortilla": "🍞 Grains", "quinoa": "🍞 Grains",
  // Pantry
  "oil": "🥫 Pantry", "sauce": "🥫 Pantry", "vinegar": "🥫 Pantry", "salt": "🥫 Pantry", "sugar": "🥫 Pantry", "spice": "🥫 Pantry", "nuts": "🥫 Pantry"
};

function getCategoryFor(itemName) {
  const lowerItemName = itemName.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lowerItemName.includes(keyword)) {
      return category;
    }
  }
  return "🏷️ General";
}

/**
 * Extracts and deduplicates grocery items from a list of days/meals
 * @param {Array} days - List of day objects with nested meals
 * @returns {Array} - Deduped list of grocery items
 */
function extractGroceryItems(days) {
  const ingredientMap = new Map();

  for (const day of days) {
    for (const meal of day.meals) {
      if (!meal.ingredientsText) continue;

      const items = meal.ingredientsText.split(",").map((i) => i.trim());
      for (const item of items) {
        if (item && !ingredientMap.has(item.toLowerCase())) {
          ingredientMap.set(item.toLowerCase(), {
            name: item,
            quantity: "As needed", // Default for now
            category: getCategoryFor(item),
          });
        }
      }
    }
  }

  return Array.from(ingredientMap.values());
}

module.exports = {
  extractGroceryItems,
};
