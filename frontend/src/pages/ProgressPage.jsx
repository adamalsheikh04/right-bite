import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Helper: Format date to readable string ───────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ─── Sub-component: Summary Card ─────────────────────────────────────────────
function SummaryCard({ label, value, unit = "kg", highlight = false, color }) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${highlight ? color || "#68d391" : "#e2e8f0"}`,
      borderRadius: 10,
      padding: "14px 12px",
      textAlign: "center",
      flex: 1,
      minWidth: 0,
    }}>
      <p style={{ margin: 0, fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: highlight ? (color || "#276749") : "#2d3748" }}>
        {value ?? "—"}
        {value != null && <span style={{ fontSize: 13, fontWeight: 500 }}> {unit}</span>}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ProgressPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading]);

  async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) { setFetching(false); return; }
    try {
      const [weightRes, profileRes] = await Promise.all([
        fetch("http://localhost:5000/api/weight", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (weightRes.ok) {
        const data = await weightRes.json();
        setLogs(data.data || []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.data);
      }
    } catch (err) {
      console.error("ProgressPage fetch error:", err);
    } finally {
      setFetching(false);
    }
  }

  const handleLogWeight = async (e) => {
    e.preventDefault();
    setError("");
    const val = Number(weightInput);
    if (!weightInput || isNaN(val) || val <= 0) {
      setError("Please enter a valid positive weight.");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weightKg: val }),
      });
      const data = await res.json();
      if (res.ok) {
        setWeightInput("");
        setSuccessMsg("✅ Weight logged!");
        setTimeout(() => setSuccessMsg(""), 3000);
        await fetchData(); // refresh list
      } else {
        setError(data.message || "Failed to log weight.");
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/weight/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Delete weight error:", err);
    }
  };

  if (authLoading || fetching) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────────────────
  // logs are newest-first from API; reverse for chart (oldest → newest)
  const chartData = [...logs].reverse().map((l) => ({
    date: formatDate(l.loggedAt),
    weight: l.weightKg,
  }));

  const latestLog = logs[0];
  const firstLog = logs[logs.length - 1];
  const change = latestLog && firstLog && latestLog.id !== firstLog.id
    ? +(latestLog.weightKg - firstLog.weightKg).toFixed(1)
    : null;

  const targetWeight = profile?.targetWeightKg ?? null;
  const remaining = latestLog && targetWeight
    ? +(latestLog.weightKg - targetWeight).toFixed(1)
    : null;

  const inputStyle = {
    padding: "10px 14px",
    border: error ? "1px solid #e53e3e" : "1px solid #cbd5e0",
    borderRadius: 8,
    fontSize: 15,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 4,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}
      >
        ← Back to Dashboard
      </button>
      <h2 style={{ margin: "0 0 4px" }}>Progress</h2>
      <p style={{ margin: "0 0 20px", color: "#666", fontSize: 13 }}>Track your weight over time.</p>

      {/* ─── Log Weight Form ─────────────────────────────────────────────── */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>Log Today's Weight</h4>
        <form onSubmit={handleLogWeight} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              placeholder="e.g. 82.5"
              value={weightInput}
              onChange={(e) => { setWeightInput(e.target.value); setError(""); }}
              min="1"
              step="0.1"
              style={inputStyle}
            />
            {error && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
            {successMsg && <p style={{ color: "#276749", fontSize: 12, margin: "4px 0 0" }}>{successMsg}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 18px",
              background: saving ? "#a0aec0" : "#4299e1",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer",
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {saving ? "Saving..." : "Log kg"}
          </button>
        </form>
      </div>

      {/* ─── Empty State ─────────────────────────────────────────────────── */}
      {logs.length === 0 && (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 12, padding: "32px 20px", textAlign: "center", color: "#a0aec0", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 16 }}>📉 No weight logs yet.</p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Log your first weight above to start tracking your progress.</p>
        </div>
      )}

      {logs.length > 0 && (
        <>
          {/* ─── Summary Cards ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <SummaryCard label="Start" value={firstLog?.weightKg} />
            <SummaryCard label="Current" value={latestLog?.weightKg} highlight color="#4299e1" />
            {change !== null && (
              <SummaryCard
                label="Change"
                value={change > 0 ? `+${change}` : change}
                highlight
                color={change < 0 ? "#276749" : "#e53e3e"}
              />
            )}
            {targetWeight != null ? (
              <SummaryCard
                label="To Goal"
                value={remaining != null ? (remaining > 0 ? `-${remaining}` : "✅") : "—"}
                highlight={remaining !== null && remaining <= 0}
                color="#276749"
              />
            ) : (
              <div style={{ flex: 1, minWidth: 0, background: "#fffbeb", border: "1px solid #f6ad55", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Target</p>
                <p style={{ margin: 0, fontSize: 11, color: "#c05621" }}>Set in profile</p>
              </div>
            )}
          </div>

          {/* ─── Recharts Line Chart ────────────────────────────────────── */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 8px 8px", marginBottom: 20 }}>
            <h4 style={{ margin: "0 0 12px 12px", fontSize: 14, color: "#555" }}>Weight Trend</h4>
            {chartData.length === 1 && (
              <p style={{ margin: "0 0 8px 12px", fontSize: 12, color: "#a0aec0" }}>Log more days to see your trend chart.</p>
            )}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}kg`}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "Weight"]}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                {targetWeight && (
                  <ReferenceLine
                    y={targetWeight}
                    stroke="#38a169"
                    strokeDasharray="4 4"
                    label={{ value: "Goal", position: "insideTopRight", fontSize: 11, fill: "#38a169" }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#4299e1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#4299e1" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Weight History Table ───────────────────────────────────── */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <h4 style={{ margin: 0, padding: "12px 16px", fontSize: 14, color: "#555", borderBottom: "1px solid #e2e8f0" }}>History</h4>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: "1px solid #f7fafc",
                  background: confirmDeleteId === log.id ? "#fff5f5" : "white",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{log.weightKg} kg</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: "#888" }}>{formatDate(log.loggedAt)}</span>
                </div>
                {confirmDeleteId !== log.id ? (
                  <button
                    id={`delete-weight-${log.id}`}
                    onClick={() => setConfirmDeleteId(log.id)}
                    style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 20 }}
                  >×</button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      id={`cancel-weight-delete-${log.id}`}
                      onClick={() => setConfirmDeleteId(null)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
                    >Cancel</button>
                    <button
                      id={`confirm-weight-delete-${log.id}`}
                      onClick={() => handleDelete(log.id)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
                    >Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProgressPage;