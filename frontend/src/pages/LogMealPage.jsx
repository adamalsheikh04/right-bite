import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function LogMealPage() {
  const [foodItem, setFoodItem] = useState("");
  const [loggedFoods, setLoggedFoods] = useState([
    { id: 1, name: "Grilled Chicken Breast", calories: 165 },
    { id: 2, name: "Brown Rice", calories: 215 },
  ]);

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodItem.trim()) return;

    // Mock adding food
    const newFood = {
      id: Date.now(),
      name: foodItem,
      calories: Math.floor(Math.random() * 300) + 50, // mock calories
    };

    setLoggedFoods([newFood, ...loggedFoods]);
    setFoodItem("");
  };

  const handleRemove = (id) => {
    setLoggedFoods(loggedFoods.filter((food) => food.id !== id));
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Log a Meal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Keep track of what you eat today.
          </p>
        </div>

        <Card style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleAddFood} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add Food Item"
                type="text"
                placeholder="e.g., Apple, Chicken Salad"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: "1px" }}>
              <Button type="submit" variant="primary">
                Add Food
              </Button>
            </div>
          </form>
        </Card>

        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-h)" }}>
            Today's Log
          </h2>
          
          {loggedFoods.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
              No foods logged yet. Start adding!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loggedFoods.map((food) => (
                <Card key={food.id} style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", margin: 0, color: "var(--text-h)", fontWeight: 600 }}>
                        {food.name}
                      </h3>
                      <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        {food.calories} kcal
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleRemove(food.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default LogMealPage;