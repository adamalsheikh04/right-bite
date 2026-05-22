import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

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

  // States for expanded cards and 1-click logging
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

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your meal plan...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '1rem' }}>Access Denied</h2>
          <Button onClick={() => navigate("/")} variant="primary">Please Login</Button>
        </div>
      </AppLayout>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!plan) {
    return (
      <AppLayout>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 0" }}>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: 0
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div style={{ 
            border: "2px dashed var(--border)", 
            borderRadius: "var(--radius-xl)", 
            padding: "3rem 1.5rem", 
            textAlign: "center", 
            color: "var(--text-muted)"
          }}>
            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>📋 No meal plan found</p>
            <p style={{ margin: "0.5rem 0 1.5rem", fontSize: "0.875rem" }}>Use the Meal Wizard to generate a personalized 7-day schedule.</p>
            <Button
              onClick={() => navigate("/meal-wizard")}
              variant="primary"
            >
              Open Meal Wizard
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Weekly summary ────────────────────────────────────────────────────────
  const totalDays = plan.days.length;
  const avgCalories = totalDays > 0
    ? Math.round(plan.days.reduce((s, d) => s + d.totalCalories, 0) / totalDays)
    : 0;
  const totalWeekCalories = plan.days.reduce((s, d) => s + d.totalCalories, 0);
  const groceryCount = plan.groceryItems?.length || 0;
  const createdDate = new Date(plan.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  return (
    <AppLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button 
            onClick={() => navigate(planIdParam ? "/plan-history" : "/dashboard")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--primary)", 
              cursor: "pointer", 
              fontSize: "0.875rem", 
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: 0
            }}
          >
            ← Back to {planIdParam ? "Plan History" : "Dashboard"}
          </button>
        </div>

        {/* Header Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: "var(--text-h)", fontWeight: 600 }}>
              {planIdParam ? "Archived Meal Plan" : "Weekly Meal Plan"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
              Generated on {createdDate}
            </p>
          </div>
          <div>
            {!planIdParam && (
              <Button 
                variant="outline"
                onClick={() => navigate("/meal-wizard")}
              >
                Regenerate New Plan
              </Button>
            )}
          </div>
        </div>

        {/* Weekly Summary Metrics Panel */}
        <Card style={{ marginBottom: "2rem" }}>
          <h4 style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Weekly Plan Summary
          </h4>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Avg Calories/Day", value: `${avgCalories} kcal` },
              { label: "Total Week Calories", value: `${totalWeekCalories.toLocaleString()} kcal` },
              { label: "Grocery Items", value: `${groceryCount} items` },
            ].map((stat) => (
              <div key={stat.label} style={{ flex: 1, minWidth: "120px", background: "var(--bg)", borderRadius: "var(--radius-md)", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-h)" }}>{stat.value}</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Grid Day Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {plan.days.map((day) => (
            <Card key={day.id} style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.5rem" }}>
              
              {/* Day Card Header */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-end", 
                marginBottom: "1.25rem", 
                borderBottom: "1px solid var(--border)", 
                paddingBottom: "0.75rem" 
              }}>
                <h2 style={{ fontSize: "1.25rem", color: "var(--text-h)", margin: 0, fontWeight: 700 }}>
                  {day.dayName}
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {day.totalCalories} kcal
                </span>
              </div>
              
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "-0.75rem 0 1rem", fontWeight: 500 }}>
                Macros: P:{day.totalProteinG}g · C:{day.totalCarbsG}g · F:{day.totalFatG}g
              </p>

              {/* Meals List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                {day.meals.map((meal) => {
                  const isExpanded = expandedMealId === meal.id;
                  const typeColor = MEAL_TYPE_COLORS[meal.mealType] || "var(--primary)";

                  return (
                    <div 
                      key={meal.id} 
                      style={{ 
                        background: "var(--bg)", 
                        border: "1px solid var(--border)", 
                        borderRadius: "var(--radius-md)", 
                        overflow: "hidden",
                        transition: "all 0.2s"
                      }}
                    >
                      {/* Interactive Row */}
                      <div
                        onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                        style={{ 
                          padding: "1rem", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          cursor: "pointer",
                          userSelect: "none"
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ 
                            fontSize: "0.625rem", 
                            fontWeight: 700, 
                            padding: "0.125rem 0.5rem", 
                            borderRadius: "9999px",
                            background: `${typeColor}22`,
                            color: typeColor,
                            border: `1.5px solid ${typeColor}33`,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            display: "inline-block",
                            marginBottom: "0.375rem"
                          }}>
                            {meal.mealType}
                          </span>
                          <h3 style={{ fontSize: "0.9375rem", color: "var(--text-h)", margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
                            {meal.mealName}
                          </h3>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.75rem" }}>
                          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--text-h)" }}>{meal.calories} kcal</p>
                          <p style={{ margin: "0.125rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            {isExpanded ? "▲ Hide" : "▼ Details"}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <div style={{ 
                          padding: "1rem", 
                          background: "var(--bg-surface)", 
                          borderTop: "1px solid var(--border)",
                          fontSize: "0.875rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem"
                        }}>
                          {meal.description && (
                            <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.4 }}>
                              {meal.description}
                            </p>
                          )}
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--text-h)", fontSize: "0.8125rem" }}>Ingredients:</span>
                            <p style={{ margin: "0.125rem 0 0", color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.4 }}>
                              {meal.ingredientsText}
                            </p>
                          </div>
                          
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginTop: "0.25rem", 
                            paddingTop: "0.75rem",
                            borderTop: "1px dashed var(--border)"
                          }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                              Macros: P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
                            </span>
                            <Button
                              size="sm"
                              variant={loggedMeals[meal.id] ? "outline" : "primary"}
                              disabled={loggingMealId === meal.id || loggedMeals[meal.id]}
                              onClick={(e) => { e.stopPropagation(); handleLogMeal(meal.id); }}
                              style={{ 
                                padding: "0.25rem 0.75rem", 
                                fontSize: "0.75rem", 
                                cursor: (loggingMealId === meal.id || loggedMeals[meal.id]) ? "not-allowed" : "pointer" 
                              }}
                            >
                              {loggedMeals[meal.id] ? "Logged ✓" : (loggingMealId === meal.id ? "..." : "Log Meal")}
                            </Button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </Card>
          ))}
        </div>

        {/* Global Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px', margin: '0 auto' }}>
          <Button
            onClick={() => navigate(`/groceries?planId=${plan.id}`)}
            variant="primary"
            fullWidth
            style={{ padding: "0.875rem", fontWeight: 700, fontSize: "1rem" }}
          >
            🛒 View Generated Grocery List ({groceryCount} items)
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            fullWidth
            style={{ padding: "0.75rem" }}
          >
            Back to Dashboard
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}

export default WeeklyPlanPage;