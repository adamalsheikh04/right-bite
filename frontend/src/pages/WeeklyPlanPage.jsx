import { useNavigate } from "react-router-dom";

function WeeklyPlanPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Weekly Meal Plan</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Monday</h3>
        <p>Breakfast: Oatmeal with banana</p>
        <p>Lunch: Grilled chicken with rice</p>
        <p>Dinner: Tuna salad</p>
        <p>Snack: Greek yogurt</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Tuesday</h3>
        <p>Breakfast: Eggs and toast</p>
        <p>Lunch: Beef with potatoes</p>
        <p>Dinner: Lentil soup</p>
        <p>Snack: Apple with peanut butter</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Wednesday</h3>
        <p>Breakfast: Yogurt with oats</p>
        <p>Lunch: Chicken pasta</p>
        <p>Dinner: Vegetable omelet</p>
        <p>Snack: Mixed nuts</p>
      </div>

      <button onClick={() => navigate("/groceries")}>
        View Grocery List
      </button>

      <br /><br />

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default WeeklyPlanPage;