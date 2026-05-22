import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
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

// Helper: Format date to readable string
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

// Sub-component: Summary Card
function SummaryCard({ label, value, unit = "kg", highlight = false, color = "var(--primary)" }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: `1px solid ${highlight ? color : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      padding: "1rem 0.75rem",
      textAlign: "center",
      flex: 1,
      minWidth: "100px",
      boxShadow: "var(--shadow-sm)"
    }}>
      <p style={{ margin: 0, fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1.375rem", fontWeight: 700, color: highlight ? color : "var(--text-h)" }}>
        {value ?? "—"}
        {value != null && value !== "✅" && <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}> {unit}</span>}
      </p>
    </div>
  );
}

// Main Component
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
    setSuccessMsg("");
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
        setSuccessMsg("✅ Weight logged successfully!");
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

  if (authLoading || fetching) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading progress dashboard...</p>
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

  // Derived data
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

  return (
    <AppLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Header Button */}
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

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)", fontWeight: 600 }}>
            History & Progress
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Review your past records and track your weight journey over time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Log Today's Weight Card */}
          <Card header={<h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--text-h)", fontWeight: 600 }}>Log Weight</h3>}>
            <form onSubmit={handleLogWeight} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Weight (kg) *"
                  type="number"
                  placeholder="e.g. 82.5"
                  value={weightInput}
                  onChange={(e) => { setWeightInput(e.target.value); setError(""); }}
                  min="1"
                  step="0.1"
                  error={error}
                  required
                />
              </div>
              <div style={{ marginBottom: "1px" }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  style={{ minWidth: "100px" }}
                >
                  {saving ? "Saving..." : "Log kg"}
                </Button>
              </div>
            </form>
            {successMsg && (
              <p style={{ color: "#10b981", fontSize: "0.8125rem", marginTop: "0.5rem", fontWeight: 500 }}>
                {successMsg}
              </p>
            )}
          </Card>

          {/* Metric Stats Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <SummaryCard label="Start Weight" value={firstLog?.weightKg} />
              <SummaryCard label="Current Weight" value={latestLog?.weightKg} highlight color="var(--primary)" />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {change !== null ? (
                <SummaryCard
                  label="Net Change"
                  value={change > 0 ? `+${change}` : change}
                  highlight
                  color={change < 0 ? "#10b981" : "#ef4444"}
                />
              ) : (
                <SummaryCard label="Net Change" value="—" />
              )}
              {targetWeight != null ? (
                <SummaryCard
                  label="Remaining To Goal"
                  value={remaining != null ? (remaining > 0 ? `-${remaining}` : "✅") : "—"}
                  highlight={remaining !== null && remaining <= 0}
                  color="#10b981"
                />
              ) : (
                <div style={{
                  flex: 1,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--warning)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1rem 0.75rem",
                  textAlign: "center",
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Target Weight</p>
                  <button 
                    onClick={() => navigate("/settings")}
                    style={{ background: 'none', border: 'none', color: '#ecc94b', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Set in settings
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Empty State */}
        {logs.length === 0 ? (
          <div style={{ 
            border: "2px dashed var(--border)", 
            borderRadius: "var(--radius-xl)", 
            padding: "3rem 1.5rem", 
            textAlign: "center", 
            color: "var(--text-muted)", 
            marginBottom: "2rem" 
          }}>
            <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: 500 }}>📉 No weight logs recorded yet.</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem" }}>Log today's weight above to start tracking your trends.</p>
          </div>
        ) : (
          <>
            {/* Chart Trend Card */}
            <Card header={<h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--text-h)", fontWeight: 600 }}>Weight Trends</h3>} style={{ marginBottom: "1.5rem" }}>
              <div style={{ padding: "0.5rem 0" }}>
                {chartData.length === 1 && (
                  <p style={{ margin: "0 0 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Log more days to see your dynamic trend chart.
                  </p>
                )}
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} kg`, "Weight"]}
                      labelStyle={{ fontSize: 12, color: "var(--text-h)" }}
                      contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                      itemStyle={{ color: "var(--text)" }}
                    />
                    {targetWeight && (
                      <ReferenceLine
                        y={targetWeight}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{ value: "Goal Target", position: "insideTopRight", fontSize: 11, fill: "#10b981", fontWeight: 600 }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "var(--primary)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* History List Card */}
            <Card header={<h3 style={{ margin: 0, fontSize: "1.125rem", color: "var(--text-h)", fontWeight: 600 }}>Log History</h3>} style={{ padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.5rem",
                      borderBottom: index === logs.length - 1 ? "none" : "1px solid var(--border)",
                      background: confirmDeleteId === log.id ? "rgba(239, 68, 68, 0.05)" : "var(--bg-surface)",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "1.0625rem", color: "var(--text-h)" }}>{log.weightKg} kg</span>
                      <span style={{ marginLeft: "0.75rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {new Date(log.loggedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {confirmDeleteId !== log.id ? (
                      <button
                        id={`delete-weight-${log.id}`}
                        onClick={() => setConfirmDeleteId(log.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "1.5rem",
                          lineHeight: 1,
                          padding: "0.25rem 0.5rem"
                        }}
                        title="Delete log"
                      >
                        ×
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          id={`cancel-weight-delete-${log.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          id={`confirm-weight-delete-${log.id}`}
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default ProgressPage;