import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PlanHistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/meal-plan/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(data.data || []);
        }
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) fetchHistory();
  }, [authLoading]);

  if (authLoading || loading) return <div style={{ padding: 20 }}>Loading history...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Dashboard
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Plan History</h2>
        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>{plans.length} archived</span>
      </div>
      
      {plans.length === 0 ? (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0, fontSize: 16 }}>No archived plans found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {plans.map((p) => {
            const startDate = new Date(p.weekStartDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
            const created = new Date(p.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
            return (
              <div key={p.id} style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#2d3748" }}>Week of {startDate}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Created: {created} · Generated: {p.generationMode}</p>
                </div>
                <button
                  onClick={() => navigate(`/weekly-plan?planId=${p.id}`)}
                  style={{ background: "#ebf8ff", color: "#3182ce", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  View Plan
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlanHistoryPage;
