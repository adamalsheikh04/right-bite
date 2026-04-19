const prisma = require('./prisma');

/**
 * Bridges a planned meal into the daily tracker logs.
 * @param {number} userId 
 * @param {number} mealPlanMealId 
 */
async function logPlannedMeal(userId, mealPlanMealId) {
  // 1. Fetch the meal and verify ownership
  const meal = await prisma.mealPlanMeal.findUnique({
    where: { id: mealPlanMealId },
    include: {
      mealPlanDay: {
        include: {
          mealPlan: true
        }
      }
    }
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  if (meal.mealPlanDay.mealPlan.userId !== userId) {
    throw new Error("Access denied");
  }

  // 2. Create the MealLog entry for today
  const now = new Date();
  
  const mealLog = await prisma.mealLog.create({
    data: {
      userId,
      mealType: meal.mealType,
      source: "planned",
      mealName: meal.mealName,
      description: meal.ingredientsText || meal.description || "",
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      estimatedWeightG: meal.estimatedWeightG,
      loggedDate: now,
      loggedTime: now,
    }
  });

  return mealLog;
}

module.exports = {
  logPlannedMeal,
};
