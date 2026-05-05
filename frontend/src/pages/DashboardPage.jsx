import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

function DashboardPage() {
  const navigate = useNavigate();
  // Temporarily mocked for UI preview since there's no backend running
  const user = { name: "Demo User", email: "demo@example.com" };
  const loading = false;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
      <p>Loading...</p>
    </div>
  );

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <h2>Not Logged In</h2>
        <Button onClick={() => navigate("/")} variant="primary">Go to Login</Button>
      </div>
    );
  }

  // Hardcoded values from original file (and placeholders for new visual elements)
  const caloriesTarget = 2000;
  const caloriesConsumed = 1200;
  const caloriesRemaining = 800;
  const progressPercentage = Math.min(100, Math.round((caloriesConsumed / caloriesTarget) * 100));

  // Placeholder Macro data for visuals
  const macros = {
    protein: { current: 80, target: 150 },
    carbs: { current: 120, target: 200 },
    fat: { current: 40, target: 65 }
  };

  const calculateMacroWidth = (current, target) => `${Math.min(100, Math.round((current / target) * 100))}%`;

  return (
    <AppLayout>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Welcome back, {user.name || user.email.split('@')[0]}! 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Here is your daily nutrition summary. Keep up the great work!
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>

        {/* Main Calorie Summary Card */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--text-h)" }}>Today's Overview</h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>

            <div style={{ flex: "1 1 200px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600 }}>Calories</span>
                <span style={{ color: "var(--text-muted)" }}>{progressPercentage}%</span>
              </div>
              <div style={{ height: "12px", background: "var(--border)", borderRadius: "6px", overflow: "hidden", marginBottom: "1rem" }}>
                <div style={{ height: "100%", width: `${progressPercentage}%`, background: "var(--primary)", transition: "width 0.5s ease" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                <span>{caloriesConsumed} consumed</span>
                <span>{caloriesTarget} goal</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", flex: "1 1 300px" }}>
              <div style={{ flex: 1, padding: "1rem", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--primary-hover)", margin: 0, fontWeight: 500 }}>Consumed</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary-hover)", margin: "0.25rem 0 0" }}>{caloriesConsumed}</p>
              </div>
              <div style={{ flex: 1, padding: "1rem", background: "var(--bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>Remaining</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-h)", margin: "0.25rem 0 0" }}>{caloriesRemaining}</p>
              </div>
            </div>

          </div>
        </Card>

        {/* Macros Card */}
        <Card header={<h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>Macronutrients</h3>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 500 }}>Protein</span>
                <span style={{ color: "var(--text-muted)" }}>{macros.protein.current}g / {macros.protein.target}g</span>
              </div>
              <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: calculateMacroWidth(macros.protein.current, macros.protein.target), background: "#3b82f6" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 500 }}>Carbs</span>
                <span style={{ color: "var(--text-muted)" }}>{macros.carbs.current}g / {macros.carbs.target}g</span>
              </div>
              <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: calculateMacroWidth(macros.carbs.current, macros.carbs.target), background: "#f59e0b" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 500 }}>Fat</span>
                <span style={{ color: "var(--text-muted)" }}>{macros.fat.current}g / {macros.fat.target}g</span>
              </div>
              <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: calculateMacroWidth(macros.fat.current, macros.fat.target), background: "#ef4444" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card header={<h3 style={{ fontSize: "1.125rem", margin: 0, color: "var(--text-h)" }}>Quick Actions</h3>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Button variant="primary" fullWidth onClick={() => navigate("/log-meal")}>
              🍽️ Log a Meal
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate("/meal-wizard")}>
              ✨ Generate Meal Plan
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate("/groceries")}>
              🛒 View Groceries
            </Button>
            <Button variant="outline" fullWidth onClick={() => navigate("/progress")}>
              📈 View Progress
            </Button>
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}

export default DashboardPage;