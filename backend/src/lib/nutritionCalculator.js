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
