import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";

function ProgressPage() {
  const [historyRecords] = useState([
    { id: 1, date: "2023-10-05", weight: "74.8 kg", calories: 2200, goalMet: false },
    { id: 2, date: "2023-10-04", weight: "75.0 kg", calories: 2000, goalMet: true },
    { id: 3, date: "2023-10-03", weight: "75.1 kg", calories: 1800, goalMet: true },
    { id: 4, date: "2023-10-02", weight: "75.3 kg", calories: 2100, goalMet: false },
    { id: 5, date: "2023-10-01", weight: "75.5 kg", calories: 1950, goalMet: true },
  ]);

  return (
    <AppLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            History & Progress
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Review your past records and track your journey over time.
          </p>
        </div>

        <Card style={{ padding: "0" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                  <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Weight</th>
                  <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calories</th>
                  <th style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "var(--text-muted)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record, index) => (
                  <tr key={record.id} style={{ borderBottom: index === historyRecords.length - 1 ? "none" : "1px solid var(--border)", transition: "background-color 0.2s" }} className="table-row-hover">
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-h)", fontWeight: 500 }}>
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>{record.weight}</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>{record.calories} kcal</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{ 
                        padding: "0.375rem 0.75rem", 
                        borderRadius: "9999px", 
                        fontSize: "0.75rem", 
                        fontWeight: 600,
                        backgroundColor: record.goalMet ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: record.goalMet ? "#10b981" : "#ef4444",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        {record.goalMet ? "Goal Met" : "Over Goal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default ProgressPage;