/**
 * Standard Meal Bank for Right Bite
 */

const MEAL_BANK = [
  // Breakfasts
  { name: "Oatmeal with Banana & Honey", type: "Breakfast", calories: 380, protein: 12, carbs: 68, fat: 8, effort: "easy", ingredients: "Oats, banana, honey, milk", cuisine: "western", proteins: [] },
  { name: "Scrambled Eggs with Toast", type: "Breakfast", calories: 420, protein: 22, carbs: 38, fat: 18, effort: "easy", ingredients: "Eggs, bread, butter, salt", cuisine: "western", proteins: ["Eggs"] },
  { name: "Greek Yogurt with Berries", type: "Breakfast", calories: 280, protein: 18, carbs: 32, fat: 6, effort: "easy", ingredients: "Greek yogurt, mixed berries, honey", cuisine: "western", proteins: ["Dairy"] },
  { name: "Ful Medames with Bread", type: "Breakfast", calories: 450, protein: 20, carbs: 65, fat: 10, effort: "moderate", ingredients: "Fava beans, olive oil, lemon, garlic, pita bread", cuisine: "arabic", proteins: ["Legumes"] },
  { name: "Labneh with Olive Oil & Thyme", type: "Breakfast", calories: 320, protein: 14, carbs: 28, fat: 16, effort: "easy", ingredients: "Labneh, olive oil, thyme, pita", cuisine: "arabic", proteins: ["Dairy"] },
  { name: "Avocado Toast with Eggs", type: "Breakfast", calories: 460, protein: 20, carbs: 40, fat: 24, effort: "easy", ingredients: "Bread, avocado, eggs, lemon, chili flakes", cuisine: "western", proteins: ["Eggs"] },
  { name: "Protein Smoothie Bowl", type: "Breakfast", calories: 350, protein: 28, carbs: 42, fat: 7, effort: "easy", ingredients: "Protein powder, frozen berries, banana, almond milk, granola", cuisine: "western", proteins: ["Dairy"] },
  // Lunches
  { name: "Grilled Chicken with Rice & Salad", type: "Lunch", calories: 550, protein: 45, carbs: 52, fat: 12, effort: "moderate", ingredients: "Chicken breast, rice, lettuce, tomato, cucumber, olive oil", cuisine: "western", proteins: ["Chicken"] },
  { name: "Beef Kofta with Grilled Vegetables", type: "Lunch", calories: 580, protein: 38, carbs: 30, fat: 28, effort: "moderate", ingredients: "Ground beef, parsley, onion, zucchini, pepper, tomato", cuisine: "arabic", proteins: ["Beef"] },
  { name: "Tuna Salad with Whole Grain Bread", type: "Lunch", calories: 420, protein: 35, carbs: 38, fat: 10, effort: "easy", ingredients: "Canned tuna, bread, lettuce, tomato, light mayo, lemon", cuisine: "western", proteins: ["Fish"] },
  { name: "Lentil Soup with Bread", type: "Lunch", calories: 380, protein: 18, carbs: 58, fat: 8, effort: "moderate", ingredients: "Red lentils, onion, cumin, turmeric, olive oil, bread", cuisine: "arabic", proteins: ["Legumes"] },
  { name: "Chicken Shawarma Wrap", type: "Lunch", calories: 520, protein: 38, carbs: 48, fat: 16, effort: "moderate", ingredients: "Chicken, tortilla wrap, garlic sauce, lettuce, tomato, pickles", cuisine: "arabic", proteins: ["Chicken"] },
  { name: "Salmon Fillet with Sweet Potato", type: "Lunch", calories: 560, protein: 42, carbs: 40, fat: 18, effort: "moderate", ingredients: "Salmon, sweet potato, lemon, olive oil, dill", cuisine: "western", proteins: ["Fish"] },
  { name: "Tofu Stir-Fry with Brown Rice", type: "Lunch", calories: 480, protein: 26, carbs: 58, fat: 14, effort: "moderate", ingredients: "Tofu, brown rice, soy sauce, ginger, garlic, broccoli, bell pepper", cuisine: "western", proteins: ["Tofu"] },
  { name: "Chickpea Curry with Rice", type: "Lunch", calories: 440, protein: 16, carbs: 72, fat: 10, effort: "moderate", ingredients: "Chickpeas, rice, tomato, onion, curry spices, coconut milk", cuisine: "mixed", proteins: ["Legumes"] },
  { name: "Beef Steak with Mashed Potato", type: "Lunch", calories: 660, protein: 50, carbs: 42, fat: 28, effort: "moderate", ingredients: "Beef steak, potato, butter, garlic, rosemary", cuisine: "western", proteins: ["Beef"] },
  // Dinners
  { name: "Baked Chicken Thighs with Roasted Veg", type: "Dinner", calories: 480, protein: 40, carbs: 22, fat: 24, effort: "easy", ingredients: "Chicken thighs, zucchini, bell pepper, onion, olive oil, spices", cuisine: "western", proteins: ["Chicken"] },
  { name: "Grilled Fish with Quinoa", type: "Dinner", calories: 440, protein: 38, carbs: 36, fat: 12, effort: "moderate", ingredients: "White fish fillet, quinoa, lemon, herbs, olive oil", cuisine: "western", proteins: ["Fish"] },
  { name: "Mansaf Lite (Chicken & Rice)", type: "Dinner", calories: 580, protein: 42, carbs: 55, fat: 18, effort: "moderate", ingredients: "Chicken, rice, yogurt sauce, almonds, pine nuts, spices", cuisine: "arabic", proteins: ["Chicken", "Dairy"] },
  { name: "Pasta with Beef Bolognese", type: "Dinner", calories: 620, protein: 38, carbs: 62, fat: 22, effort: "moderate", ingredients: "Pasta, ground beef, tomato sauce, onion, garlic, olive oil", cuisine: "western", proteins: ["Beef"] },
  { name: "Vegetable Omelette", type: "Dinner", calories: 320, protein: 22, carbs: 12, fat: 20, effort: "easy", ingredients: "Eggs, spinach, tomato, onion, cheese, olive oil", cuisine: "western", proteins: ["Eggs", "Dairy"] },
  { name: "Grilled Salmon with Asparagus", type: "Dinner", calories: 480, protein: 44, carbs: 14, fat: 26, effort: "easy", ingredients: "Salmon, asparagus, lemon, olive oil, garlic", cuisine: "western", proteins: ["Fish"] },
  { name: "Chicken Soup with Noodles", type: "Dinner", calories: 380, protein: 30, carbs: 38, fat: 8, effort: "easy", ingredients: "Chicken, egg noodles, carrot, celery, onion, broth", cuisine: "western", proteins: ["Chicken"] },
  // Snacks
  { name: "Mixed Nuts & Dates", type: "Snack", calories: 220, protein: 6, carbs: 24, fat: 14, effort: "easy", ingredients: "Almonds, walnuts, dates", cuisine: "mixed", proteins: [] },
  { name: "Apple with Peanut Butter", type: "Snack", calories: 200, protein: 6, carbs: 28, fat: 8, effort: "easy", ingredients: "Apple, peanut butter", cuisine: "western", proteins: [] },
  { name: "Greek Yogurt with Honey", type: "Snack", calories: 180, protein: 12, carbs: 22, fat: 4, effort: "easy", ingredients: "Greek yogurt, honey", cuisine: "western", proteins: ["Dairy"] },
  { name: "Hard-Boiled Eggs", type: "Snack", calories: 160, protein: 14, carbs: 2, fat: 10, effort: "easy", ingredients: "Eggs, salt", cuisine: "western", proteins: ["Eggs"] },
  { name: "Hummus with Veggie Sticks", type: "Snack", calories: 190, protein: 8, carbs: 24, fat: 8, effort: "easy", ingredients: "Hummus, carrot, cucumber, celery", cuisine: "arabic", proteins: ["Legumes"] },
  { name: "Cottage Cheese with Pineapple", type: "Snack", calories: 170, protein: 16, carbs: 18, fat: 4, effort: "easy", ingredients: "Cottage cheese, pineapple chunks", cuisine: "western", proteins: ["Dairy"] },
  { name: "Protein Bar", type: "Snack", calories: 210, protein: 20, carbs: 24, fat: 6, effort: "easy", ingredients: "Protein bar (store-bought)", cuisine: "western", proteins: [] },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

module.exports = {
  MEAL_BANK,
  DAYS,
};
