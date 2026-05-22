import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

// ─── Sub-component: Calorie Ring Visualizer ─────────────────────────────────
function CalorieRing({ consumed, target }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const remaining = target - consumed;
  const exceeded = remaining < 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          {/* Background Ring */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth="10"
          />
          {/* Foreground Progress Ring with custom gradient */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            stroke="url(#calorieGrad)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <defs>
            <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        {/* Centered content */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-h)", lineHeight: 1 }}>{consumed}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", fontWeight: 500 }}>of {target} kcal</span>
        </div>
      </div>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: exceeded ? "var(--danger)" : "var(--primary-hover)" }}>
          {exceeded 
            ? `⚠️ Over target by ${Math.abs(remaining)} kcal` 
            : `🔥 ${remaining} kcal remaining`}
        </p>
      </div>
    </div>
  );
}

// ─── Sub-component: Macro Progress Bar ───────────────────────────────────────
function MacroBar({ label, consumed, target, unit = "g", color, gradient }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const exceeded = consumed > target && target > 0;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
        <span style={{ fontWeight: 600, color: "var(--text-h)" }}>{label}</span>
        <span style={{ color: exceeded ? "var(--danger)" : "var(--text-muted)", fontWeight: 500 }}>
          {consumed}{unit} / {target}{unit}
          {exceeded && <span style={{ color: "var(--danger)", fontWeight: 700 }}> (+{consumed - target}{unit})</span>}
        </span>
      </div>
      <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: exceeded ? "var(--danger)" : (gradient || color),
            borderRadius: "4px",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
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
  const [activePlan, setActivePlan] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loggingPlannedId, setLoggingPlannedId] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("token");
      if (!token) { setDataLoading(false); return; }

      try {
        const [profileRes, mealsRes, weightRes, planRes] = await Promise.all([
          fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/meals/today", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/weight", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/meal-plan/latest", { headers: { Authorization: `Bearer ${token}` } }),
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

        if (planRes.ok) {
          const planData = await planRes.json();
          setActivePlan(planData.data);
        } else {
          setActivePlan(null);
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

  const handleLogPlannedMeal = async (plannedMealId) => {
    setLoggingPlannedId(plannedMealId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/meal/${plannedMealId}/log`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const mealsRes = await fetch("http://localhost:5000/api/meals/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mealsRes.ok) {
          const data = await mealsRes.json();
          setTodaySummary(data.data.summary);
          setTodayMeals(data.data.meals);
        }
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to log planned meal");
      }
    } catch (err) {
      console.error("Log planned meal error:", err);
    } finally {
      setLoggingPlannedId(null);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: "2.5rem",
            height: "2.5rem",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <h2 style={{ color: 'var(--text-h)', marginBottom: '1rem' }}>Not Logged In</h2>
        <Button onClick={() => navigate("/")} variant="primary">Go to Login</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 480, margin: "3rem auto", padding: "1rem" }}>
          <Card style={{ textAlign: "center", padding: "2.5rem 2rem", boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🙋</div>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", color: "var(--text-h)" }}>Profile Not Set Up</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Complete your dynamic physical profile so we can calculate your personalized daily calorie and macronutrient targets.
            </p>
            <Button
              onClick={() => navigate("/settings")}
              variant="primary"
              fullWidth
              size="lg"
            >
              Complete Profile Setup
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const targets = {
    calories: profile.targetCalories || 2000,
    proteinG: profile.targetProteinG || 150,
    carbsG: profile.targetCarbsG || 200,
    fatG: profile.targetFatG || 65,
  };

  const caloriesConsumed = todaySummary.totalCalories || 0;
  const caloriesTarget = targets.calories;

  // Helper to resolve standard icons/emojis for meals
  const getMealTypeEmoji = (type) => {
    switch (type?.toLowerCase()) {
      case "breakfast": return "🥞";
      case "lunch": return "🥗";
      case "dinner": return "🍛";
      default: return "🍏";
    }
  };

  const getTodayPlannedMeals = () => {
    if (!activePlan || !activePlan.days) return [];
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayDay = activePlan.days.find(
      (d) => d.dayName.toLowerCase() === todayName.toLowerCase()
    );
    return todayDay ? todayDay.meals : [];
  };

  const todayPlannedMeals = getTodayPlannedMeals();

  const isAlreadyLogged = (plannedMealName) => {
    return todayMeals.some(
      (logged) => logged.mealName.toLowerCase().trim() === plannedMealName.toLowerCase().trim()
    );
  };

  const actionItems = [
    { path: "/weekly-plan", label: "View Weekly Plan", desc: "Your tailored menu", icon: "📅", iconBg: "var(--primary-light)" },
    { path: "/meal-wizard", label: "Meal Wizard", desc: "Generate a new plan", icon: "✨", iconBg: "#dbeafe" },
    { path: "/groceries", label: "Grocery List", desc: "Interactive list", icon: "🛒", iconBg: "#fef3c7" },
    { path: "/progress", label: "Weight Progress", desc: "Log physical metrics", icon: "📈", iconBg: "#f3e8ff" },
    { path: "/settings", label: "Profile & Settings", desc: "Adjust targets & preferences", icon: "⚙️", iconBg: "#ffe4e6" },
    { path: "/plan-history", label: "Plan History", desc: "Review past plans", icon: "📜", iconBg: "var(--border)" }
  ];

  return (
    <AppLayout>
      {/* Welcome Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.35rem", color: "var(--text-h)" }}>
            Welcome back, {profile.fullName || user.email.split('@')[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
            Here is your personalized daily nutrition overview. You're doing great!
          </p>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="rb-dashboard-layout">
        
        {/* LEFT COLUMN: Nutrition progress widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Daily Nutrition Overview Card */}
          <Card header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>🎯 Daily Overview</h3>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Today</span>
            </div>
          }>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0.5rem 0"
            }}>
              
              {/* Radial Calorie Visualizer */}
              <div style={{ flex: "1 1 180px", display: "flex", justifyContent: "center" }}>
                <CalorieRing consumed={caloriesConsumed} target={caloriesTarget} />
              </div>

              {/* Macro Progress Indicators */}
              <div style={{ flex: "2 1 240px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-h)", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                  Macronutrient Progress
                </h4>
                
                <MacroBar
                  label="Protein"
                  consumed={todaySummary.totalProteinG}
                  target={targets.proteinG}
                  color="#3b82f6"
                  gradient="linear-gradient(90deg, #3b82f6, #60a5fa)"
                />
                
                <MacroBar
                  label="Carbohydrates"
                  consumed={todaySummary.totalCarbsG}
                  target={targets.carbsG}
                  color="#f59e0b"
                  gradient="linear-gradient(90deg, #f59e0b, #fbbf24)"
                />
                
                <MacroBar
                  label="Fats"
                  consumed={todaySummary.totalFatG}
                  target={targets.fatG}
                  color="#ef4444"
                  gradient="linear-gradient(90deg, #ef4444, #f87171)"
                />
              </div>

            </div>
          </Card>

          {/* NEW: Today's Planned Menu Card */}
          <Card header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>🗓️ Today's Planned Menu</h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/weekly-plan")}>
                Full Week
              </Button>
            </div>
          }>
            {todayPlannedMeals.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "2rem 1rem",
                color: "var(--text-muted)",
                border: "2px dashed var(--border)",
                borderRadius: "var(--radius-lg)"
              }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>📅</div>
                <p style={{ margin: 0, fontWeight: 500 }}>No active plan generated for today.</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>Generate a custom nutrition plan in the Meal Wizard.</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  style={{ marginTop: "1rem" }}
                  onClick={() => navigate("/meal-wizard")}
                >
                  Go to Meal Wizard
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {todayPlannedMeals.map((planned) => {
                  const logged = isAlreadyLogged(planned.mealName);
                  return (
                    <div
                      key={planned.id}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "var(--shadow-sm)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1, marginRight: "0.5rem" }}>
                        <div style={{ fontSize: "1.5rem", marginRight: "0.75rem", flexShrink: 0 }}>
                          {getMealTypeEmoji(planned.mealType)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-h)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {planned.mealName}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize", fontWeight: 600 }}>
                              ({planned.mealType})
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            🥞 {planned.calories} kcal · P:{planned.proteinG}g C:{planned.carbsG}g F:{planned.fatG}g
                          </p>
                        </div>
                      </div>

                      {logged ? (
                        <div style={{
                          color: "var(--primary-hover)",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          padding: "0.35rem 0.65rem",
                          borderRadius: "var(--radius-md)",
                          flexShrink: 0
                        }}>
                          ✓ Logged
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loggingPlannedId === planned.id}
                          onClick={() => handleLogPlannedMeal(planned.id)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.8rem",
                            flexShrink: 0,
                            borderRadius: "var(--radius-md)"
                          }}
                        >
                          {loggingPlannedId === planned.id ? "..." : "⚡ Log"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Weight Widget Card */}
          <Card header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>⚖️ Weight Progress</h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/progress")}>
                Update
              </Button>
            </div>
          }>
            {weightLogs.length === 0 ? (
              <div style={{ padding: "0.5rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No weight logged yet. <span style={{ textDecoration: "underline", cursor: "pointer", color: "var(--primary)", fontWeight: 500 }} onClick={() => navigate("/progress")}>Log your first weight entry →</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                    <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-h)", letterSpacing: "-0.02em" }}>
                      {weightLogs[0].weightKg}
                    </span>
                    <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", fontWeight: 500 }}>kg</span>
                  </div>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Last logged on {new Date(weightLogs[0].createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>

                {weightLogs.length >= 2 && (() => {
                  const delta = +(weightLogs[0].weightKg - weightLogs[1].weightKg).toFixed(1);
                  const positive = delta > 0;
                  return (
                    <div style={{
                      backgroundColor: positive ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      color: positive ? "var(--danger)" : "var(--primary-hover)",
                      padding: "0.5rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      {positive ? `▲ +${delta}` : `▼ ${delta}`} kg
                    </div>
                  );
                })()}
              </div>
            )}
          </Card>

        </div>

        {/* RIGHT COLUMN: Interactive lists & navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Today's Meals feed */}
          <Card header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>🍽️ Today's Meals</h3>
              <Button variant="primary" size="sm" onClick={() => navigate("/log-meal")}>
                + Log Meal
              </Button>
            </div>
          }>
            {todayMeals.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "2.5rem 1rem",
                color: "var(--text-muted)",
                border: "2px dashed var(--border)",
                borderRadius: "var(--radius-lg)",
                background: "rgba(0, 0, 0, 0.01)"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🥪</div>
                <p style={{ margin: 0, fontWeight: 500 }}>No meals logged yet today.</p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>Tap "+ Log Meal" to visually record your diet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    style={{
                      background: "var(--bg)",
                      border: `1px solid ${confirmDeleteId === meal.id ? "var(--danger)" : "var(--border)"}`,
                      borderRadius: "var(--radius-lg)",
                      padding: "0.875rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxShadow: "var(--shadow-sm)",
                      transition: "border-color 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                      
                      {/* Image Thumbnail or Backup Emoji */}
                      {meal.photoPath ? (
                        <img 
                          src={`http://localhost:5000${meal.photoPath}`} 
                          alt={meal.mealName}
                          style={{
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "var(--radius-md)",
                            objectFit: "cover",
                            marginRight: "0.875rem",
                            border: "1.5px solid var(--border)",
                            boxShadow: "var(--shadow-sm)"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "3rem",
                          height: "3rem",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--bg-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          marginRight: "0.875rem",
                          border: "1px solid var(--border)"
                        }}>
                          {getMealTypeEmoji(meal.mealType)}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0, paddingRight: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "var(--text-h)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {meal.mealName}
                          </p>
                          <span className={`rb-meal-badge rb-meal-badge-${meal.mealType?.toLowerCase()}`}>
                            {meal.mealType}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          🔥 {meal.calories} kcal · P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
                        </p>
                      </div>

                    </div>

                    {/* Delete Controls */}
                    {confirmDeleteId !== meal.id ? (
                      <button
                        id={`delete-meal-${meal.id}`}
                        onClick={() => setConfirmDeleteId(meal.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "1.35rem",
                          padding: "0.25rem",
                          display: "flex",
                          alignItems: "center",
                          transition: "color var(--transition-fast)"
                        }}
                        className="rb-logout-text"
                        title="Delete meal"
                      >
                        ✕
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                        <Button
                          id={`cancel-delete-${meal.id}`}
                          onClick={() => setConfirmDeleteId(null)}
                          variant="outline"
                          size="sm"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          id={`confirm-delete-${meal.id}`}
                          onClick={() => handleDeleteMeal(meal.id)}
                          variant="danger"
                          size="sm"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Dynamic Quick Navigation Grid */}
          <Card header={<h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>Quick Actions</h3>}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {actionItems.map((action) => (
                <div
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "0.85rem 1rem",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                  className="rb-action-tile"
                >
                  <div style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: action.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    flexShrink: 0
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "var(--text-h)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {action.label}
                    </h4>
                    <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {action.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    </AppLayout>
  );
}

export default DashboardPage;