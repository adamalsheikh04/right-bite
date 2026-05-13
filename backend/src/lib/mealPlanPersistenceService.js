/**
 * Service for database persistence of meal plans
 */
const prisma = require("./prisma");

/**
 * Saves a full meal plan structure in a single transaction
 * @param {number} userId - ID of the user
 * @param {number} preferenceId - ID of the preferences used
 * @param {Array} days - List of day objects with nested meals
 * @param {Array} groceryItems - List of grocery items
 * @param {object} metadata - Extra metadata (generationMode, etc.)
 * @returns {object} - The created meal plan
 */
async function saveFullPlan(userId, preferenceId, days, groceryItems, metadata = {}) {
  // Use explicit transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Archive previous active plans
    await tx.mealPlan.updateMany({
      where: { userId, status: "active" },
      data: { status: "archived" },
    });

    // 2. Set week dates (default to next 7 days)
    const now = new Date();
    const weekStart = new Date(now);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 3. Create the plan with nested associations
    const plan = await tx.mealPlan.create({
      data: {
        userId: Number(userId),
        preferenceId: Number(preferenceId),
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        status: "active",
        generatedByModel: metadata.generatedByModel || "template_v1",
        generationMode: metadata.generationMode || "template",
        generationNotes: metadata.generationNotes || "",
        failureReason: metadata.failureReason || null,
        promptVersion: metadata.promptVersion || null,
        days: {
          create: days.map((day) => ({
            dayName: day.dayName,
            dayOrder: day.dayOrder,
            totalCalories: day.totalCalories,
            totalProteinG: day.totalProteinG,
            totalCarbsG: day.totalCarbsG,
            totalFatG: day.totalFatG,
            meals: {
              create: day.meals.map((meal) => ({
                mealType: meal.mealType,
                mealOrder: meal.mealOrder,
                mealName: meal.mealName,
                description: meal.description,
                ingredientsText: meal.ingredientsText,
                calories: meal.calories,
                proteinG: meal.proteinG,
                carbsG: meal.carbsG,
                fatG: meal.fatG,
              })),
            },
          })),
        },
        groceryItems: {
          create: groceryItems.map((item) => ({
            itemName: item.name,
            quantityText: item.quantity,
            category: item.category,
            isChecked: false,
            isUserAdded: false,
          })),
        },
      },
      include: {
        days: {
          orderBy: { dayOrder: "asc" },
          include: { meals: { orderBy: { mealOrder: "asc" } } }
        },
        groceryItems: { orderBy: { createdAt: "asc" } },
      },
    });

    return plan;
  });
}

/**
 * Fetch the user's latest active plan
 * @param {number} userId 
 */
async function getActivePlan(userId) {
  return await prisma.mealPlan.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { dayOrder: "asc" },
        include: { meals: { orderBy: { mealOrder: "asc" } } },
      },
      groceryItems: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Fetch user's plan history (metadata only)
 * @param {number} userId 
 */
async function getPlanHistory(userId) {
  return await prisma.mealPlan.findMany({
    where: { userId, status: "archived" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      weekStartDate: true,
      weekEndDate: true,
      createdAt: true,
      generatedByModel: true,
      generationMode: true,
    },
  });
}

/**
 * Fetch a specific plan by ID for a user
 * @param {number} userId 
 * @param {number} planId 
 */
async function getPlanById(userId, planId) {
  return await prisma.mealPlan.findFirst({
    where: { id: planId, userId },
    include: {
      days: {
        orderBy: { dayOrder: "asc" },
        include: { meals: { orderBy: { mealOrder: "asc" } } },
      },
      groceryItems: { orderBy: { createdAt: "asc" } },
    },
  });
}

module.exports = {
  saveFullPlan,
  getActivePlan,
  getPlanHistory,
  getPlanById,
};
