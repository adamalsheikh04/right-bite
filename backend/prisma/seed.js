const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcrypt");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════════════════
// REAL NUTRITIONAL DATA — sourced from USDA FoodData Central (fdc.nal.usda.gov)
// All macros are per typical serving size as noted
// ═══════════════════════════════════════════════════════════════════════════════

// ── MEAL LOG DATA (Real food macros from USDA) ──────────────────────────────
// Each entry: { type, name, desc, cal, protein, carbs, fat, weight (grams) }
const REAL_MEALS = {
  Breakfast: [
    // USDA: Eggs scrambled (2 large ~100g) = 149 cal, 10g P, 2g C, 11g F + Toast (2 slices ~60g) = 160 cal, 5g P, 30g C, 2g F + Avocado (50g) = 80 cal, 1g P, 4g C, 7g F
    { name: "Avocado Toast with Scrambled Eggs", desc: "Two large scrambled eggs on 2 slices whole-wheat toast with half an avocado", cal: 389, protein: 16, carbs: 36, fat: 20, weight: 210 },
    // USDA: Rolled oats dry (50g) = 189 cal, 7g P, 34g C, 3g F + Banana medium (118g) = 105 cal, 1g P, 27g C, 0g F + Honey (21g/1tbsp) = 64 cal, 0g P, 17g C, 0g F + Almond milk (240ml) = 30 cal, 1g P, 1g C, 3g F
    { name: "Oatmeal with Banana & Honey", desc: "50g rolled oats cooked in 240ml almond milk, topped with sliced banana and 1 tbsp honey", cal: 388, protein: 9, carbs: 79, fat: 6, weight: 430 },
    // USDA: Greek yogurt nonfat (200g) = 118 cal, 20g P, 7g C, 1g F + Blueberries (75g) = 43 cal, 1g P, 11g C, 0g F + Granola (30g) = 140 cal, 3g P, 22g C, 5g F
    { name: "Greek Yogurt Parfait with Berries", desc: "200g nonfat Greek yogurt layered with 75g fresh blueberries and 30g crunchy granola", cal: 301, protein: 24, carbs: 40, fat: 6, weight: 305 },
    // USDA: Ful medames cooked (200g) = 220 cal, 16g P, 30g C, 2g F + Olive oil (1tbsp/14g) = 119 cal, 0g P, 0g C, 14g F + Pita bread (60g) = 165 cal, 5g P, 33g C, 1g F
    { name: "Ful Medames with Pita Bread", desc: "200g cooked fava beans seasoned with cumin, lemon, garlic, drizzled with olive oil, served with whole-wheat pita", cal: 504, protein: 21, carbs: 63, fat: 17, weight: 274 },
    // USDA: Labneh (100g) = 160 cal, 8g P, 5g C, 12g F + Olive oil (7g) = 60 cal, 0g P, 0g C, 7g F + Za'atar (3g) = 5 cal + Pita (60g) = 165 cal, 5g P, 33g C, 1g F
    { name: "Labneh with Za'atar & Olive Oil", desc: "100g thick labneh drizzled with extra virgin olive oil, sprinkled with za'atar, served with fresh pita", cal: 390, protein: 13, carbs: 38, fat: 20, weight: 170 },
    // USDA: Egg large whole (1 = 50g) = 72 cal, 6g P, 0g C, 5g F × 3 = 216, 18, 0, 15 + Spinach (30g) = 7 cal, 1g P, 1g C, 0g F + Feta (28g) = 75 cal, 4g P, 1g C, 6g F + Olive oil (7g) = 60 cal
    { name: "Spinach & Feta Omelette", desc: "3-egg omelette filled with fresh baby spinach and crumbled feta cheese, cooked in olive oil", cal: 358, protein: 23, carbs: 2, fat: 28, weight: 215 },
    // USDA: Whole wheat bread (2 slices 60g) = 160 cal, 8g P, 26g C, 2g F + PB natural (32g/2tbsp) = 188 cal, 7g P, 7g C, 16g F + Banana (118g) = 105 cal, 1g P, 27g C, 0g F
    { name: "Peanut Butter Banana Toast", desc: "2 slices whole wheat toast spread with 2 tbsp natural peanut butter, topped with sliced banana", cal: 453, protein: 16, carbs: 60, fat: 18, weight: 210 },
    // USDA: Eggs (2) = 144, 12P, 0C, 10F + Turkey sausage (56g) = 80 cal, 10g P, 2g C, 3g F + Whole wheat toast (1 slice) = 80, 4P, 13C, 1F + Orange juice (240ml) = 112 cal, 2g P, 26g C, 0g F
    { name: "Eggs with Turkey Sausage", desc: "2 fried eggs with 2 turkey sausage links, 1 slice whole wheat toast, and a glass of fresh OJ", cal: 416, protein: 28, carbs: 41, fat: 14, weight: 400 },
    // USDA: Protein powder whey (30g scoop) = 120 cal, 24g P, 3g C, 1g F + Banana (118g) = 105, 1P, 27C, 0F + Almond milk (240ml) = 30, 1P, 1C, 3F + Spinach (40g) = 9, 1P, 1C, 0F
    { name: "Protein Green Smoothie", desc: "1 scoop whey protein blended with banana, 40g spinach, and unsweetened almond milk", cal: 264, protein: 27, carbs: 32, fat: 4, weight: 430 },
    // USDA: Shakshuka base: Eggs (2) poached = 144, 12P, 0C, 10F + Tomatoes (200g) = 36, 2P, 8C, 0F + Olive oil (14g) = 119, 0P, 0C, 14F + Pita (60g) = 165, 5P, 33C, 1F
    { name: "Shakshuka with Pita", desc: "Two eggs poached in spiced tomato sauce with cumin and paprika, served with warm pita bread", cal: 464, protein: 19, carbs: 41, fat: 25, weight: 340 },
  ],
  Lunch: [
    // USDA: Chicken breast grilled (150g) = 227 cal, 47g P, 0g C, 3g F + Brown rice cooked (150g) = 166 cal, 4g P, 35g C, 1g F + Mixed salad (100g) + olive oil (7g)
    { name: "Grilled Chicken Breast with Brown Rice", desc: "150g grilled skinless chicken breast with 150g steamed brown rice and garden salad with olive oil dressing", cal: 453, protein: 52, carbs: 38, fat: 10, weight: 420 },
    // USDA: Atlantic salmon baked (150g) = 312 cal, 34g P, 0g C, 19g F + Sweet potato baked (150g) = 135 cal, 2g P, 31g C, 0g F + Broccoli steamed (100g) = 35 cal, 2g P, 7g C, 0g F
    { name: "Baked Salmon with Sweet Potato", desc: "150g oven-baked Atlantic salmon fillet with 150g baked sweet potato and steamed broccoli", cal: 482, protein: 38, carbs: 38, fat: 19, weight: 400 },
    // USDA: Lean ground beef 90% (150g cooked) = 259 cal, 37g P, 0g C, 12g F + Zucchini (100g) = 17 cal + Bell pepper (100g) = 31 cal + Olive oil (7g) = 60 cal
    { name: "Beef Kofta with Grilled Vegetables", desc: "150g lean ground beef kofta kebabs with charred zucchini, bell peppers, tomatoes, and Arabic spices", cal: 367, protein: 38, carbs: 12, fat: 18, weight: 380 },
    // USDA: Canned tuna in water drained (142g can) = 179 cal, 39g P, 0g C, 1g F + Whole wheat bread (2 slices 60g) = 160 cal, 8P, 26C, 2F + Lettuce/tomato (80g) = 15 cal + Mayo light (15g) = 35 cal, 0P, 1C, 3F
    { name: "Tuna Sandwich on Whole Wheat", desc: "142g water-packed tuna on whole wheat bread with lettuce, tomato, and light mayo", cal: 389, protein: 47, carbs: 27, fat: 6, weight: 300 },
    // USDA: Chicken shawarma meat (150g) = 290 cal, 40g P, 2g C, 14g F + Whole wheat tortilla (65g) = 170 cal, 5P, 28C, 4F + Garlic sauce (30g) = 90 cal, 0P, 1C, 10F + Veggies (60g) = 12 cal
    { name: "Chicken Shawarma Wrap", desc: "150g shaved chicken shawarma in a whole wheat wrap with garlic toum, pickles, lettuce, and tomato", cal: 562, protein: 45, carbs: 31, fat: 28, weight: 305 },
    // USDA: Red lentils cooked (200g) = 230 cal, 18g P, 40g C, 1g F + Olive oil (7g) = 60 + Pita bread (60g) = 165 cal, 5P, 33C, 1F
    { name: "Red Lentil Soup with Bread", desc: "200g cooked red lentils with cumin and turmeric, finished with olive oil, served with pita bread", cal: 455, protein: 23, carbs: 73, fat: 8, weight: 330 },
    // USDA: Tofu firm (200g) = 176 cal, 20g P, 4g C, 10g F + Brown rice (150g cooked) = 166, 4P, 35C, 1F + Mixed veggies stir-fry (120g) = 50 cal + Soy sauce + Sesame oil (7g) = 60
    { name: "Tofu Stir-Fry with Brown Rice", desc: "200g firm tofu stir-fried with broccoli, bell pepper, and snap peas in soy-ginger sauce over brown rice", cal: 452, protein: 25, carbs: 46, fat: 18, weight: 480 },
    // USDA: Chickpeas cooked (150g) = 246 cal, 13g P, 41g C, 4g F + Jasmine rice cooked (150g) = 195 cal, 4P, 44C, 0F + Coconut milk (60ml) = 69 cal, 1P, 1C, 7F
    { name: "Chickpea Curry with Rice", desc: "150g chickpeas in coconut-tomato curry sauce with turmeric and garam masala, over jasmine rice", cal: 510, protein: 18, carbs: 86, fat: 11, weight: 420 },
    // USDA: Beef steak sirloin grilled (170g) = 328 cal, 46g P, 0g C, 15g F + Baked potato medium (173g) = 161 cal, 4P, 37C, 0F + Butter (7g) = 50 cal + Steamed green beans (80g) = 25 cal
    { name: "Grilled Sirloin Steak with Baked Potato", desc: "170g grilled beef sirloin with a medium baked potato, pat of butter, and steamed green beans", cal: 564, protein: 51, carbs: 39, fat: 20, weight: 430 },
    // USDA: Falafel baked (5 pieces ~125g) = 350 cal, 13g P, 40g C, 15g F + Hummus (60g) = 100, 5P, 8C, 6F + Pita (60g) = 165, 5P, 33C, 1F + Tabbouleh (80g) = 50 cal
    { name: "Falafel Plate with Hummus", desc: "5 oven-baked falafel with 60g hummus, tabbouleh, and warm pita bread", cal: 665, protein: 23, carbs: 83, fat: 24, weight: 325 },
    // USDA: Shrimp cooked (150g) = 142 cal, 29g P, 1g C, 2g F + Spaghetti cooked (150g) = 236, 8P, 46C, 1F + Tomato sauce (100g) = 29 cal + Olive oil (7g) = 60 cal + Garlic (5g) = 7 cal
    { name: "Garlic Shrimp Pasta", desc: "150g shrimp sautéed in garlic and olive oil with tomato sauce over whole wheat spaghetti", cal: 474, protein: 38, carbs: 50, fat: 13, weight: 420 },
    // USDA: Turkey breast deli (120g) = 130 cal, 26g P, 3g C, 1g F + Whole wheat wrap (65g) = 170, 5P, 28C, 4F + Avocado (50g) = 80, 1P, 4C, 7F + Veggies (50g) = 10 cal
    { name: "Turkey Avocado Wrap", desc: "120g sliced turkey breast with avocado, spinach, and tomato in a whole wheat tortilla wrap", cal: 390, protein: 32, carbs: 35, fat: 12, weight: 285 },
  ],
  Dinner: [
    // USDA: Salmon fillet baked (150g) = 312, 34P, 0C, 19F + Asparagus roasted (150g) = 30 cal, 3P, 4C, 0F + Olive oil (7g) = 60 cal + Lemon
    { name: "Grilled Salmon with Roasted Asparagus", desc: "150g baked salmon fillet with dill and lemon, paired with 150g roasted asparagus in olive oil", cal: 402, protein: 37, carbs: 4, fat: 26, weight: 310 },
    // USDA: Chicken thighs skinless baked (180g) = 292 cal, 37g P, 0g C, 16g F + Zucchini (100g) = 17 cal + Bell pepper (100g) = 31 cal + Olive oil (14g) = 119 cal
    { name: "Baked Chicken Thighs with Roasted Vegetables", desc: "180g skinless chicken thighs baked with paprika, served with roasted zucchini and bell peppers", cal: 459, protein: 38, carbs: 10, fat: 30, weight: 400 },
    // USDA: Chicken breast (150g grilled) = 227, 47P, 0C, 3F + Basmati rice cooked (130g) = 169, 4P, 37C, 0F + Yogurt sauce low-fat (60g) = 35, 3P, 5C, 1F + Almonds (10g) = 58, 2P, 2C, 5F
    { name: "Chicken Mansaf Lite", desc: "A lighter version of traditional mansaf: 150g chicken breast over basmati rice with low-fat yogurt sauce and toasted almonds", cal: 489, protein: 56, carbs: 44, fat: 9, weight: 350 },
    // USDA: Pasta cooked (150g) = 236, 8P, 46C, 1F + Ground beef lean 90% (100g cooked) = 173, 25P, 0C, 8F + Tomato sauce (120g) = 35 cal + Olive oil (7g) = 60 + Parmesan (10g) = 43 cal, 4P, 0C, 3F
    { name: "Beef Bolognese Pasta", desc: "150g whole wheat pasta with 100g lean ground beef bolognese sauce, topped with grated Parmesan", cal: 547, protein: 38, carbs: 52, fat: 19, weight: 390 },
    // USDA: Eggs (3) = 216, 18P, 0C, 15F + Spinach (50g) = 12, 1P, 2C, 0F + Tomato (50g) = 9 cal + Cheddar (20g) = 80, 5P, 0C, 7F + Olive oil (7g) = 60
    { name: "Loaded Veggie Omelette", desc: "3-egg omelette loaded with baby spinach, diced tomato, and sharp cheddar cheese", cal: 377, protein: 25, carbs: 3, fat: 29, weight: 250 },
    // USDA: White fish tilapia baked (150g) = 163, 34P, 0C, 3F + Quinoa cooked (150g) = 180, 7P, 30C, 3F + Steamed broccoli (100g) = 35, 2P, 7C, 0F + Lemon-herb sauce (olive oil 7g) = 60
    { name: "Baked Tilapia with Quinoa", desc: "150g baked tilapia fillet with herbs and lemon, served with fluffy quinoa and steamed broccoli", cal: 438, protein: 43, carbs: 37, fat: 12, weight: 410 },
    // USDA: Ground turkey 93% lean (150g cooked) = 226, 34P, 0C, 10F + Taco shell corn (2 = 26g) = 118, 2P, 16C, 6F + Lettuce/tomato/salsa (80g) = 20 cal + Sour cream (30g) = 57, 1P, 1C, 6F
    { name: "Ground Turkey Tacos", desc: "150g seasoned lean ground turkey in 2 corn taco shells with lettuce, tomato, salsa, and sour cream", cal: 421, protein: 37, carbs: 19, fat: 22, weight: 290 },
    // USDA: Chicken breast (150g) = 227, 47P, 0C, 3F + Basmati rice (150g cooked) = 195, 4P, 44C, 0F + Curry sauce light (100g) = 80, 2P, 8C, 4F
    { name: "Chicken Tikka with Basmati Rice", desc: "150g tandoori-spiced chicken breast with light curry sauce over fragrant basmati rice", cal: 502, protein: 53, carbs: 52, fat: 7, weight: 400 },
    // USDA: Lamb loin chop grilled (120g) = 254, 26P, 0C, 16F + Couscous cooked (150g) = 176, 6P, 36C, 0F + Roasted veggies (100g) = 50 + Olive oil (7g) = 60
    { name: "Grilled Lamb Chops with Couscous", desc: "120g grilled lamb loin chops with herbed couscous and a medley of roasted Mediterranean vegetables", cal: 540, protein: 33, carbs: 38, fat: 27, weight: 380 },
    // USDA: Shrimp (120g) = 113, 23P, 1C, 1F + Butter (14g) = 100, 0P, 0C, 12F + Garlic + Spaghetti (100g cooked) = 157, 6P, 31C, 1F + Parsley + Lemon
    { name: "Shrimp Scampi with Spaghetti", desc: "120g shrimp sautéed in garlic butter and white wine over whole wheat spaghetti with fresh parsley", cal: 380, protein: 30, carbs: 33, fat: 14, weight: 300 },
  ],
  Snack: [
    // USDA: Almonds (28g/23 almonds) = 164, 6P, 6C, 14F + Walnuts (14g) = 91, 2P, 2C, 9F + Medjool dates (2 = 48g) = 133, 1P, 36C, 0F
    { name: "Mixed Nuts & Medjool Dates", desc: "28g raw almonds, 14g walnuts, and 2 Medjool dates", cal: 388, protein: 9, carbs: 44, fat: 23, weight: 90 },
    // USDA: Apple medium (182g) = 95, 0P, 25C, 0F + Peanut butter (32g/2tbsp) = 188, 7P, 7C, 16F
    { name: "Apple Slices with Peanut Butter", desc: "1 medium Gala apple sliced with 2 tbsp all-natural peanut butter", cal: 283, protein: 7, carbs: 32, fat: 16, weight: 214 },
    // USDA: Hard-boiled egg (2 large = 100g) = 155, 13P, 1C, 11F
    { name: "Hard-Boiled Eggs (2)", desc: "2 large hard-boiled eggs with a pinch of sea salt and black pepper", cal: 155, protein: 13, carbs: 1, fat: 11, weight: 100 },
    // USDA: Greek yogurt nonfat (170g) = 100, 17P, 6C, 1F + Honey (10g) = 30, 0P, 8C, 0F
    { name: "Greek Yogurt with Honey", desc: "170g nonfat Greek yogurt drizzled with 10g raw honey", cal: 130, protein: 17, carbs: 14, fat: 1, weight: 180 },
    // USDA: Hummus (60g) = 100, 5P, 8C, 6F + Carrot sticks (80g) = 33, 1P, 8C, 0F + Cucumber (60g) = 9, 0P, 2C, 0F + Celery (60g) = 10, 0P, 2C, 0F
    { name: "Hummus with Veggie Sticks", desc: "60g classic hummus with carrot sticks, cucumber, and celery", cal: 152, protein: 6, carbs: 20, fat: 6, weight: 260 },
    // USDA: Cottage cheese 2% (113g) = 92, 12P, 5C, 3F + Pineapple chunks (80g) = 40, 0P, 10C, 0F
    { name: "Cottage Cheese with Pineapple", desc: "113g low-fat cottage cheese topped with 80g fresh pineapple chunks", cal: 132, protein: 12, carbs: 15, fat: 3, weight: 193 },
    // USDA: Banana medium (118g) = 105, 1P, 27C, 0F + Almond butter (16g/1tbsp) = 98, 3P, 3C, 9F
    { name: "Banana with Almond Butter", desc: "1 medium banana with 1 tbsp almond butter", cal: 203, protein: 4, carbs: 30, fat: 9, weight: 134 },
    // USDA: Protein bar average = 210, 20P, 24C, 6F
    { name: "Protein Bar", desc: "1 high-protein bar (approximately 60g)", cal: 210, protein: 20, carbs: 24, fat: 6, weight: 60 },
    // USDA: Trail mix (40g) = 200, 5P, 18C, 13F
    { name: "Trail Mix (Dried Fruit & Nuts)", desc: "40g trail mix with raisins, peanuts, sunflower seeds, and dark chocolate chips", cal: 200, protein: 5, carbs: 18, fat: 13, weight: 40 },
    // USDA: Rice cake (9g) = 35, 1P, 7C, 0F + Avocado (40g) = 64, 1P, 3C, 6F + Cherry tomatoes (40g) = 7 cal
    { name: "Rice Cake with Avocado", desc: "1 plain rice cake topped with smashed avocado and cherry tomato slices", cal: 106, protein: 2, carbs: 10, fat: 6, weight: 89 },
    // USDA: Edamame shelled (80g) = 100, 9P, 8C, 4F
    { name: "Steamed Edamame", desc: "80g shelled edamame lightly salted", cal: 100, protein: 9, carbs: 8, fat: 4, weight: 80 },
    // USDA: String cheese (1 stick 28g) = 80, 7P, 1C, 5F + Baby carrots (85g) = 30, 1P, 7C, 0F
    { name: "String Cheese & Baby Carrots", desc: "1 mozzarella string cheese stick with a serving of baby carrots", cal: 110, protein: 8, carbs: 8, fat: 5, weight: 113 },
  ],
};

// ── MASSIVE GROCERY LIST — 155 items across 10 real store categories ─────────
const GROCERY_DATA = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ── PRODUCE — FRUITS (16 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Organic Bananas", qty: "1 bunch (6-7)", cat: "Produce" },
  { name: "Gala Apples", qty: "6 units", cat: "Produce" },
  { name: "Hass Avocados", qty: "4 units", cat: "Produce" },
  { name: "Fresh Lemons", qty: "4 units", cat: "Produce" },
  { name: "Fresh Limes", qty: "4 units", cat: "Produce" },
  { name: "Navel Oranges", qty: "6 units", cat: "Produce" },
  { name: "Fresh Blueberries", qty: "1 pint (310g)", cat: "Produce" },
  { name: "Fresh Raspberries", qty: "1 pack (170g)", cat: "Produce" },
  { name: "Fresh Strawberries", qty: "1 lb (450g)", cat: "Produce" },
  { name: "Red Grapes (Seedless)", qty: "1 bunch (500g)", cat: "Produce" },
  { name: "Ripe Mangoes", qty: "2 units", cat: "Produce" },
  { name: "Fresh Pineapple", qty: "1 whole", cat: "Produce" },
  { name: "Kiwi Fruit", qty: "4 units", cat: "Produce" },
  { name: "Fuji Pears", qty: "4 units", cat: "Produce" },
  { name: "Watermelon (Seedless)", qty: "1 mini (3-4 lb)", cat: "Produce" },
  { name: "Medjool Dates (Fresh)", qty: "350g box", cat: "Produce" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── PRODUCE — VEGETABLES (28 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Baby Spinach", qty: "300g bag", cat: "Produce" },
  { name: "Romaine Lettuce Hearts", qty: "3-pack", cat: "Produce" },
  { name: "Mixed Salad Greens", qty: "300g bag", cat: "Produce" },
  { name: "Fresh Kale (Curly)", qty: "1 bunch (200g)", cat: "Produce" },
  { name: "Fresh Broccoli Crowns", qty: "500g", cat: "Produce" },
  { name: "Fresh Asparagus", qty: "1 bunch (350g)", cat: "Produce" },
  { name: "Cauliflower Head", qty: "1 medium", cat: "Produce" },
  { name: "Green Zucchini", qty: "4 medium", cat: "Produce" },
  { name: "Red Bell Peppers", qty: "3 units", cat: "Produce" },
  { name: "Yellow Bell Peppers", qty: "2 units", cat: "Produce" },
  { name: "Green Bell Peppers", qty: "2 units", cat: "Produce" },
  { name: "Cherry Tomatoes", qty: "1 pint (300g)", cat: "Produce" },
  { name: "Roma Tomatoes", qty: "6 units", cat: "Produce" },
  { name: "English Cucumber", qty: "2 units", cat: "Produce" },
  { name: "Sweet Potatoes", qty: "1.5 kg", cat: "Produce" },
  { name: "Russet Baking Potatoes", qty: "1 kg (4-5 units)", cat: "Produce" },
  { name: "Baby Red Potatoes", qty: "750g bag", cat: "Produce" },
  { name: "Yellow Onions", qty: "3 lb bag", cat: "Produce" },
  { name: "Red Onion", qty: "2 units", cat: "Produce" },
  { name: "Fresh Garlic", qty: "2 heads", cat: "Produce" },
  { name: "Fresh Ginger Root", qty: "1 piece (100g)", cat: "Produce" },
  { name: "Baby Carrots", qty: "450g bag", cat: "Produce" },
  { name: "Celery Stalks", qty: "1 bunch", cat: "Produce" },
  { name: "Green Beans (Fresh)", qty: "300g", cat: "Produce" },
  { name: "Snap Peas (Sugar Snap)", qty: "200g", cat: "Produce" },
  { name: "Button Mushrooms", qty: "250g pack", cat: "Produce" },
  { name: "Corn on the Cob", qty: "4 ears", cat: "Produce" },
  { name: "Jalapeño Peppers", qty: "4 units", cat: "Produce" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── FRESH HERBS (6 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Fresh Flat-Leaf Parsley", qty: "1 bunch", cat: "Fresh Herbs" },
  { name: "Fresh Mint", qty: "1 bunch", cat: "Fresh Herbs" },
  { name: "Fresh Cilantro (Coriander)", qty: "1 bunch", cat: "Fresh Herbs" },
  { name: "Fresh Basil", qty: "1 bunch", cat: "Fresh Herbs" },
  { name: "Fresh Dill", qty: "1 bunch", cat: "Fresh Herbs" },
  { name: "Fresh Rosemary", qty: "1 bunch", cat: "Fresh Herbs" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── MEAT & POULTRY (14 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Boneless Skinless Chicken Breasts", qty: "1.5 kg", cat: "Meat & Poultry" },
  { name: "Chicken Thighs (Skinless)", qty: "1 kg", cat: "Meat & Poultry" },
  { name: "Whole Roasting Chicken", qty: "1 whole (1.5 kg)", cat: "Meat & Poultry" },
  { name: "Chicken Drumsticks", qty: "1 kg (8 pieces)", cat: "Meat & Poultry" },
  { name: "Lean Ground Beef (90/10)", qty: "750g", cat: "Meat & Poultry" },
  { name: "Beef Sirloin Steak", qty: "500g (2 steaks)", cat: "Meat & Poultry" },
  { name: "Beef Tenderloin", qty: "400g", cat: "Meat & Poultry" },
  { name: "Lean Ground Turkey (93/7)", qty: "500g", cat: "Meat & Poultry" },
  { name: "Turkey Breast Deli Slices", qty: "250g", cat: "Meat & Poultry" },
  { name: "Turkey Sausage Links", qty: "1 pack (8 links)", cat: "Meat & Poultry" },
  { name: "Lamb Loin Chops", qty: "400g (4 chops)", cat: "Meat & Poultry" },
  { name: "Lamb Leg Steak (Boneless)", qty: "500g", cat: "Meat & Poultry" },
  { name: "Beef Kofta (Ground Lamb/Beef)", qty: "500g", cat: "Meat & Poultry" },
  { name: "Chicken Shawarma Strips (Marinated)", qty: "500g", cat: "Meat & Poultry" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── SEAFOOD (8 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Atlantic Salmon Fillets (Fresh)", qty: "600g (4 fillets)", cat: "Seafood" },
  { name: "Salmon Steaks (Skin-On)", qty: "400g (2 steaks)", cat: "Seafood" },
  { name: "Raw Shrimp (Peeled & Deveined)", qty: "450g", cat: "Seafood" },
  { name: "Tilapia Fillets (Fresh)", qty: "500g", cat: "Seafood" },
  { name: "Cod Fillets (Fresh)", qty: "400g", cat: "Seafood" },
  { name: "Sea Bass Fillets", qty: "400g (2 fillets)", cat: "Seafood" },
  { name: "Canned Albacore Tuna (Water-Packed)", qty: "4 cans (142g each)", cat: "Seafood" },
  { name: "Canned Wild Salmon", qty: "2 cans (213g each)", cat: "Seafood" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── DAIRY & EGGS (14 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Large Organic Eggs", qty: "2 dozen", cat: "Dairy & Eggs" },
  { name: "Egg Whites (Liquid Carton)", qty: "500ml", cat: "Dairy & Eggs" },
  { name: "Greek Yogurt (Nonfat Plain)", qty: "1 kg tub", cat: "Dairy & Eggs" },
  { name: "Greek Yogurt (Vanilla)", qty: "500g tub", cat: "Dairy & Eggs" },
  { name: "Labneh (Strained Yogurt)", qty: "500g tub", cat: "Dairy & Eggs" },
  { name: "Low-Fat Cottage Cheese 2%", qty: "450g tub", cat: "Dairy & Eggs" },
  { name: "Unsweetened Almond Milk", qty: "1 L carton", cat: "Dairy & Eggs" },
  { name: "Whole Milk (Organic)", qty: "1 L carton", cat: "Dairy & Eggs" },
  { name: "Feta Cheese (Crumbled)", qty: "200g", cat: "Dairy & Eggs" },
  { name: "Fresh Mozzarella Ball", qty: "250g", cat: "Dairy & Eggs" },
  { name: "Mozzarella String Cheese", qty: "12-pack", cat: "Dairy & Eggs" },
  { name: "Sharp Cheddar Cheese (Block)", qty: "225g", cat: "Dairy & Eggs" },
  { name: "Parmesan Cheese (Grated)", qty: "100g", cat: "Dairy & Eggs" },
  { name: "Unsalted Butter", qty: "250g block", cat: "Dairy & Eggs" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── PANTRY & GRAINS (22 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Whole-Grain Rolled Oats", qty: "500g", cat: "Pantry & Grains" },
  { name: "Steel-Cut Oats", qty: "400g", cat: "Pantry & Grains" },
  { name: "Brown Rice (Long Grain)", qty: "1 kg bag", cat: "Pantry & Grains" },
  { name: "Basmati Rice", qty: "1 kg bag", cat: "Pantry & Grains" },
  { name: "Jasmine Rice", qty: "1 kg bag", cat: "Pantry & Grains" },
  { name: "Whole Wheat Spaghetti", qty: "500g box", cat: "Pantry & Grains" },
  { name: "Whole Wheat Penne Pasta", qty: "500g box", cat: "Pantry & Grains" },
  { name: "Fusilli Pasta", qty: "500g box", cat: "Pantry & Grains" },
  { name: "Quinoa (Tri-Color)", qty: "400g bag", cat: "Pantry & Grains" },
  { name: "Couscous", qty: "300g box", cat: "Pantry & Grains" },
  { name: "Bulgur Wheat", qty: "500g bag", cat: "Pantry & Grains" },
  { name: "Dried Red Lentils", qty: "500g bag", cat: "Pantry & Grains" },
  { name: "Dried Green Lentils", qty: "500g bag", cat: "Pantry & Grains" },
  { name: "Canned Chickpeas", qty: "3 cans (400g each)", cat: "Pantry & Grains" },
  { name: "Canned Black Beans", qty: "2 cans (400g each)", cat: "Pantry & Grains" },
  { name: "Canned Kidney Beans", qty: "2 cans (400g each)", cat: "Pantry & Grains" },
  { name: "Canned Fava Beans (Ful)", qty: "2 cans (400g each)", cat: "Pantry & Grains" },
  { name: "Canned Diced Tomatoes", qty: "3 cans (400g each)", cat: "Pantry & Grains" },
  { name: "Tomato Paste (Concentrated)", qty: "2 tubes (140g each)", cat: "Pantry & Grains" },
  { name: "Coconut Milk (Light)", qty: "2 cans (400ml each)", cat: "Pantry & Grains" },
  { name: "Classic Hummus", qty: "400g tub", cat: "Pantry & Grains" },
  { name: "Plain Rice Cakes", qty: "1 pack (12 cakes)", cat: "Pantry & Grains" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── BAKERY (6 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Whole Wheat Bread (Sliced)", qty: "1 loaf", cat: "Bakery" },
  { name: "Sourdough Bread (Artisan)", qty: "1 loaf", cat: "Bakery" },
  { name: "Multigrain Bread", qty: "1 loaf", cat: "Bakery" },
  { name: "Whole Wheat Pita Bread", qty: "1 pack (8 pcs)", cat: "Bakery" },
  { name: "Whole Wheat Tortilla Wraps", qty: "1 pack (8 wraps)", cat: "Bakery" },
  { name: "Corn Taco Shells", qty: "1 box (12 shells)", cat: "Bakery" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── NUTS, SEEDS & DRIED FRUIT (14 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Raw Almonds (Whole)", qty: "250g bag", cat: "Nuts & Seeds" },
  { name: "Raw Walnuts (Halves)", qty: "200g bag", cat: "Nuts & Seeds" },
  { name: "Raw Cashews (Unsalted)", qty: "200g bag", cat: "Nuts & Seeds" },
  { name: "Raw Pistachios (Shelled)", qty: "200g bag", cat: "Nuts & Seeds" },
  { name: "Pine Nuts", qty: "100g bag", cat: "Nuts & Seeds" },
  { name: "Chia Seeds", qty: "250g bag", cat: "Nuts & Seeds" },
  { name: "Flaxseeds (Ground)", qty: "250g bag", cat: "Nuts & Seeds" },
  { name: "Sunflower Seeds (Raw)", qty: "200g bag", cat: "Nuts & Seeds" },
  { name: "Pumpkin Seeds (Pepitas)", qty: "200g bag", cat: "Nuts & Seeds" },
  { name: "All-Natural Peanut Butter", qty: "1 jar (340g)", cat: "Nuts & Seeds" },
  { name: "Almond Butter", qty: "1 jar (250g)", cat: "Nuts & Seeds" },
  { name: "Tahini (Sesame Paste)", qty: "1 jar (300g)", cat: "Nuts & Seeds" },
  { name: "Trail Mix (Fruit & Nut)", qty: "300g bag", cat: "Nuts & Seeds" },
  { name: "Dried Cranberries (Unsweetened)", qty: "200g bag", cat: "Nuts & Seeds" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── OILS, SPICES & CONDIMENTS (18 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Extra Virgin Olive Oil", qty: "750ml bottle", cat: "Oils & Condiments" },
  { name: "Avocado Oil", qty: "500ml bottle", cat: "Oils & Condiments" },
  { name: "Coconut Oil (Virgin)", qty: "300ml jar", cat: "Oils & Condiments" },
  { name: "Sesame Oil (Toasted)", qty: "250ml bottle", cat: "Oils & Condiments" },
  { name: "Light Mayonnaise", qty: "1 squeeze bottle", cat: "Oils & Condiments" },
  { name: "Dijon Mustard", qty: "200g jar", cat: "Oils & Condiments" },
  { name: "Low-Sodium Soy Sauce", qty: "250ml bottle", cat: "Oils & Condiments" },
  { name: "Balsamic Vinegar", qty: "250ml bottle", cat: "Oils & Condiments" },
  { name: "Apple Cider Vinegar", qty: "500ml bottle", cat: "Oils & Condiments" },
  { name: "Hot Sauce (Sriracha)", qty: "480ml bottle", cat: "Oils & Condiments" },
  { name: "Garlic Toum Sauce", qty: "250g jar", cat: "Oils & Condiments" },
  { name: "Raw Organic Honey", qty: "350g jar", cat: "Oils & Condiments" },
  { name: "Za'atar Spice Blend", qty: "100g jar", cat: "Oils & Condiments" },
  { name: "Ground Cumin", qty: "50g jar", cat: "Oils & Condiments" },
  { name: "Smoked Paprika", qty: "50g jar", cat: "Oils & Condiments" },
  { name: "Ground Turmeric", qty: "50g jar", cat: "Oils & Condiments" },
  { name: "Ground Cinnamon", qty: "50g jar", cat: "Oils & Condiments" },
  { name: "Garam Masala", qty: "50g jar", cat: "Oils & Condiments" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── FROZEN FOODS (10 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Frozen Broccoli Florets", qty: "500g bag", cat: "Frozen Foods" },
  { name: "Frozen Mixed Vegetables", qty: "750g bag", cat: "Frozen Foods" },
  { name: "Frozen Edamame (Shelled)", qty: "400g bag", cat: "Frozen Foods" },
  { name: "Frozen Sweet Corn Kernels", qty: "500g bag", cat: "Frozen Foods" },
  { name: "Frozen Spinach (Chopped)", qty: "400g bag", cat: "Frozen Foods" },
  { name: "Frozen Cauliflower Rice", qty: "350g bag", cat: "Frozen Foods" },
  { name: "Frozen Mixed Berries", qty: "500g bag", cat: "Frozen Foods" },
  { name: "Frozen Mango Chunks", qty: "400g bag", cat: "Frozen Foods" },
  { name: "Frozen Salmon Fillets", qty: "4-pack (500g)", cat: "Frozen Foods" },
  { name: "Frozen Chicken Breast Strips", qty: "750g bag", cat: "Frozen Foods" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ── BEVERAGES & SUPPLEMENTS (9 items) ──
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Green Tea Bags (Organic)", qty: "1 box (20 bags)", cat: "Beverages" },
  { name: "Chamomile Tea Bags", qty: "1 box (20 bags)", cat: "Beverages" },
  { name: "Ground Coffee (Medium Roast)", qty: "250g bag", cat: "Beverages" },
  { name: "Sparkling Water (Plain)", qty: "6-pack (500ml each)", cat: "Beverages" },
  { name: "Coconut Water", qty: "1 L carton", cat: "Beverages" },
  { name: "Fresh Orange Juice (Not from Concentrate)", qty: "1 L bottle", cat: "Beverages" },
  { name: "Whey Protein Powder (Vanilla)", qty: "900g tub", cat: "Beverages" },
  { name: "Granola (Low-Sugar)", qty: "400g bag", cat: "Beverages" },
  { name: "Dark Chocolate (85% Cacao)", qty: "100g bar", cat: "Beverages" },
];

async function main() {
  console.log("🌱 Starting BIG database seeding (real USDA nutritional data)...\n");
  const now = new Date();

  // ── 1. CLEANUP ──────────────────────────────────────────────────────────────
  console.log("🗑️  Cleaning existing records...");
  await prisma.aiRecommendation.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.groceryItem.deleteMany();
  await prisma.mealPlanMeal.deleteMany();
  await prisma.mealPlanDay.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.mealPlanPreference.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleanup complete.\n");

  // ── 2. USERS ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);
  console.log("👤 Creating users...");
  const mohammad = await prisma.user.create({ data: { email: "mohammad@rightbite.com", passwordHash } });
  const sarah = await prisma.user.create({ data: { email: "sarah@rightbite.com", passwordHash } });
  const guest = await prisma.user.create({ data: { email: "guest@rightbite.com", passwordHash } });
  console.log(`✅ Users: mohammad (${mohammad.id}), sarah (${sarah.id}), guest (${guest.id})\n`);

  // ── 3. PROFILES ─────────────────────────────────────────────────────────────
  console.log("📋 Seeding profiles...");
  await prisma.profile.create({
    data: {
      userId: mohammad.id, fullName: "Mohammad Al-Sheikh", age: 28, sex: "male",
      heightCm: 178.0, currentWeightKg: 82.5, targetWeightKg: 75.0,
      goal: "Weight Loss", activityLevel: "Moderate",
      primaryDietaryStyle: "Standard Balanced",
      allergiesText: "Mushrooms", dislikedFoodsText: "Mustard",
      targetCalories: 2000, targetProteinG: 140, targetCarbsG: 210, targetFatG: 65,
    },
  });
  await prisma.profile.create({
    data: {
      userId: sarah.id, fullName: "Sarah Hassan", age: 24, sex: "female",
      heightCm: 165.0, currentWeightKg: 62.0, targetWeightKg: 58.0,
      goal: "Lean & Tone", activityLevel: "Active",
      primaryDietaryStyle: "Mediterranean",
      allergiesText: "Shellfish", dislikedFoodsText: "Eggplant",
      targetCalories: 1800, targetProteinG: 110, targetCarbsG: 195, targetFatG: 60,
    },
  });
  await prisma.profile.create({
    data: {
      userId: guest.id, fullName: "Guest User", age: 30, sex: "male",
      heightCm: 175.0, currentWeightKg: 80.0, targetWeightKg: 75.0,
      goal: "General Fitness", activityLevel: "Light",
      primaryDietaryStyle: "Standard Balanced",
      allergiesText: "None", dislikedFoodsText: "None",
      targetCalories: 2200, targetProteinG: 120, targetCarbsG: 250, targetFatG: 70,
    },
  });
  console.log("✅ 3 profiles seeded.\n");

  // ── 4. WEIGHT LOGS (30 days for Mohammad, 20 days for Sarah) ────────────────
  console.log("📈 Seeding weight history...");
  // Mohammad: 30-day realistic journey from 86.0 → 82.5 kg
  const mohammadWeights = [
    86.0, 85.8, 85.9, 85.5, 85.3, 85.1, 85.2, 84.9, 84.7, 84.5,
    84.6, 84.3, 84.1, 83.9, 84.0, 83.7, 83.5, 83.4, 83.6, 83.3,
    83.1, 83.0, 83.2, 82.9, 82.8, 82.7, 82.9, 82.6, 82.5, 82.5,
  ];
  for (let i = 0; i < mohammadWeights.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (mohammadWeights.length - 1 - i));
    d.setHours(7, 30, 0, 0);
    await prisma.weightLog.create({ data: { userId: mohammad.id, weightKg: mohammadWeights[i], loggedAt: d } });
  }
  // Sarah: 20-day journey from 64.0 → 62.0 kg
  const sarahWeights = [
    64.0, 63.8, 63.9, 63.6, 63.5, 63.4, 63.2, 63.3, 63.0, 62.9,
    63.0, 62.7, 62.6, 62.5, 62.6, 62.4, 62.3, 62.1, 62.0, 62.0,
  ];
  for (let i = 0; i < sarahWeights.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (sarahWeights.length - 1 - i));
    d.setHours(7, 0, 0, 0);
    await prisma.weightLog.create({ data: { userId: sarah.id, weightKg: sarahWeights[i], loggedAt: d } });
  }
  console.log(`✅ Weight logs: ${mohammadWeights.length} for Mohammad, ${sarahWeights.length} for Sarah.\n`);

  // ── 5. MEAL PLAN PREFERENCES ────────────────────────────────────────────────
  console.log("🍽️  Seeding meal plan preferences...");
  const mohammadPref = await prisma.mealPlanPreference.create({
    data: {
      userId: mohammad.id, mealsPerDay: 4,
      proteinSourcesJson: JSON.stringify(["Chicken", "Fish", "Beef", "Eggs", "Dairy"]),
      avoidFoodsText: "Mushrooms", cookingEffort: "easy", budgetLevel: "moderate",
      cuisineStyle: "mixed", varietyLevel: "high",
      extraNotes: "High protein, moderate carb. Mix of Arabic and Western meals.",
    },
  });
  const sarahPref = await prisma.mealPlanPreference.create({
    data: {
      userId: sarah.id, mealsPerDay: 3,
      proteinSourcesJson: JSON.stringify(["Chicken", "Fish", "Eggs", "Tofu", "Legumes"]),
      avoidFoodsText: "Shellfish, Eggplant", cookingEffort: "moderate", budgetLevel: "moderate",
      cuisineStyle: "mediterranean", varietyLevel: "high",
      extraNotes: "Mediterranean focus. More plant-based options.",
    },
  });
  console.log("✅ Preferences seeded.\n");

  // ── 6. WEEKLY MEAL PLANS (Full 7-day plans) ─────────────────────────────────
  console.log("📅 Seeding full weekly meal plans...");
  const weekStart = new Date(now);
  const currentDay = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const mohammadPlan = await prisma.mealPlan.create({
    data: {
      userId: mohammad.id, preferenceId: mohammadPref.id,
      weekStartDate: weekStart, weekEndDate: weekEnd, status: "active",
      generatedByModel: "gemini-2.5-flash", generationMode: "auto",
      generationNotes: "Optimized for weight loss: ~2000 kcal/day, 140g+ protein.",
    },
  });
  const sarahPlan = await prisma.mealPlan.create({
    data: {
      userId: sarah.id, preferenceId: sarahPref.id,
      weekStartDate: weekStart, weekEndDate: weekEnd, status: "active",
      generatedByModel: "gemini-2.5-flash", generationMode: "auto",
      generationNotes: "Mediterranean lean plan: ~1800 kcal/day, 110g protein.",
    },
  });

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const B = REAL_MEALS.Breakfast;
  const L = REAL_MEALS.Lunch;
  const D = REAL_MEALS.Dinner;
  const S = REAL_MEALS.Snack;

  // Mohammad's 7-day plan — each day gets unique meals
  const mohammadWeek = [
    { b: B[0], l: L[0], d: D[0], s: S[0] }, // Mon
    { b: B[1], l: L[1], d: D[1], s: S[1] }, // Tue
    { b: B[2], l: L[2], d: D[2], s: S[2] }, // Wed
    { b: B[3], l: L[3], d: D[3], s: S[3] }, // Thu
    { b: B[4], l: L[4], d: D[4], s: S[4] }, // Fri
    { b: B[5], l: L[5], d: D[5], s: S[5] }, // Sat
    { b: B[6], l: L[6], d: D[6], s: S[6] }, // Sun
  ];

  for (let i = 0; i < 7; i++) {
    const dm = mohammadWeek[i];
    const dayMeals = [dm.b, dm.l, dm.d, dm.s];
    const totals = dayMeals.reduce((acc, m) => ({ cal: acc.cal + m.cal, p: acc.p + m.protein, c: acc.c + m.carbs, f: acc.f + m.fat }), { cal: 0, p: 0, c: 0, f: 0 });

    const mealPlanDay = await prisma.mealPlanDay.create({
      data: { mealPlanId: mohammadPlan.id, dayName: DAYS[i], dayOrder: i + 1, totalCalories: totals.cal, totalProteinG: totals.p, totalCarbsG: totals.c, totalFatG: totals.f },
    });

    const types = ["Breakfast", "Lunch", "Dinner", "Snack"];
    for (let j = 0; j < dayMeals.length; j++) {
      const m = dayMeals[j];
      await prisma.mealPlanMeal.create({
        data: { mealPlanDayId: mealPlanDay.id, mealType: types[j], mealOrder: j + 1, mealName: m.name, description: m.desc, ingredientsText: m.desc, estimatedWeightG: m.weight, calories: m.cal, proteinG: m.protein, carbsG: m.carbs, fatG: m.fat },
      });
    }
  }

  // Sarah's 7-day plan — offset selections for variety
  const sarahWeek = [
    { b: B[2], l: L[6], d: D[5], s: S[4] },
    { b: B[8], l: L[1], d: D[0], s: S[6] },
    { b: B[0], l: L[9], d: D[7], s: S[10] },
    { b: B[1], l: L[7], d: D[8], s: S[3] },
    { b: B[5], l: L[11], d: D[9], s: S[11] },
    { b: B[9], l: L[5], d: D[4], s: S[9] },
    { b: B[7], l: L[10], d: D[6], s: S[7] },
  ];

  for (let i = 0; i < 7; i++) {
    const ds = sarahWeek[i];
    const dayMeals = [ds.b, ds.l, ds.d, ds.s];
    const totals = dayMeals.reduce((acc, m) => ({ cal: acc.cal + m.cal, p: acc.p + m.protein, c: acc.c + m.carbs, f: acc.f + m.fat }), { cal: 0, p: 0, c: 0, f: 0 });

    const mealPlanDay = await prisma.mealPlanDay.create({
      data: { mealPlanId: sarahPlan.id, dayName: DAYS[i], dayOrder: i + 1, totalCalories: totals.cal, totalProteinG: totals.p, totalCarbsG: totals.c, totalFatG: totals.f },
    });

    const types = ["Breakfast", "Lunch", "Dinner", "Snack"];
    for (let j = 0; j < dayMeals.length; j++) {
      const m = dayMeals[j];
      await prisma.mealPlanMeal.create({
        data: { mealPlanDayId: mealPlanDay.id, mealType: types[j], mealOrder: j + 1, mealName: m.name, description: m.desc, ingredientsText: m.desc, estimatedWeightG: m.weight, calories: m.cal, proteinG: m.protein, carbsG: m.carbs, fatG: m.fat },
      });
    }
  }
  console.log("✅ Two complete 7-day meal plans seeded (56 individual meals).\n");

  // ── 7. GROCERY ITEMS (65 items across 8 categories) ─────────────────────────
  console.log("🛒 Seeding grocery items (155 items)...");
  for (let i = 0; i < GROCERY_DATA.length; i++) {
    const item = GROCERY_DATA[i];
    // Mark roughly 20% as already checked off for realism
    const isChecked = i % 5 === 0;
    await prisma.groceryItem.create({
      data: {
        mealPlanId: mohammadPlan.id, itemName: item.name, quantityText: item.qty,
        category: item.cat, isChecked, isUserAdded: false,
      },
    });
  }
  // Also seed some grocery items for Sarah's plan
  const sarahGrocerySubset = GROCERY_DATA.filter(g =>
    ["Produce", "Seafood", "Dairy & Eggs", "Pantry & Grains"].includes(g.cat)
  );
  for (let i = 0; i < sarahGrocerySubset.length; i++) {
    const item = sarahGrocerySubset[i];
    await prisma.groceryItem.create({
      data: {
        mealPlanId: sarahPlan.id, itemName: item.name, quantityText: item.qty,
        category: item.cat, isChecked: i % 4 === 0, isUserAdded: false,
      },
    });
  }
  console.log(`✅ ${GROCERY_DATA.length} grocery items for Mohammad + ${sarahGrocerySubset.length} for Sarah.\n`);

  // ── 8. MEAL LOGS (30 days × 3-4 meals/day = ~110 entries for Mohammad) ──────
  console.log("🍽️  Seeding 30-day meal log history...");
  let mohammadLogCount = 0;
  let sarahLogCount = 0;

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - daysAgo);
    logDate.setHours(0, 0, 0, 0);

    // Pick meals deterministically based on day index for variety
    const dayIndex = 29 - daysAgo;
    const bIdx = dayIndex % B.length;
    const lIdx = dayIndex % L.length;
    const dIdx = dayIndex % D.length;
    const sIdx = dayIndex % S.length;

    const todayMeals = [
      { meal: B[bIdx], type: "Breakfast", hour: 7 + (dayIndex % 3) }, // 7-9am
      { meal: L[lIdx], type: "Lunch", hour: 12 + (dayIndex % 2) },   // 12-1pm
      { meal: D[dIdx], type: "Dinner", hour: 18 + (dayIndex % 3) },  // 6-8pm
    ];
    // Add snack most days (skip every 5th day)
    if (dayIndex % 5 !== 4) {
      todayMeals.push({ meal: S[sIdx], type: "Snack", hour: 15 + (dayIndex % 2) }); // 3-4pm
    }

    for (const entry of todayMeals) {
      const loggedTime = new Date(logDate);
      loggedTime.setHours(entry.hour, (dayIndex * 7) % 60, 0, 0);

      await prisma.mealLog.create({
        data: {
          userId: mohammad.id,
          mealType: entry.type,
          source: daysAgo <= 6 ? "plan" : "manual",
          mealName: entry.meal.name,
          description: entry.meal.desc,
          calories: entry.meal.cal,
          proteinG: entry.meal.protein,
          carbsG: entry.meal.carbs,
          fatG: entry.meal.fat,
          estimatedWeightG: entry.meal.weight,
          loggedDate: logDate,
          loggedTime: loggedTime,
        },
      });
      mohammadLogCount++;
    }
  }

  // Sarah: 14 days of meal logs
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - daysAgo);
    logDate.setHours(0, 0, 0, 0);

    const dayIndex = 13 - daysAgo;
    const bIdx = (dayIndex + 3) % B.length;
    const lIdx = (dayIndex + 5) % L.length;
    const dIdx = (dayIndex + 2) % D.length;

    const todayMeals = [
      { meal: B[bIdx], type: "Breakfast", hour: 8 },
      { meal: L[lIdx], type: "Lunch", hour: 13 },
      { meal: D[dIdx], type: "Dinner", hour: 19 },
    ];

    for (const entry of todayMeals) {
      const loggedTime = new Date(logDate);
      loggedTime.setHours(entry.hour, 0, 0, 0);
      await prisma.mealLog.create({
        data: {
          userId: sarah.id,
          mealType: entry.type,
          source: daysAgo <= 6 ? "plan" : "manual",
          mealName: entry.meal.name,
          description: entry.meal.desc,
          calories: entry.meal.cal,
          proteinG: entry.meal.protein,
          carbsG: entry.meal.carbs,
          fatG: entry.meal.fat,
          estimatedWeightG: entry.meal.weight,
          loggedDate: logDate,
          loggedTime: loggedTime,
        },
      });
      sarahLogCount++;
    }
  }
  console.log(`✅ Meal logs: ${mohammadLogCount} for Mohammad (30 days), ${sarahLogCount} for Sarah (14 days).\n`);

  // ── 9. AI RECOMMENDATIONS ──────────────────────────────────────────────────
  console.log("🤖 Seeding AI recommendations...");
  const aiRecs = [
    { userId: mohammad.id, type: "nutrition", text: "Great protein intake! You averaged 137g protein/day this week — that's 98% of your 140g target. Keep it up to preserve lean muscle mass during your cut.", daysAgo: 0 },
    { userId: mohammad.id, type: "dietary", text: "Your fiber intake has been slightly low the past 3 days (avg 18g vs recommended 30g). Try adding more leafy greens or a serving of lentils to boost fiber.", daysAgo: 0 },
    { userId: mohammad.id, type: "progress", text: "Excellent progress! You've lost 3.5 kg over 30 days (avg -0.82 kg/week). Your deficit of ~500 kcal/day is sustainable and healthy. Current trajectory: you'll reach 75 kg in approximately 9 weeks.", daysAgo: 0 },
    { userId: mohammad.id, type: "hydration", text: "Based on your activity level and body weight, aim for 2.5–3 liters of water daily. Proper hydration improves metabolism by up to 30%.", daysAgo: 1 },
    { userId: mohammad.id, type: "nutrition", text: "Your omega-3 intake looks strong from the salmon entries this week. EPA and DHA support heart health and reduce inflammation — aim for 2-3 fish servings per week.", daysAgo: 2 },
    { userId: sarah.id, type: "nutrition", text: "Your Mediterranean diet is well-balanced! Average macros this week: 108g protein (98% target), 188g carbs, 58g fat. Great adherence.", daysAgo: 0 },
    { userId: sarah.id, type: "progress", text: "Steady progress — down 2 kg in 20 days. You're on track to reach your 58 kg goal in about 6 weeks at this pace.", daysAgo: 0 },
    { userId: sarah.id, type: "dietary", text: "Consider adding more iron-rich foods like spinach, lentils, or fortified cereals. Women in your age group benefit from 18mg iron daily.", daysAgo: 1 },
  ];

  for (const rec of aiRecs) {
    const basedOn = new Date(now);
    basedOn.setDate(basedOn.getDate() - rec.daysAgo);
    await prisma.aiRecommendation.create({
      data: { userId: rec.userId, recommendationText: rec.text, recommendationType: rec.type, basedOnDate: basedOn },
    });
  }
  console.log(`✅ ${aiRecs.length} AI recommendations seeded.\n`);

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("🌿 DATABASE SEEDING COMPLETE — SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   👤 Users:              3`);
  console.log(`   📋 Profiles:           3`);
  console.log(`   📈 Weight Logs:        ${mohammadWeights.length + sarahWeights.length}`);
  console.log(`   📅 Meal Plans:         2 (14 days, 56 meals)`);
  console.log(`   🛒 Grocery Items:      ${GROCERY_DATA.length + sarahGrocerySubset.length}`);
  console.log(`   🍽️  Meal Logs:          ${mohammadLogCount + sarahLogCount}`);
  console.log(`   🤖 AI Recommendations: ${aiRecs.length}`);
  console.log(`   🥗 Unique Meals in DB: ${B.length + L.length + D.length + S.length}`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n🔑 LOGIN CREDENTIALS:");
  console.log("   mohammad@rightbite.com / password123  (full data)");
  console.log("   sarah@rightbite.com    / password123  (full data)");
  console.log("   guest@rightbite.com    / password123  (clean start)");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error("❌ Seeding error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
