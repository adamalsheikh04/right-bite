import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

function WeeklyPlanPage() {
  const [weeklyPlan] = useState([
    {
      day: "Monday",
      date: "Oct 9",
      meals: [
        { type: "Breakfast", name: "Oatmeal with banana & honey", calories: 320 },
        { type: "Lunch", name: "Grilled chicken bowl with quinoa", calories: 550 },
        { type: "Dinner", name: "Baked salmon with asparagus", calories: 480 },
      ]
    },
    {
      day: "Tuesday",
      date: "Oct 10",
      meals: [
        { type: "Breakfast", name: "Greek yogurt with berries", calories: 280 },
        { type: "Lunch", name: "Turkey wrap with avocado", calories: 450 },
        { type: "Dinner", name: "Lentil soup with whole grain bread", calories: 410 },
      ]
    },
    {
      day: "Wednesday",
      date: "Oct 11",
      meals: [
        { type: "Breakfast", name: "Scrambled eggs with spinach", calories: 300 },
        { type: "Lunch", name: "Tuna salad sandwich", calories: 500 },
        { type: "Dinner", name: "Beef stir-fry with vegetables", calories: 600 },
      ]
    },
    {
      day: "Thursday",
      date: "Oct 12",
      meals: [
        { type: "Breakfast", name: "Protein smoothie", calories: 250 },
        { type: "Lunch", name: "Chicken caesar salad", calories: 420 },
        { type: "Dinner", name: "Vegetarian chili", calories: 380 },
      ]
    },
    {
      day: "Friday",
      date: "Oct 13",
      meals: [
        { type: "Breakfast", name: "Avocado toast with egg", calories: 350 },
        { type: "Lunch", name: "Leftover chili", calories: 380 },
        { type: "Dinner", name: "Homemade healthy pizza", calories: 650 },
      ]
    },
    {
      day: "Saturday",
      date: "Oct 14",
      meals: [
        { type: "Breakfast", name: "Whole wheat pancakes", calories: 450 },
        { type: "Lunch", name: "Chicken and rice soup", calories: 350 },
        { type: "Dinner", name: "Steak with sweet potato", calories: 700 },
      ]
    },
    {
      day: "Sunday",
      date: "Oct 15",
      meals: [
        { type: "Breakfast", name: "Fruit and nut granola", calories: 300 },
        { type: "Lunch", name: "Quinoa salad with chickpeas", calories: 400 },
        { type: "Dinner", name: "Meal prep chicken and broccoli", calories: 450 },
      ]
    }
  ]);

  return (
    <AppLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
              Weekly Meal Plan
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", margin: 0 }}>
              Your personalized schedule for the week.
            </p>
          </div>
          <div>
            <Button variant="primary">Generate New Plan</Button>
          </div>
        </div>

        {/* Weekly Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {weeklyPlan.map((day) => (
            <Card key={day.day} style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.5rem" }}>
              
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", color: "var(--text-h)", margin: 0, fontWeight: 700 }}>
                  {day.day}
                </h2>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {day.date}
                </span>
              </div>
              
              {/* Meals List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                {day.meals.map((meal, index) => (
                  <div key={index} style={{ 
                    background: "var(--bg)", 
                    border: "1px solid var(--border)", 
                    borderRadius: "var(--radius-md)", 
                    padding: "1rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
                        {meal.type}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {meal.calories} kcal
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9375rem", color: "var(--text-h)", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                      {meal.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <Button variant="outline" fullWidth>
                  + Add Meal
                </Button>
              </div>

            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default WeeklyPlanPage;