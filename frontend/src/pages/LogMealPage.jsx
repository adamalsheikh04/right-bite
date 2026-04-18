import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Settings</h2>

      <div style={{ marginBottom: 15 }}>
        <button onClick={() => navigate("/profile")}>Edit Profile</button>
      </div>

      <div style={{ marginBottom: 15 }}>
        <button>Logout</button>
      </div>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default SettingsPage;