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