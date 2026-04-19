import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Sub-component: Progress Bar ─────────────────────────────────────────────
function MacroBar({ label, consumed, target, unit = "g", color }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const exceeded = consumed > target && target > 0;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#333" }}>{label}</span>
        <span style={{ color: exceeded ? "#e53e3e" : "#555" }}>
          {consumed}{unit} / {target}{unit}
          {exceeded && <span style={{ color: "#e53e3e", fontWeight: 700 }}> (+{consumed - target}{unit})</span>}
        </span>
      </div>
      <div style={{ height: 10, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: exceeded ? "#e53e3e" : color,
            borderRadius: 99,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Sub-component: Calorie Summary Card ─────────────────────────────────────
function CalorieSummary({ consumed, target }) {
  const remaining = target - consumed;
  const exceeded = remaining < 0;

  return (
    <div style={{
      background: exceeded ? "#fff5f5" : "#f0fff4",
      border: `1px solid ${exceeded ? "#fc8181" : "#68d391"}`,
      borderRadius: 12,
      padding: "20px",
      marginBottom: 20,
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: 13, color: "#666", marginBottom: 4 }}>
        {exceeded ? "⚠️ Daily Calorie Target Exceeded" : "🔥 Calories Today"}
      </p>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: exceeded ? "#e53e3e" : "#276749" }}>
            {consumed}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Consumed</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#4a5568" }}>
            {target}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Target</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: exceeded ? "#e53e3e" : "#2b6cb0" }}>
            {exceeded ? `+${Math.abs(remaining)}` : remaining}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
            {exceeded ? "Over Target" : "Remaining"}
          </p>
        </div>
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
  const [dataLoading, setDataLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // inline confirm state

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("token");
      if (!token) { setDataLoading(false); return; }

      try {
        const [profileRes, mealsRes, weightRes] = await Promise.all([
          fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/meals/today", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/weight", { headers: { Authorization: `Bearer ${token}` } }),
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

  if (authLoading || dataLoading) return <div style={{ padding: 20 }}>Loading your dashboard...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not Logged In</h2>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  // If user hasn't set profile, show a prompt instead of broken data
  if (!profile) {
    return (
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 14, color: "#555" }}>Logged in as <strong>{user.email}</strong></span>
          <button onClick={logout} style={{ background: "#e53e3e", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Logout</button>
        </div>
        <div style={{ background: "#fffbeb", border: "1px solid #f6ad55", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px" }}>🙋 Profile Not Set Up</h3>
          <p style={{ color: "#666", marginBottom: 16 }}>Complete your profile so we can calculate your daily targets.</p>
          <button
            onClick={() => navigate("/profile")}
            style={{ background: "#f6ad55", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const targets = {
    calories: profile.targetCalories || 0,
    proteinG: profile.targetProteinG || 0,
    carbsG: profile.targetCarbsG || 0,
    fatG: profile.targetFatG || 0,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            Welcome, {profile.fullName || user.email}
          </p>
        </div>
        <button
          onClick={logout}
          style={{ background: "#e53e3e", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          Logout
        </button>
      </div>

      {/* Calorie Summary Card */}
      <CalorieSummary
        consumed={todaySummary.totalCalories}
        target={targets.calories}
      />

      {/* Macro Progress Bars */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Macros</h4>
        <MacroBar label="Protein" consumed={todaySummary.totalProteinG} target={targets.proteinG} color="#4299e1" />
        <MacroBar label="Carbs" consumed={todaySummary.totalCarbsG} target={targets.carbsG} color="#ed8936" />
        <MacroBar label="Fat" consumed={todaySummary.totalFatG} target={targets.fatG} color="#9f7aea" />
      </div>

      {/* Weight Widget */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>⚖️ Weight</h4>
          <button
            onClick={() => navigate("/progress")}
            style={{ background: "none", border: "1px solid #4299e1", color: "#4299e1", padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
          >
            Update Weight
          </button>
        </div>
        {weightLogs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#a0aec0" }}>No weight logged yet. <span style={{ textDecoration: "underline", cursor: "pointer", color: "#4299e1" }} onClick={() => navigate("/progress")}>Log now →</span></p>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#2d3748" }}>
              {weightLogs[0].weightKg} <span style={{ fontSize: 14, fontWeight: 500, color: "#888" }}>kg</span>
            </p>
            {weightLogs.length >= 2 && (() => {
              const delta = +(weightLogs[0].weightKg - weightLogs[1].weightKg).toFixed(1);
              const positive = delta > 0;
              return (
                <p style={{ margin: 0, fontSize: 14, color: positive ? "#e53e3e" : "#276749", fontWeight: 600 }}>
                  {positive ? `▲ +${delta}` : `▼ ${delta}`} kg since last
                </p>
              );
            })()}
          </div>
        )}
      </div>

      {/* Today's Meals */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Meals</h4>
          <button
            onClick={() => navigate("/log-meal")}
            style={{ background: "#38a169", color: "white", border: "none", padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            + Log Meal
          </button>
        </div>

        {todayMeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#a0aec0", border: "1px dashed #cbd5e0", borderRadius: 10 }}>
            <p style={{ margin: 0 }}>No meals logged yet today.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>Tap "Log Meal" to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  background: "white",
                  border: `1px solid ${confirmDeleteId === meal.id ? "#fc8181" : "#e2e8f0"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{meal.mealName}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>
                      {meal.mealType} · {meal.calories} kcal · P:{meal.proteinG}g C:{meal.carbsG}g F:{meal.fatG}g
                    </p>
                  </div>
                  {confirmDeleteId !== meal.id ? (
                    <button
                      id={`delete-meal-${meal.id}`}
                      onClick={() => setConfirmDeleteId(meal.id)}
                      style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 20, padding: "0 0 0 8px" }}
                      title="Delete meal"
                    >
                      ×
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        id={`cancel-delete-${meal.id}`}
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        id={`confirm-delete-${meal.id}`}
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => navigate("/weekly-plan")} style={navBtnStyle}>View Current Plan</button>
        <button onClick={() => navigate("/plan-history")} style={navBtnStyle}>View Plan History</button>
        <button onClick={() => navigate("/meal-wizard")} style={navBtnStyle}>Generate New Plan</button>
        <button onClick={() => navigate("/groceries")} style={navBtnStyle}>View Groceries</button>
        <button onClick={() => navigate("/progress")} style={navBtnStyle}>View Progress</button>
        <button onClick={() => navigate("/profile")} style={{ ...navBtnStyle, background: "#2b6cb0", color: "white" }}>
          My Profile
        </button>
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: "12px",
  background: "#edf2f7",
  color: "#2d3748",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
  fontWeight: 500,
  textAlign: "left",
  paddingLeft: 16,
};

export default DashboardPage;