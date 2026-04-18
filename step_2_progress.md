# Progress Report: Step 2 - Profile Saving & Goal Calculation

This document tracks the detailed implementation of the User Profile and Nutrition Calculation system for the Right Bite project.

## 🎯 Goal
To transition from a static profile page to a functional system that saves user data, calculates personalized nutritional targets based on the Mifflin-St Jeor formula, and persists this data across sessions.

---

## 🛠️ Detailed Implementation Steps

### 1. The "Brain": Nutrition Calculation Logic
**File:** `backend/src/lib/nutritionCalculator.js`

We implemented the core mathematical logic to determine a user's health targets.

*   **Formula:** Mifflin-St Jeor Equation for BMR (Basal Metabolic Rate).
*   **Activity Multipliers:** Adjusted BMR based on physical activity levels (Sedentary, Light, Moderate, Active, Very Active).
*   **Goal Adjustments:** 
    *   `Lose`: -500 kcal/day
    *   `Maintain`: +0 kcal/day
    *   `Gain`: +500 kcal/day
*   **Macro Split (30/40/30):**
    *   **Protein:** 30% of calories (4 kcal/g)
    *   **Carbs:** 40% of calories (4 kcal/g)
    *   **Fats:** 30% of calories (9 kcal/g)

```javascript
/* Logic Example */
function calculateBMR(age, sex, heightCm, weightKg) {
  if (sex.toLowerCase() === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
}
```

---

### 2. The API: Profile Backend Routes
**File:** `backend/src/routes/profileRoutes.js`

Created endpoints to handle data persistence and retrieval.

*   **`PUT /api/profile` (Upsert):**
    *   Receives physical data from frontend.
    *   Validates required fields.
    *   Calls `calculateTargets` to generate nutritional goals.
    *   Saves/Updates the `Profile` model in the database linked to the authenticated user.
*   **`GET /api/profile`:**
    *   Fetches the existing profile for the logged-in user to pre-fill the form.
*   **Middleware Integration:** Protected by `authMiddleware` (JWT required).

---

### 3. Server Integration
**File:** `backend/src/server.js`

Registered the new routes and added logging for development.

*   **Route Registration:** `app.use("/api", profileRoutes);`
*   **Refactor:** Mounted at `/api` and internal routes use `/profile` for maximum reliability.
*   **Global Logging:** Added `[RAW REQUEST]` logging to track API health.

---

### 4. The UI: Functional Profile Form
**File:** `frontend/src/pages/ProfilePage.jsx`

Converted the static HTML into a dynamic React component.

*   **State Management:** Used `useState` to track every input field.
*   **Data Fetching (`useEffect`):** Automatically fetches existing data on mount to allow "Edit" mode.
*   **API Interactivity:** 
    *   Sends `headers: { Authorization: 'Bearer token' }` with every request.
    *   Handles success (redirect to Dashboard) and errors (alerts).

---

## 💾 Database Schema Update
**File:** `backend/prisma/schema.prisma`

The following fields are now actively being populated in the `Profile` model:
- `fullName`, `age`, `sex`, `heightCm`, `currentWeightKg`, `targetWeightKg`, `goal`, `activityLevel`
- **Calculated Targets:** `targetCalories`, `targetProteinG`, `targetCarbsG`, `targetFatG`

---

## ✅ Verification & Testing Results
1.  **Fresh Registration:** Created a new user `step2_final_v5@example.com`.
2.  **Initial Save:** Successfully saved profile with "Michael Jordan".
3.  **Redirection:** App correctly navigated to Dashboard upon save.
4.  **State Persistence:** Re-navigated to Profile page and verified all data was correctly retrieved from the database and displayed in the form.

---

## 🚀 Status: COMPLETE
The application now has a functional core data layer. We know who the user is, what they weigh, and what their nutritional goals are. 

**Next Objective:** Step 3 - Implementing Meal Logging and Dashboard Progress Bars.
