import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Not Logged In</h2>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* User Info Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#f0f0f0', padding: 10, borderRadius: 8 }}>
        <span>Logged in as: <strong>{user.email}</strong></span>
        <button onClick={logout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
      </div>

      <h2>Dashboard</h2>

      <div style={{ marginBottom: 10 }}>
        <p>Calories Target: 2000</p>
        <p>Calories Consumed: 1200</p>
        <p>Remaining: 800</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => navigate("/meal-wizard")}>
          Generate Meal Plan
        </button>

        <button onClick={() => navigate("/log-meal")}>
          Log Meal
        </button>

        <button onClick={() => navigate("/groceries")}>
          View Groceries
        </button>

        <button onClick={() => navigate("/progress")}>
          View Progress
        </button>

        <button onClick={() => navigate("/settings")}>
          Settings
        </button>
        
        <button onClick={() => navigate("/profile")} style={{ background: '#007bff', color: 'white' }}>
          My Profile
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;