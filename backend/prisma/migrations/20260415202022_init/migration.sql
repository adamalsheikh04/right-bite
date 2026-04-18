-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "heightCm" REAL NOT NULL,
    "currentWeightKg" REAL NOT NULL,
    "targetWeightKg" REAL,
    "goal" TEXT NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "primaryDietaryStyle" TEXT NOT NULL,
    "allergiesText" TEXT NOT NULL,
    "dislikedFoodsText" TEXT NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "targetProteinG" INTEGER NOT NULL,
    "targetCarbsG" INTEGER NOT NULL,
    "targetFatG" INTEGER NOT NULL,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "loggedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlanPreference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "proteinSourcesJson" TEXT NOT NULL,
    "avoidFoodsText" TEXT NOT NULL,
    "cookingEffort" TEXT NOT NULL,
    "budgetLevel" TEXT NOT NULL,
    "cuisineStyle" TEXT NOT NULL,
    "varietyLevel" TEXT NOT NULL,
    "extraNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlanPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "preferenceId" INTEGER NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "weekEndDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "generatedByModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealPlan_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "MealPlanPreference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlanDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealPlanId" INTEGER NOT NULL,
    "dayName" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "totalCalories" INTEGER NOT NULL,
    "totalProteinG" INTEGER NOT NULL,
    "totalCarbsG" INTEGER NOT NULL,
    "totalFatG" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlanDay_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlanMeal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealPlanDayId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "mealOrder" INTEGER NOT NULL,
    "mealName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ingredientsText" TEXT NOT NULL,
    "estimatedWeightG" REAL,
    "calories" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlanMeal_mealPlanDayId_fkey" FOREIGN KEY ("mealPlanDayId") REFERENCES "MealPlanDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealPlanId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantityText" TEXT NOT NULL,
    "category" TEXT,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "isUserAdded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroceryItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "mealName" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "estimatedWeightG" REAL,
    "photoPath" TEXT,
    "loggedDate" DATETIME NOT NULL,
    "loggedTime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiRecommendation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "recommendationText" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "basedOnDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
