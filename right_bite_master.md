# Right Bite — Master Project File
> **Generated:** April 2026 | **Version:** Phase 2 Complete (Planning System Polish)
> **Purpose:** Single source of truth for ChatGPT Business / cross-AI context

---

## 1. Project Overview

**Right Bite** is a mobile-first web application for AI-powered meal planning and nutrition tracking.

### Mission
Help users understand exactly how many calories and macronutrients they need, track what they eat daily, plan their weekly meals intelligently, and monitor their body weight progress over time — all in one place.

### Core Features (Implemented)
- User registration and login with JWT authentication
- **[New]** Centralized Zod-based validation layer for all inputs
- **[New]** Standardized API response envelope `{ status, data }`
- Personal profile with auto-calculated calorie and macro targets
- Daily meal logging with real-time dashboard tracking
- Body weight logging with trend chart
- Weekly meal planning wizard (Service-oriented architecture)
- Auto-generated grocery list with categorization
- **[New]** Plan history & dynamic weekly view
- **[New]** 1-Click logging bridge from planned meals

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Logic | Standardized Hooks + Context |
| Backend | Node.js + Express 5 |
| Validation | Zod |
| Database | SQLite via Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcrypt |

---

## 2. System Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend (Vite)          │
│  /dashboard (Totals + Progress)          │
│  /profile   (Calculation + Targets)      │
│  /weekly-plan (Wizard + Plan View)
│  /plan-history (Archived Plans)       │
│                                          │
│  AuthContext (JWT + User State)          │
└────────────────┬────────────────────────┘
                 │ Clean API Calls
                 │ Shape: { status, data: { ... } }
┌────────────────▼────────────────────────┐
│         Node.js / Express Backend        │
│                                          │
│  Routes: /auth, /profile, /meals,        │
│          /weight, /meal-plan             │
│                                          │
│  Middleware:                             │
│  - authMiddleware (JWT Verification)     │
│  - validateRequest (Zod Validation)      │
│  - errorHandler (Centralized Catch)      │
│                                          │
│  Services (Business Logic):              │
│  - mealPlanTemplateService
│  - mealLogBridgeService               │
│  - mealPlanSelectorService               │
│  - mealPlanPersistenceService            │
│  - mealPlanGroceryService                │
│  - nutritionCalculator                   │
└────────────────┬────────────────────────┘
                 │ Prisma Client (ORM)
┌────────────────▼────────────────────────┐
│         SQLite Database (dev.db)         │
└─────────────────────────────────────────┘
```

---

## 3. Completed Steps Summary
Implemented a stable, service-oriented architecture with Zod validation, standardized API responses, atomic meal plan generation, plan history, 1-click meal logging, and categorized groceries.

---


## 4. Full Codebase

### `backend/prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model User {
  id                Int                   @id @default(autoincrement())
  email             String                @unique
  passwordHash      String
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt

  profile           Profile?
  weightLogs        WeightLog[]
  mealPlanPrefs     MealPlanPreference[]
  mealPlans         MealPlan[]
  mealLogs          MealLog[]
  aiRecommendations AiRecommendation[]
}

model Profile {
  id                   Int      @id @default(autoincrement())
  userId               Int      @unique
  fullName             String
  age                  Int
  sex                  String
  heightCm             Float
  currentWeightKg      Float
  targetWeightKg       Float?
  goal                 String
  activityLevel        String
  primaryDietaryStyle  String
  allergiesText        String
  dislikedFoodsText    String
  targetCalories       Int
  targetProteinG       Int
  targetCarbsG         Int
  targetFatG           Int
  manualOverride       Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WeightLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  weightKg  Float
  loggedAt  DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model MealPlanPreference {
  id                 Int      @id @default(autoincrement())
  userId             Int
  mealsPerDay        Int
  proteinSourcesJson String
  avoidFoodsText     String
  cookingEffort      String
  budgetLevel        String
  cuisineStyle       String
  varietyLevel       String
  extraNotes         String?
  createdAt          DateTime @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  mealPlans MealPlan[]
}

model MealPlan {
  id               Int      @id @default(autoincrement())
  userId           Int
  preferenceId     Int
  weekStartDate    DateTime
  weekEndDate      DateTime
  status           String
  generatedByModel String?
  generationMode   String?
  generationNotes  String?
  failureReason    String?
  promptVersion    String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  preference   MealPlanPreference @relation(fields: [preferenceId], references: [id], onDelete: Cascade)
  days         MealPlanDay[]
  groceryItems GroceryItem[]
}

model MealPlanDay {
  id            Int      @id @default(autoincrement())
  mealPlanId    Int
  dayName       String
  dayOrder      Int
  totalCalories Int
  totalProteinG Int
  totalCarbsG   Int
  totalFatG     Int
  createdAt     DateTime @default(now())

  mealPlan MealPlan      @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  meals    MealPlanMeal[]
}

model MealPlanMeal {
  id               Int      @id @default(autoincrement())
  mealPlanDayId    Int
  mealType         String
  mealOrder        Int
  mealName         String
  description      String
  ingredientsText  String
  estimatedWeightG Float?
  calories         Int
  proteinG         Int
  carbsG           Int
  fatG             Int
  createdAt        DateTime @default(now())

  mealPlanDay MealPlanDay @relation(fields: [mealPlanDayId], references: [id], onDelete: Cascade)
}

model GroceryItem {
  id           Int      @id @default(autoincrement())
  mealPlanId   Int
  itemName     String
  quantityText String
  category     String?
  isChecked    Boolean  @default(false)
  isUserAdded  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  mealPlan MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
}

model MealLog {
  id               Int      @id @default(autoincrement())
  userId           Int
  mealType         String
  source           String
  mealName         String
  description      String?
  calories         Int
  proteinG         Int
  carbsG           Int
  fatG             Int
  estimatedWeightG Float?
  photoPath        String?
  loggedDate       DateTime
  loggedTime       DateTime
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AiRecommendation {
  id                 Int      @id @default(autoincrement())
  userId             Int
  recommendationText String
  recommendationType String
  basedOnDate        DateTime
  createdAt          DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### `backend/package.json`
```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node src/server.js",
    "dev": "node src/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@prisma/adapter-better-sqlite3": "^7.7.0",
    "@prisma/client": "^7.7.0",
    "bcrypt": "^6.0.0",
    "better-sqlite3": "^12.9.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "prisma": "^7.7.0",
    "zod": "^4.3.6"
  }
}

```

### `backend/src/server.js`
```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mealRoutes = require("./routes/mealRoutes");
const weightRoutes = require("./routes/weightRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const errorHandler = require("./middleware/errorHandler");
const { sendSuccess } = require("./lib/responseHelper");

const app = express();
const PORT = 5000;

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", mealRoutes);
app.use("/api", weightRoutes);
app.use("/api", mealPlanRoutes);

app.get("/", (req, res) => {
  sendSuccess(res, { message: "Right Bite backend is running" });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
// Catches any error passed via next(error) and returns clean JSON
// Must be the LAST middleware defined
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### `backend/src/middleware/authMiddleware.js`
```javascript
const jwt = require("jsonwebtoken");
const { sendError } = require("../lib/responseHelper");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Not authorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

module.exports = authMiddleware;

```

### `backend/src/middleware/validateRequest.js`
```javascript
/**
 * Zod validation middleware for Express
 */
const { ZodError } = require("zod");
const { sendError } = require("../lib/responseHelper");

/**
 * Validates request body against a Zod schema
 * @param {import("zod").ZodSchema} schema - The Zod schema to validate against
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // Check for Zod error by name or instance
    if (error.name === "ZodError" || error instanceof ZodError) {
      const issues = error.errors || error.issues || [];
      const message = issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");
      return sendError(res, message || "Validation failed", 400);
    }
    next(error);
  }
};

module.exports = validateRequest;

```

### `backend/src/lib/prisma.js`
```javascript
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
```

### `backend/src/lib/responseHelper.js`
```javascript
/**
 * Standardized response helpers for Right Bite
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {any} data - Data to send to client
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    data
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 */
const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    status: "error",
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};

```

### `backend/src/lib/nutritionCalculator.js`
```javascript
/**
 * Calculates nutritional targets using the Mifflin-St Jeor formula.
 */
function calculateTargets({ age, sex, heightCm, currentWeightKg, goal, activityLevel }) {
  // 1. Calculate BMR
  let bmr;
  if (sex.toLowerCase() === "male") {
    bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // 2. TDEE Activity Multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Adjustment
  let targetCalories = tdee;
  if (goal.toLowerCase() === "lose") {
    targetCalories = tdee - 500;
  } else if (goal.toLowerCase() === "gain") {
    targetCalories = tdee + 500;
  }

  // Ensure minimum safe calories (standard guideline)
  const minCalories = sex.toLowerCase() === "male" ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCalories);

  // 4. Macro Calculation (30/40/30 split)
  // Protein: 30%, Carbs: 40%, Fat: 30%
  // Calorie per gram: Protein (4), Carbs (4), Fat (9)
  const targetProteinG = Math.round((targetCalories * 0.3) / 4);
  const targetCarbsG = Math.round((targetCalories * 0.4) / 4);
  const targetFatG = Math.round((targetCalories * 0.3) / 9);

  return {
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

module.exports = { calculateTargets };

```

### `backend/src/lib/validators/authValidator.js`
```javascript
const { z } = require("zod");

/**
 * Validator for User Registration
 */
const registerSchema = z.object({
  email: z.string().trim().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").min(1, "Password is required"),
});

/**
 * Validator for User Login
 */
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};

```

### `backend/src/lib/validators/profileValidator.js`
```javascript
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

```

### `backend/src/lib/validators/mealValidator.js`
```javascript
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

```

### `backend/src/lib/validators/weightValidator.js`
```javascript
const { z } = require("zod");

/**
 * Validator for Weight Logging
 */
const weightLogSchema = z.object({
  weightKg: z.coerce.number().min(20, "Weight must be at least 20kg").max(500, "Weight exceeds realistic limits"),
  loggedAt: z.string().optional(), // Used for past logs if supported later
});

module.exports = {
  weightLogSchema,
};

```

### `backend/src/lib/validators/mealPlanValidator.js`
```javascript
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

```

### `backend/src/lib/mealPlanTemplateService.js`
```javascript
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

```

### `backend/src/lib/mealPlanSelectorService.js`
```javascript
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

```

### `backend/src/lib/mealPlanPersistenceService.js`
```javascript
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

```

### `backend/src/lib/mealPlanGroceryService.js`
```javascript
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

```

### `backend/src/lib/mealLogBridgeService.js`
```javascript
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

```

### `backend/src/routes/authRoutes.js`
```javascript
const express = require("express");
const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../lib/validators/authValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, "An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, passwordHash: hashedPassword },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, {
      token,
      user: { id: newUser.id, email: newUser.email },
    }, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return sendError(res, "Invalid email or password", 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, {
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, createdAt: true, profile: true },
    });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### `backend/src/routes/profileRoutes.js`
```javascript
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
    } = req.body;

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

```

### `backend/src/routes/mealRoutes.js`
```javascript
const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { mealLogSchema } = require("../lib/validators/mealValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get start and end of today in UTC
// ─────────────────────────────────────────────────────────────────────────────
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { startOfDay, endOfDay };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meals — Log a new meal
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meals", authMiddleware, validateRequest(mealLogSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { mealName, mealType, calories, proteinG, carbsG, fatG, description } = req.body;

    const now = new Date();
    const meal = await prisma.mealLog.create({
      data: {
        userId,
        mealName,
        mealType,
        description: description || "",
        calories: Math.round(calories),
        proteinG: Math.round(proteinG),
        carbsG: Math.round(carbsG),
        fatG: Math.round(fatG),
        source: "manual",
        loggedDate: now,
        loggedTime: now,
      },
    });

    return sendSuccess(res, meal, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meals/today — Get today's meals + aggregated totals
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meals/today", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const meals = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { loggedDate: "asc" },
    });

    const summary = meals.reduce(
      (acc, meal) => {
        acc.totalCalories += meal.calories;
        acc.totalProteinG += meal.proteinG;
        acc.totalCarbsG += meal.carbsG;
        acc.totalFatG += meal.fatG;
        return acc;
      },
      { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
    );

    return sendSuccess(res, { summary, meals });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/meals/:id — Delete a meal (ownership enforced)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/meals/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const mealId = Number(req.params.id);

    if (isNaN(mealId)) {
      return sendError(res, "Invalid meal ID", 400);
    }

    const meal = await prisma.mealLog.findUnique({ where: { id: mealId } });

    if (!meal) {
      return sendError(res, "Meal not found", 404);
    }
    if (meal.userId !== userId) {
      return sendError(res, "You are not authorized to delete this meal", 403);
    }

    await prisma.mealLog.delete({ where: { id: mealId } });
    return sendSuccess(res, { message: "Meal deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

```

### `backend/src/routes/weightRoutes.js`
```javascript
const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { weightLogSchema } = require("../lib/validators/weightValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get start and end of today in UTC
// ─────────────────────────────────────────────────────────────────────────────
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { startOfDay, endOfDay };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/weight — Log today's weight (upsert: one entry per UTC day)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/weight", authMiddleware, validateRequest(weightLogSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { weightKg } = req.body;

    const { startOfDay, endOfDay } = getTodayRange();
    const now = new Date();

    const existingLog = await prisma.weightLog.findFirst({
      where: { userId, loggedAt: { gte: startOfDay, lte: endOfDay } },
    });

    let log;
    if (existingLog) {
      log = await prisma.weightLog.update({
        where: { id: existingLog.id },
        data: { weightKg },
      });
    } else {
      log = await prisma.weightLog.create({
        data: { userId, weightKg, loggedAt: now },
      });
    }

    return sendSuccess(res, log);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/weight — Get all weight logs for the user (newest first)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/weight", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
    });
    return sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/weight/:id — Delete a weight log (ownership enforced)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/weight/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const logId = Number(req.params.id);

    if (isNaN(logId)) {
      return sendError(res, "Invalid weight log ID", 400);
    }

    const log = await prisma.weightLog.findUnique({ where: { id: logId } });

    if (!log) {
      return sendError(res, "Weight log not found", 404);
    }
    if (log.userId !== userId) {
      return sendError(res, "You are not authorized to delete this entry", 403);
    }

    await prisma.weightLog.delete({ where: { id: logId } });
    return sendSuccess(res, { message: "Weight log deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

```

### `backend/src/routes/mealPlanRoutes.js`
```javascript
const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { preferencesSchema } = require("../lib/validators/mealPlanValidator");
const { sendSuccess, sendError } = require("../lib/responseHelper");

// Services
const { generateTemplatePlan } = require("../lib/mealPlanTemplateService");
const { extractGroceryItems } = require("../lib/mealPlanGroceryService");
const { saveFullPlan, getActivePlan, getPlanHistory, getPlanById } = require("../lib/mealPlanPersistenceService");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/preferences — Save (upsert) wizard preferences
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/preferences", authMiddleware, validateRequest(preferencesSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      mealsPerDay,
      proteinSources,
      avoidFoodsText,
      cookingEffort,
      budgetLevel,
      cuisineStyle,
      varietyLevel,
      extraNotes,
    } = req.body;

    // Upsert: one preferences record per user (update if exists)
    const existing = await prisma.mealPlanPreference.findFirst({ where: { userId } });

    const data = {
      userId,
      mealsPerDay,
      proteinSourcesJson: JSON.stringify(proteinSources),
      avoidFoodsText,
      cookingEffort,
      budgetLevel,
      cuisineStyle,
      varietyLevel,
      extraNotes,
    };

    let preference;
    if (existing) {
      preference = await prisma.mealPlanPreference.update({ where: { id: existing.id }, data });
    } else {
      preference = await prisma.mealPlanPreference.create({ data });
    }

    return sendSuccess(res, preference);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/generate — Generate a 7-day template plan
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/generate", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 1. Fetch latest preferences and profile
    const preference = await prisma.mealPlanPreference.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (!preference) {
      return sendError(res, "Please complete the meal wizard first", 400);
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return sendError(res, "Please complete your profile first", 400);
    }

    // 2. Generate plan structure using Template Service
    const days = generateTemplatePlan(preference, profile);

    // 3. Extract grocery list using Grocery Service
    const groceryItems = extractGroceryItems(days);

    // 4. Save to DB using Persistence Service (Atomic Transaction)
    const plan = await saveFullPlan(userId, preference.id, days, groceryItems, {
      generationMode: "template",
      generatedByModel: "template_v1",
      generationNotes: "Initial template-based generation"
    });

    return sendSuccess(res, plan, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/latest — Get the user's current active plan
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/latest", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const plan = await getActivePlan(userId);

    if (!plan) {
      return sendError(res, "No active meal plan found", 404);
    }

    return sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/history — Get all archived plans
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/history", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const plans = await getPlanHistory(userId);
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/:id — Get a specific plan by ID
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.id);

    if (isNaN(planId)) return next();

    const plan = await getPlanById(userId, planId);
    if (!plan) {
      return sendError(res, "Meal plan not found or access denied", 404);
    }
    return sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/meal/:mealId/log — Log a planned meal directly to tracker
// ─────────────────────────────────────────────────────────────────────────────
const { logPlannedMeal } = require("../lib/mealLogBridgeService");

router.post("/meal-plan/meal/:mealId/log", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const mealId = Number(req.params.mealId);

    const loggedMeal = await logPlannedMeal(userId, mealId);
    return sendSuccess(res, loggedMeal, 201);
  } catch (error) {
    if (error.message === "Meal not found") {
      return sendError(res, error.message, 404);
    }
    if (error.message === "Access denied") {
      return sendError(res, error.message, 403);
    }
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/meal-plan/:planId/groceries — Get all grocery items for a plan
// ─────────────────────────────────────────────────────────────────────────────
router.get("/meal-plan/:planId/groceries", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.planId);

    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const items = await prisma.groceryItem.findMany({
      where: { mealPlanId: planId },
      orderBy: [{ isChecked: "asc" }, { createdAt: "asc" }],
    });

    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meal-plan/:planId/groceries — Add a custom grocery item
// ─────────────────────────────────────────────────────────────────────────────
router.post("/meal-plan/:planId/groceries", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const planId = Number(req.params.planId);
    const { itemName, quantityText, category } = req.body;

    if (!itemName || !itemName.trim()) {
      return sendError(res, "Item name is required", 400);
    }

    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const item = await prisma.groceryItem.create({
      data: {
        mealPlanId: planId,
        itemName: itemName.trim(),
        quantityText: quantityText || "",
        category: category || "General",
        isChecked: false,
        isUserAdded: true,
      },
    });

    return sendSuccess(res, item, 201);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/meal-plan/:planId/groceries/:itemId — Toggle isChecked
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/meal-plan/:planId/groceries/:itemId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { mealPlan: true },
    });

    if (!item || item.mealPlan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: { isChecked: !item.isChecked },
    });

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/meal-plan/:planId/groceries/:itemId — Delete an item
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/meal-plan/:planId/groceries/:itemId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const itemId = Number(req.params.itemId);

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { mealPlan: true },
    });

    if (!item) {
      return sendError(res, "Item not found", 404);
    }
    if (item.mealPlan.userId !== userId) {
      return sendError(res, "Access denied", 403);
    }

    await prisma.groceryItem.delete({ where: { id: itemId } });
    return sendSuccess(res, { message: "Item deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

```

### `frontend/package.json`
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.14.1",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "vite": "^8.0.4"
  }
}

```

### `frontend/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

### `frontend/src/main.jsx`
```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `frontend/src/index.css`
```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}

```

### `frontend/src/App.jsx`
```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MealWizardPage from "./pages/MealWizardPage";
import WeeklyPlanPage from "./pages/WeeklyPlanPage";
import PlanHistoryPage from "./pages/PlanHistoryPage";
import GroceryPage from "./pages/GroceryPage";
import LogMealPage from "./pages/LogMealPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/meal-wizard" element={<ProtectedRoute><MealWizardPage /></ProtectedRoute>} />
        <Route path="/weekly-plan" element={<ProtectedRoute><WeeklyPlanPage /></ProtectedRoute>} />
        <Route path="/plan-history" element={<ProtectedRoute><PlanHistoryPage /></ProtectedRoute>} />
        <Route path="/groceries" element={<ProtectedRoute><GroceryPage /></ProtectedRoute>} />
        <Route path="/log-meal" element={<ProtectedRoute><LogMealPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### `frontend/src/context/AuthContext.jsx`
```javascript
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");
    if (token) {
      checkUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function checkUser(token) {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setUser(json.data);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

```

### `frontend/src/components/ProtectedRoute.jsx`
```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

```

### `frontend/src/pages/LoginPage.jsx`
```javascript
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.data.token);
      login(data.data.user, data.data.token);

      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleLogin}>Login</button>

      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;
```

### `frontend/src/pages/RegisterPage.jsx`
```javascript
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Registered successfully");
      login(data.data.user, data.data.token);
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button onClick={handleRegister}>Register</button>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
```

### `frontend/src/pages/DashboardPage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Sub-component: Progress Bar ─────────────────────────────────────────────
function MacroBar({ label, consumed, target, unit = "g", color }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const exceeded = consumed > target && target > 0;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#333" }}>{label}</span>
        <span style={{ color: exceeded ? "#e53e3e" : "#555" }}>
          {consumed}{unit} / {target}{unit}
          {exceeded && <span style={{ color: "#e53e3e", fontWeight: 700 }}> (+{consumed - target}{unit})</span>}
        </span>
      </div>
      <div style={{ height: 10, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: exceeded ? "#e53e3e" : color,
            borderRadius: 99,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Sub-component: Calorie Summary Card ─────────────────────────────────────
function CalorieSummary({ consumed, target }) {
  const remaining = target - consumed;
  const exceeded = remaining < 0;

  return (
    <div style={{
      background: exceeded ? "#fff5f5" : "#f0fff4",
      border: `1px solid ${exceeded ? "#fc8181" : "#68d391"}`,
      borderRadius: 12,
      padding: "20px",
      marginBottom: 20,
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: 13, color: "#666", marginBottom: 4 }}>
        {exceeded ? "⚠️ Daily Calorie Target Exceeded" : "🔥 Calories Today"}
      </p>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: exceeded ? "#e53e3e" : "#276749" }}>
            {consumed}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Consumed</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#4a5568" }}>
            {target}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Target</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: exceeded ? "#e53e3e" : "#2b6cb0" }}>
            {exceeded ? `+${Math.abs(remaining)}` : remaining}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
            {exceeded ? "Over Target" : "Remaining"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState({ totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 });
  const [todayMeals, setTodayMeals] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // inline confirm state

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("token");
      if (!token) { setDataLoading(false); return; }

      try {
        const [profileRes, mealsRes, weightRes] = await Promise.all([
          fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/meals/today", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/weight", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.data);
        }

        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();
          setTodaySummary(mealsData.data.summary);
          setTodayMeals(mealsData.data.meals);
        }

        if (weightRes.ok) {
          const weightData = await weightRes.json();
          setWeightLogs(weightData.data || []);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setDataLoading(false);
      }
    }

    if (!authLoading) fetchDashboardData();
  }, [authLoading]);

  const handleDeleteMeal = async (mealId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${mealId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        const mealsRes = await fetch("http://localhost:5000/api/meals/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mealsRes.ok) {
          const data = await mealsRes.json();
          setTodaySummary(data.data.summary);
          setTodayMeals(data.data.meals);
        }
      }
    } catch (err) {
      console.error("Delete meal error:", err);
    }
  };

  if (authLoading || dataLoading) return <div style={{ padding: 20 }}>Loading your dashboard...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not Logged In</h2>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  // If user hasn't set profile, show a prompt instead of broken data
  if (!profile) {
    return (
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 14, color: "#555" }}>Logged in as <strong>{user.email}</strong></span>
          <button onClick={logout} style={{ background: "#e53e3e", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Logout</button>
        </div>
        <div style={{ background: "#fffbeb", border: "1px solid #f6ad55", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px" }}>🙋 Profile Not Set Up</h3>
          <p style={{ color: "#666", marginBottom: 16 }}>Complete your profile so we can calculate your daily targets.</p>
          <button
            onClick={() => navigate("/profile")}
            style={{ background: "#f6ad55", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const targets = {
    calories: profile.targetCalories || 0,
    proteinG: profile.targetProteinG || 0,
    carbsG: profile.targetCarbsG || 0,
    fatG: profile.targetFatG || 0,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Welcome, {profile.fullName || user.email}
          </p>
        </div>
        <button
          onClick={logout}
          style={{ background: "#e53e3e", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          Logout
        </button>
      </div>

      {/* Calorie Summary Card */}
      <CalorieSummary
        consumed={todaySummary.totalCalories}
        target={targets.calories}
      />

      {/* Macro Progress Bars */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Macros</h4>
        <MacroBar label="Protein" consumed={todaySummary.totalProteinG} target={targets.proteinG} color="#4299e1" />
        <MacroBar label="Carbs" consumed={todaySummary.totalCarbsG} target={targets.carbsG} color="#ed8936" />
        <MacroBar label="Fat" consumed={todaySummary.totalFatG} target={targets.fatG} color="#9f7aea" />
      </div>

      {/* Weight Widget */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>⚖️ Weight</h4>
          <button
            onClick={() => navigate("/progress")}
            style={{ background: "none", border: "1px solid #4299e1", color: "#4299e1", padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
          >
            Update Weight
          </button>
        </div>
        {weightLogs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#a0aec0" }}>No weight logged yet. <span style={{ textDecoration: "underline", cursor: "pointer", color: "#4299e1" }} onClick={() => navigate("/progress")}>Log now →</span></p>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#2d3748" }}>
              {weightLogs[0].weightKg} <span style={{ fontSize: 14, fontWeight: 500, color: "#888" }}>kg</span>
            </p>
            {weightLogs.length >= 2 && (() => {
              const delta = +(weightLogs[0].weightKg - weightLogs[1].weightKg).toFixed(1);
              const positive = delta > 0;
              return (
                <p style={{ margin: 0, fontSize: 14, color: positive ? "#e53e3e" : "#276749", fontWeight: 600 }}>
                  {positive ? `▲ +${delta}` : `▼ ${delta}`} kg since last
                </p>
              );
            })()}
          </div>
        )}
      </div>

      {/* Today's Meals */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Meals</h4>
          <button
            onClick={() => navigate("/log-meal")}
            style={{ background: "#38a169", color: "white", border: "none", padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            + Log Meal
          </button>
        </div>

        {todayMeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#a0aec0", border: "1px dashed #cbd5e0", borderRadius: 10 }}>
            <p style={{ margin: 0 }}>No meals logged yet today.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>Tap "Log Meal" to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  background: "white",
                  border: `1px solid ${confirmDeleteId === meal.id ? "#fc8181" : "#e2e8f0"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{meal.mealName}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>
                      {meal.mealType} · {meal.calories} kcal · P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
                    </p>
                  </div>
                  {confirmDeleteId !== meal.id ? (
                    <button
                      id={`delete-meal-${meal.id}`}
                      onClick={() => setConfirmDeleteId(meal.id)}
                      style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 20, padding: "0 0 0 8px" }}
                      title="Delete meal"
                    >
                      ×
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        id={`cancel-delete-${meal.id}`}
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        id={`confirm-delete-${meal.id}`}
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => navigate("/weekly-plan")} style={navBtnStyle}>View Current Plan</button>
        <button onClick={() => navigate("/plan-history")} style={navBtnStyle}>View Plan History</button>
        <button onClick={() => navigate("/meal-wizard")} style={navBtnStyle}>Generate New Plan</button>
        <button onClick={() => navigate("/groceries")} style={navBtnStyle}>View Groceries</button>
        <button onClick={() => navigate("/progress")} style={navBtnStyle}>View Progress</button>
        <button onClick={() => navigate("/profile")} style={{ ...navBtnStyle, background: "#2b6cb0", color: "white" }}>
          My Profile
        </button>
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: "12px",
  background: "#edf2f7",
  color: "#2d3748",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
  fontWeight: 500,
  textAlign: "left",
  paddingLeft: 16,
};

export default DashboardPage;
```

### `frontend/src/pages/ProfilePage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "",
    heightCm: "",
    currentWeightKg: "",
    targetWeightKg: "",
    goal: "",
    activityLevel: "",
    primaryDietaryStyle: "",
    allergiesText: "",
    dislikedFoodsText: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setFetching(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const p = data.data;
          // Pre-fill form with existing data
          setFormData({
            fullName: p.fullName || "",
            age: p.age || "",
            sex: p.sex || "",
            heightCm: p.heightCm || "",
            currentWeightKg: p.currentWeightKg || "",
            targetWeightKg: p.targetWeightKg || "",
            goal: p.goal || "",
            activityLevel: p.activityLevel || "",
            primaryDietaryStyle: p.primaryDietaryStyle || "",
            allergiesText: p.allergiesText || "",
            dislikedFoodsText: p.dislikedFoodsText || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data.");
      } finally {
        setFetching(false);
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile saved successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) return <div style={{ padding: 20 }}>Loading profile...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile Setup</h2>
      
      {error && (
        <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f5c6cb" }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #c3e6cb" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 10 }}>
          <label>Full Name</label><br />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Age</label><br />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Sex</label><br />
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Height (cm)</label><br />
          <input
            type="number"
            name="heightCm"
            placeholder="Height (cm)"
            value={formData.heightCm}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Current Weight (kg)</label><br />
          <input
            type="number"
            name="currentWeightKg"
            placeholder="Current Weight (kg)"
            value={formData.currentWeightKg}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Target Weight (kg)</label><br />
          <input
            type="number"
            name="targetWeightKg"
            placeholder="Target Weight (kg)"
            value={formData.targetWeightKg}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Goal</label><br />
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Activity Level</label><br />
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Activity Level</option>
            <option value="sedentary">Sedentary (Office job, little exercise)</option>
            <option value="light">Light (1-2 days/week exercise)</option>
            <option value="moderate">Moderate (3-5 days/week exercise)</option>
            <option value="active">Active (6-7 days/week exercise)</option>
            <option value="very_active">Very Active (Professional athlete/physical job)</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Dietary Style</label><br />
          <select
            name="primaryDietaryStyle"
            value={formData.primaryDietaryStyle}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Dietary Style</option>
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="pescatarian">Pescatarian</option>
            <option value="keto">Keto</option>
            <option value="low_carb">Low Carb</option>
            <option value="high_protein">High Protein</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Allergies / Foods to Avoid</label><br />
          <textarea
            name="allergiesText"
            placeholder="e.g. Peanuts, Shellfish"
            rows="3"
            value={formData.allergiesText}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Disliked Foods</label><br />
          <textarea
            name="dislikedFoodsText"
            placeholder="e.g. Mushrooms, Olives"
            rows="3"
            value={formData.dislikedFoodsText}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
```

### `frontend/src/pages/LogMealPage.jsx`
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function LogMealPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    mealName: "",
    mealType: "Breakfast",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (authLoading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.mealName.trim()) newErrors.mealName = "Meal name is required";
    if (formData.calories === "" || Number(formData.calories) < 0)
      newErrors.calories = "Enter a valid calorie amount (0 or more)";
    if (formData.proteinG !== "" && Number(formData.proteinG) < 0)
      newErrors.proteinG = "Protein cannot be negative";
    if (formData.carbsG !== "" && Number(formData.carbsG) < 0)
      newErrors.carbsG = "Carbs cannot be negative";
    if (formData.fatG !== "" && Number(formData.fatG) < 0)
      newErrors.fatG = "Fat cannot be negative";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealName: formData.mealName.trim(),
          mealType: formData.mealType,
          calories: Number(formData.calories) || 0,
          proteinG: Number(formData.proteinG) || 0,
          carbsG: Number(formData.carbsG) || 0,
          fatG: Number(formData.fatG) || 0,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`✅ "${formData.mealName}" logged successfully!`);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setErrors({ form: data.message || "Failed to log meal" });
      }
    } catch (error) {
      setErrors({ form: "Network error. Is the backend running?" });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    border: errors[fieldName] ? "1px solid #e53e3e" : "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "14px", marginBottom: 16 }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: 4 }}>Log a Meal</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>Track what you eat today.</p>

      {successMsg && (
        <div style={{ background: "#c6f6d5", border: "1px solid #38a169", padding: "12px", borderRadius: "8px", marginBottom: 16, color: "#276749" }}>
          {successMsg}
        </div>
      )}

      {errors.form && (
        <div style={{ background: "#fed7d7", border: "1px solid #e53e3e", padding: "12px", borderRadius: "8px", marginBottom: 16, color: "#9b2c2c" }}>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Meal Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meal Name *</label>
          <input
            type="text"
            name="mealName"
            placeholder="e.g. Oatmeal with Berries"
            value={formData.mealName}
            onChange={handleChange}
            style={inputStyle("mealName")}
          />
          {errors.mealName && <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: 4 }}>{errors.mealName}</p>}
        </div>

        {/* Meal Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meal Type *</label>
          <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            style={inputStyle("mealType")}
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Calories */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Calories *</label>
          <input
            type="number"
            name="calories"
            placeholder="e.g. 350"
            value={formData.calories}
            onChange={handleChange}
            min="0"
            style={inputStyle("calories")}
          />
          {errors.calories && <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: 4 }}>{errors.calories}</p>}
        </div>

        {/* Macros Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Protein (g)</label>
            <input
              type="number"
              name="proteinG"
              placeholder="0"
              value={formData.proteinG}
              onChange={handleChange}
              min="0"
              style={inputStyle("proteinG")}
            />
            {errors.proteinG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.proteinG}</p>}
          </div>
          <div>
            <label style={labelStyle}>Carbs (g)</label>
            <input
              type="number"
              name="carbsG"
              placeholder="0"
              value={formData.carbsG}
              onChange={handleChange}
              min="0"
              style={inputStyle("carbsG")}
            />
            {errors.carbsG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.carbsG}</p>}
          </div>
          <div>
            <label style={labelStyle}>Fat (g)</label>
            <input
              type="number"
              name="fatG"
              placeholder="0"
              value={formData.fatG}
              onChange={handleChange}
              min="0"
              style={inputStyle("fatG")}
            />
            {errors.fatG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.fatG}</p>}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            name="description"
            placeholder="e.g. Full bowl, added honey"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            style={{ ...inputStyle("description"), resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !!successMsg}
          style={{
            width: "100%",
            padding: "14px",
            background: saving || successMsg ? "#a0aec0" : "#38a169",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: saving || successMsg ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : successMsg ? "Logged! Redirecting..." : "Log Meal"}
        </button>
      </form>
    </div>
  );
}

export default LogMealPage;
```

### `frontend/src/pages/ProgressPage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Helper: Format date to readable string ───────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ─── Sub-component: Summary Card ─────────────────────────────────────────────
function SummaryCard({ label, value, unit = "kg", highlight = false, color }) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${highlight ? color || "#68d391" : "#e2e8f0"}`,
      borderRadius: 10,
      padding: "14px 12px",
      textAlign: "center",
      flex: 1,
      minWidth: 0,
    }}>
      <p style={{ margin: 0, fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: highlight ? (color || "#276749") : "#2d3748" }}>
        {value ?? "—"}
        {value != null && <span style={{ fontSize: 13, fontWeight: 500 }}> {unit}</span>}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ProgressPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading]);

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) { setFetching(false); return; }
    try {
      const [weightRes, profileRes] = await Promise.all([
        fetch("http://localhost:5000/api/weight", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (weightRes.ok) {
        const data = await weightRes.json();
        setLogs(data.data || []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.data);
      }
    } catch (err) {
      console.error("ProgressPage fetch error:", err);
    } finally {
      setFetching(false);
    }
  }

  const handleLogWeight = async (e) => {
    e.preventDefault();
    setError("");
    const val = Number(weightInput);
    if (!weightInput || isNaN(val) || val <= 0) {
      setError("Please enter a valid positive weight.");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weightKg: val }),
      });
      const data = await res.json();
      if (res.ok) {
        setWeightInput("");
        setSuccessMsg("✅ Weight logged!");
        setTimeout(() => setSuccessMsg(""), 3000);
        await fetchData(); // refresh list
      } else {
        setError(data.message || "Failed to log weight.");
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/weight/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Delete weight error:", err);
    }
  };

  if (authLoading || fetching) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────────────────
  // logs are newest-first from API; reverse for chart (oldest → newest)
  const chartData = [...logs].reverse().map((l) => ({
    date: formatDate(l.loggedAt),
    weight: l.weightKg,
  }));

  const latestLog = logs[0];
  const firstLog = logs[logs.length - 1];
  const change = latestLog && firstLog && latestLog.id !== firstLog.id
    ? +(latestLog.weightKg - firstLog.weightKg).toFixed(1)
    : null;

  const targetWeight = profile?.targetWeightKg ?? null;
  const remaining = latestLog && targetWeight
    ? +(latestLog.weightKg - targetWeight).toFixed(1)
    : null;

  const inputStyle = {
    padding: "10px 14px",
    border: error ? "1px solid #e53e3e" : "1px solid #cbd5e0",
    borderRadius: 8,
    fontSize: 15,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 4,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}
      >
        ← Back to Dashboard
      </button>
      <h2 style={{ margin: "0 0 4px" }}>Progress</h2>
      <p style={{ margin: "0 0 20px", color: "#666", fontSize: 13 }}>Track your weight over time.</p>

      {/* ─── Log Weight Form ─────────────────────────────────────────────── */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>Log Today's Weight</h4>
        <form onSubmit={handleLogWeight} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              placeholder="e.g. 82.5"
              value={weightInput}
              onChange={(e) => { setWeightInput(e.target.value); setError(""); }}
              min="1"
              step="0.1"
              style={inputStyle}
            />
            {error && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
            {successMsg && <p style={{ color: "#276749", fontSize: 12, margin: "4px 0 0" }}>{successMsg}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 18px",
              background: saving ? "#a0aec0" : "#4299e1",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {saving ? "Saving..." : "Log kg"}
          </button>
        </form>
      </div>

      {/* ─── Empty State ─────────────────────────────────────────────────── */}
      {logs.length === 0 && (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 12, padding: "32px 20px", textAlign: "center", color: "#a0aec0", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 16 }}>📉 No weight logs yet.</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Log your first weight above to start tracking your progress.</p>
        </div>
      )}

      {logs.length > 0 && (
        <>
          {/* ─── Summary Cards ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <SummaryCard label="Start" value={firstLog?.weightKg} />
            <SummaryCard label="Current" value={latestLog?.weightKg} highlight color="#4299e1" />
            {change !== null && (
              <SummaryCard
                label="Change"
                value={change > 0 ? `+${change}` : change}
                highlight
                color={change < 0 ? "#276749" : "#e53e3e"}
              />
            )}
            {targetWeight != null ? (
              <SummaryCard
                label="To Goal"
                value={remaining != null ? (remaining > 0 ? `-${remaining}` : "✅") : "—"}
                highlight={remaining !== null && remaining <= 0}
                color="#276749"
              />
            ) : (
              <div style={{ flex: 1, minWidth: 0, background: "#fffbeb", border: "1px solid #f6ad55", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Target</p>
                <p style={{ margin: 0, fontSize: 11, color: "#c05621" }}>Set in profile</p>
              </div>
            )}
          </div>

          {/* ─── Recharts Line Chart ────────────────────────────────────── */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 8px 8px", marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 12px 12px", fontSize: 14, color: "#555" }}>Weight Trend</h4>
            {chartData.length === 1 && (
              <p style={{ margin: "0 0 8px 12px", fontSize: 12, color: "#a0aec0" }}>Log more days to see your trend chart.</p>
            )}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}kg`}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "Weight"]}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                {targetWeight && (
                  <ReferenceLine
                    y={targetWeight}
                    stroke="#38a169"
                    strokeDasharray="4 4"
                    label={{ value: "Goal", position: "insideTopRight", fontSize: 11, fill: "#38a169" }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#4299e1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#4299e1" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Weight History Table ───────────────────────────────────── */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <h4 style={{ margin: 0, padding: "12px 16px", fontSize: 14, color: "#555", borderBottom: "1px solid #e2e8f0" }}>History</h4>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid #f7fafc",
                  background: confirmDeleteId === log.id ? "#fff5f5" : "white",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{log.weightKg} kg</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: "#888" }}>{formatDate(log.loggedAt)}</span>
                </div>
                {confirmDeleteId !== log.id ? (
                  <button
                    id={`delete-weight-${log.id}`}
                    onClick={() => setConfirmDeleteId(log.id)}
                    style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 20 }}
                  >×</button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      id={`cancel-weight-delete-${log.id}`}
                      onClick={() => setConfirmDeleteId(null)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
                    >Cancel</button>
                    <button
                      id={`confirm-weight-delete-${log.id}`}
                      onClick={() => handleDelete(log.id)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
                    >Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProgressPage;
```

### `frontend/src/pages/MealWizardPage.jsx`
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PROTEIN_OPTIONS = ["Chicken", "Beef", "Fish", "Eggs", "Dairy", "Legumes", "Tofu"];

const labelStyle = { fontSize: 14, fontWeight: 600, color: "#2d3748", display: "block", marginBottom: 6 };
const selectStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #cbd5e0",
  borderRadius: 8, fontSize: 14, background: "white", boxSizing: "border-box",
};

function MealWizardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    mealsPerDay: "3",
    proteinSources: [],
    avoidFoodsText: "",
    cookingEffort: "any",
    budgetLevel: "medium",
    cuisineStyle: "mixed",
    varietyLevel: "medium",
    extraNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  if (authLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleProtein = (source) => {
    setForm((prev) => {
      const current = prev.proteinSources;
      const updated = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      return { ...prev, proteinSources: updated };
    });
    if (errors.proteinSources) setErrors((prev) => ({ ...prev, proteinSources: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.mealsPerDay) e.mealsPerDay = "Please select meals per day";
    if (form.proteinSources.length === 0) e.proteinSources = "Select at least one protein source";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setGenerating(true);
    const token = localStorage.getItem("token");

    try {
      // Step 1: Save preferences
      setStatusMsg("Saving your preferences...");
      const prefRes = await fetch("http://localhost:5000/api/meal-plan/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mealsPerDay: Number(form.mealsPerDay),
          proteinSources: form.proteinSources,
          avoidFoodsText: form.avoidFoodsText,
          cookingEffort: form.cookingEffort,
          budgetLevel: form.budgetLevel,
          cuisineStyle: form.cuisineStyle,
          varietyLevel: form.varietyLevel,
          extraNotes: form.extraNotes,
        }),
      });
      if (!prefRes.ok) {
        const d = await prefRes.json();
        setErrors({ form: d.message || "Failed to save preferences" });
        return;
      }

      // Step 2: Generate plan
      setStatusMsg("Generating your 7-day meal plan...");
      const genRes = await fetch("http://localhost:5000/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!genRes.ok) {
        const d = await genRes.json();
        setErrors({ form: d.message || "Failed to generate plan" });
        return;
      }

      setStatusMsg("✅ Plan generated! Redirecting...");
      setTimeout(() => navigate("/weekly-plan"), 1200);
    } catch {
      setErrors({ form: "Network error. Is the backend running?" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Dashboard
      </button>
      <h2 style={{ margin: "0 0 4px" }}>Meal Plan Wizard</h2>
      <p style={{ margin: "0 0 24px", color: "#666", fontSize: 13 }}>Tell us your preferences and we'll build your 7-day plan.</p>

      {errors.form && (
        <div style={{ background: "#fed7d7", border: "1px solid #e53e3e", padding: 12, borderRadius: 8, marginBottom: 16, color: "#9b2c2c", fontSize: 14 }}>
          {errors.form}
        </div>
      )}
      {statusMsg && (
        <div style={{ background: "#ebf8ff", border: "1px solid #63b3ed", padding: 12, borderRadius: 8, marginBottom: 16, color: "#2b6cb0", fontSize: 14 }}>
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Meals per day */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Meals Per Day *</label>
          <select name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} style={selectStyle}>
            <option value="3">3 Meals (Breakfast, Lunch, Dinner)</option>
            <option value="4">4 Meals (+ Snack)</option>
            <option value="5">5 Meals (+ 2 Snacks)</option>
          </select>
          {errors.mealsPerDay && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.mealsPerDay}</p>}
        </div>

        {/* Protein Sources */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Preferred Protein Sources *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PROTEIN_OPTIONS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => toggleProtein(src)}
                style={{
                  padding: "8px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 500,
                  border: form.proteinSources.includes(src) ? "2px solid #4299e1" : "1px solid #cbd5e0",
                  background: form.proteinSources.includes(src) ? "#ebf8ff" : "white",
                  color: form.proteinSources.includes(src) ? "#2b6cb0" : "#555",
                }}
              >
                {src}
              </button>
            ))}
          </div>
          {errors.proteinSources && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.proteinSources}</p>}
        </div>

        {/* Foods to avoid */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Foods to Avoid</label>
          <textarea
            name="avoidFoodsText"
            placeholder="e.g. pork, nuts, dairy (optional)"
            value={form.avoidFoodsText}
            onChange={handleChange}
            rows={2}
            style={{ ...selectStyle, resize: "vertical" }}
          />
        </div>

        {/* Cooking Effort */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Cooking Effort</label>
          <select name="cookingEffort" value={form.cookingEffort} onChange={handleChange} style={selectStyle}>
            <option value="easy">Quick & Easy (under 15 min)</option>
            <option value="moderate">Moderate (15–30 min)</option>
            <option value="any">Any</option>
          </select>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Budget Level</label>
          <select name="budgetLevel" value={form.budgetLevel} onChange={handleChange} style={selectStyle}>
            <option value="low">Low Budget</option>
            <option value="medium">Medium Budget</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        {/* Cuisine */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Cuisine Style</label>
          <select name="cuisineStyle" value={form.cuisineStyle} onChange={handleChange} style={selectStyle}>
            <option value="arabic">Arabic / Middle Eastern</option>
            <option value="western">Western</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Variety */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Variety Level</label>
          <select name="varietyLevel" value={form.varietyLevel} onChange={handleChange} style={selectStyle}>
            <option value="low">Low — Repeat meals for simplicity</option>
            <option value="medium">Medium — Some variety each day</option>
            <option value="high">High — Different meals every day</option>
          </select>
        </div>

        {/* Extra Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Extra Notes (optional)</label>
          <textarea
            name="extraNotes"
            placeholder="Any other dietary preferences or notes..."
            value={form.extraNotes}
            onChange={handleChange}
            rows={2}
            style={{ ...selectStyle, resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          style={{
            width: "100%", padding: "14px", fontWeight: 700, fontSize: 16, borderRadius: 10, border: "none",
            background: generating ? "#a0aec0" : "#4299e1", color: "white",
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? statusMsg || "Generating..." : "✨ Generate My 7-Day Plan"}
        </button>
      </form>
    </div>
  );
}

export default MealWizardPage;
```

### `frontend/src/pages/WeeklyPlanPage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MEAL_TYPE_COLORS = {
  Breakfast: "#ecc94b",
  Lunch: "#48bb78",
  Dinner: "#4299e1",
  Snack: "#9f7aea",
};

function WeeklyPlanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIdParam = searchParams.get("planId");
  const { user, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // New states for expanded cards and 1-click logging
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [loggingMealId, setLoggingMealId] = useState(null);
  const [loggedMeals, setLoggedMeals] = useState({});

  useEffect(() => {
    if (!authLoading) fetchPlan();
  }, [authLoading, planIdParam]);

  async function fetchPlan() {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const url = planIdParam 
        ? `http://localhost:5000/api/meal-plan/${planIdParam}`
        : "http://localhost:5000/api/meal-plan/latest";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.data);
      }
    } catch (err) {
      console.error("WeeklyPlanPage fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogMeal(mealId) {
    const token = localStorage.getItem("token");
    if (!token || loggedMeals[mealId] || loggingMealId === mealId) return;

    setLoggingMealId(mealId);
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/meal/${mealId}/log`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLoggedMeals(prev => ({ ...prev, [mealId]: true }));
      } else {
        console.error("Failed to log meal");
      }
    } catch(err) {
      console.error("Log meal error:", err);
    } finally {
      setLoggingMealId(null);
    }
  }

  if (authLoading || loading) return <div style={{ padding: 20 }}>Loading your meal plan...</div>;

  if (!user) {
    return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!plan) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>
          ← Dashboard
        </button>
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0, fontSize: 18 }}>📋 No meal plan found</p>
          <p style={{ margin: "8px 0 20px", fontSize: 13 }}>Use the Meal Wizard to generate a new 7-day plan.</p>
          <button
            onClick={() => navigate("/meal-wizard")}
            style={{ background: "#4299e1", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}
          >
            Open Meal Wizard
          </button>
        </div>
      </div>
    );
  }

  // ─── Weekly summary ────────────────────────────────────────────────────────
  const totalDays = plan.days.length;
  const avgCalories = totalDays > 0
    ? Math.round(plan.days.reduce((s, d) => s + d.totalCalories, 0) / totalDays)
    : 0;
  const totalWeekCalories = plan.days.reduce((s, d) => s + d.totalCalories, 0);
  const groceryCount = plan.groceryItems?.length || 0;
  const createdDate = new Date(plan.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <button onClick={() => navigate(planIdParam ? "/plan-history" : "/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>{planIdParam ? "Archived Plan" : "Weekly Meal Plan"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>Generated {createdDate}</p>
        </div>
        {!planIdParam && (
          <button
            onClick={() => navigate("/meal-wizard")}
            style={{ fontSize: 12, padding: "6px 12px", background: "none", border: "1px solid #cbd5e0", borderRadius: 20, cursor: "pointer", color: "#555" }}
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Weekly Summary Card */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Weekly Summary</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Avg/Day", value: `${avgCalories} kcal` },
            { label: "Week Total", value: `${totalWeekCalories.toLocaleString()} kcal` },
            { label: "Grocery Items", value: groceryCount },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1, minWidth: 80, background: "#f7fafc", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#2d3748" }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Day Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {plan.days.map((day) => (
          <div key={day.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            {/* Day Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f7fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{day.dayName}</span>
              <span style={{ fontSize: 12, color: "#666" }}>
                {day.totalCalories} kcal · P:{day.totalProteinG}g C:{day.totalCarbsG}g F:{day.totalFatG}g
              </span>
            </div>
            {/* Meals */}
            {day.meals.map((meal) => {
              const isExpanded = expandedMealId === meal.id;
              
              return (
                <div key={meal.id} style={{ borderBottom: "1px solid #f7fafc" }}>
                  <div 
                    onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                    style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                          background: MEAL_TYPE_COLORS[meal.mealType] + "22",
                          color: MEAL_TYPE_COLORS[meal.mealType],
                          border: `1px solid ${MEAL_TYPE_COLORS[meal.mealType]}44`,
                        }}>
                          {meal.mealType.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{meal.mealName}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#4a5568" }}>{meal.calories} kcal</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#a0aec0" }}>
                        {isExpanded ? "▲ Hide" : "▼ Details"} 
                      </p>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{ padding: "0 14px 14px", background: "#f8fafc", borderTop: "1px solid #edf2f7" }}>
                      {meal.description && (
                        <p style={{ margin: "10px 0", fontSize: 13, color: "#4a5568" }}>{meal.description}</p>
                      )}
                      <p style={{ margin: "10px 0", fontSize: 12, color: "#718096" }}><strong>Ingredients:</strong> {meal.ingredientsText}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#a0aec0" }}>P:{meal.proteinG} C:{meal.carbsG} F:{meal.fatG}</p>
                        <button
                          disabled={loggingMealId === meal.id || loggedMeals[meal.id]}
                          onClick={(e) => { e.stopPropagation(); handleLogMeal(meal.id); }}
                          style={{ 
                            padding: "6px 12px", 
                            background: loggedMeals[meal.id] ? "#48bb78" : "#3182ce", 
                            color: "white", 
                            border: "none", 
                            borderRadius: 6, 
                            fontSize: 13, 
                            fontWeight: 600, 
                            cursor: (loggingMealId === meal.id || loggedMeals[meal.id]) ? "not-allowed" : "pointer",
                            opacity: (loggingMealId === meal.id) ? 0.7 : 1
                          }}
                        >
                          {loggedMeals[meal.id] ? "Logged ✓" : (loggingMealId === meal.id ? "..." : "Log This Meal")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <button
        onClick={() => navigate(`/groceries?planId=${plan.id}`)}
        style={{ width: "100%", padding: "14px", background: "#38a169", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}
      >
        🛒 View Grocery List ({groceryCount} items)
      </button>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ width: "100%", padding: "12px", background: "#edf2f7", color: "#2d3748", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default WeeklyPlanPage;
```

### `frontend/src/pages/PlanHistoryPage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PlanHistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/meal-plan/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(data.data || []);
        }
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) fetchHistory();
  }, [authLoading]);

  if (authLoading || loading) return <div style={{ padding: 20 }}>Loading history...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Dashboard
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Plan History</h2>
        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{plans.length} archived</span>
      </div>
      
      {plans.length === 0 ? (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0, fontSize: 16 }}>No archived plans found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {plans.map((p) => {
            const startDate = new Date(p.weekStartDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
            const created = new Date(p.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
            return (
              <div key={p.id} style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#2d3748" }}>Week of {startDate}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Created: {created} · Generated: {p.generationMode}</p>
                </div>
                <button
                  onClick={() => navigate(`/weekly-plan?planId=${p.id}`)}
                  style={{ background: "#ebf8ff", color: "#3182ce", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  View Plan
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlanHistoryPage;

```

### `frontend/src/pages/GroceryPage.jsx`
```javascript
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GroceryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchGroceries();
  }, [authLoading]);

  async function fetchGroceries() {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    // planId from URL param OR fetch latest plan's id
    let activePlanId = searchParams.get("planId");

    if (!activePlanId) {
      // Fetch latest plan to get its ID
      try {
        const planRes = await fetch("http://localhost:5000/api/meal-plan/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (planRes.ok) {
          const planData = await planRes.json();
          activePlanId = planData.data?.id;
        }
      } catch (err) {
        console.error("Fetch plan error:", err);
      }
    }

    if (!activePlanId) { setLoading(false); return; }
    setPlanId(Number(activePlanId));

    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${activePlanId}/groceries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Fetch groceries error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (item) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${item.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isChecked: !i.isChecked } : i));
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || !planId) return;
    setAdding(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemName: newItem.trim(), quantityText: "", category: "General" }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.data, ...prev]);
        setNewItem("");
      }
    } catch (err) {
      console.error("Add item error:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (authLoading || loading) return <div style={{ padding: 20 }}>Loading groceries...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);
  const checkedCount = checked.length;
  const totalCount = items.length;

  if (!planId) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Dashboard</button>
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0, fontSize: 18 }}>🛒 No grocery list yet</p>
          <p style={{ margin: "8px 0 20px", fontSize: 13 }}>Generate a meal plan first to get your grocery list.</p>
          <button onClick={() => navigate("/meal-wizard")} style={{ background: "#4299e1", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}>Open Meal Wizard</button>
        </div>
      </div>
    );
  }

  const rowStyle = (isChecked) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f7fafc",
    background: "white",
    gap: 10,
    opacity: isChecked ? 0.55 : 1,
  });

  function ItemRow({ item }) {
    return (
      <div style={rowStyle(item.isChecked)}>
        <input
          type="checkbox"
          checked={item.isChecked}
          onChange={() => handleToggle(item)}
          style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
        />
        <span style={{
          flex: 1, fontSize: 14,
          textDecoration: item.isChecked ? "line-through" : "none",
          color: item.isChecked ? "#a0aec0" : "#2d3748",
        }}>
          {item.itemName}
          {item.isUserAdded && <span style={{ fontSize: 10, color: "#9f7aea", marginLeft: 6, fontWeight: 600 }}>custom</span>}
        </span>
        {confirmDeleteId !== item.id ? (
          <button
            id={`delete-grocery-${item.id}`}
            onClick={() => setConfirmDeleteId(item.id)}
            style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 18, padding: 0 }}
          >×</button>
        ) : (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              id={`cancel-grocery-delete-${item.id}`}
              onClick={() => setConfirmDeleteId(null)}
              style={{ fontSize: 11, padding: "3px 7px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
            >Cancel</button>
            <button
              id={`confirm-grocery-delete-${item.id}`}
              onClick={() => handleDelete(item.id)}
              style={{ fontSize: 11, padding: "3px 7px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
            >Delete</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <button onClick={() => navigate("/weekly-plan")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Weekly Plan
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Grocery List</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666" }}>
            {checkedCount} of {totalCount} items checked
          </p>
        </div>
        {totalCount > 0 && (
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "#f7fafc",
            border: "3px solid #48bb78", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#276749",
          }}>
            {Math.round((checkedCount / totalCount) * 100)}%
          </div>
        )}
      </div>

      {/* Add custom item */}
      <form onSubmit={handleAddItem} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Add a custom item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #cbd5e0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={adding || !newItem.trim()}
          style={{ padding: "10px 18px", background: adding ? "#a0aec0" : "#4299e1", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: adding ? "not-allowed" : "pointer" }}
        >
          {adding ? "..." : "+ Add"}
        </button>
      </form>

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 10, padding: "24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0 }}>No grocery items yet.</p>
        </div>
      )}

      {/* To Buy section (Categorized) */}
      {unchecked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>
            To Buy ({unchecked.length})
          </p>
          
          {(() => {
            // Group the unchecked items
            const grouped = unchecked.reduce((acc, item) => {
              const cat = item.category || "🏷️ General";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(item);
              return acc;
            }, {});
            
            // Render each category block
            return Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <h5 style={{ margin: "0 0 6px 4px", fontSize: 13, color: "#4a5568" }}>{cat}</h5>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  {catItems.map((item) => <ItemRow key={item.id} item={item} />)}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Done section */}
      {checked.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#48bb78", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Done ✓ ({checked.length})
          </p>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            {checked.map((item) => <ItemRow key={item.id} item={item} />)}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{ width: "100%", padding: "12px", background: "#edf2f7", color: "#2d3748", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default GroceryPage;
```

### `frontend/src/pages/SettingsPage.jsx`
```javascript
function SettingsPage() {
  return <h1>Settings Page</h1>;
}

export default SettingsPage;
```

