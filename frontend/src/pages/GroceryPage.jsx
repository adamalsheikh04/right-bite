import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GroceryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!authLoading) fetchGroceries();
  }, [authLoading]);

  async function fetchGroceries() {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    // planId from URL param OR fetch latest plan's id
    let activePlanId = searchParams.get("planId");

    if (!activePlanId) {
      // Fetch latest plan to get its ID
      try {
        const planRes = await fetch("http://localhost:5000/api/meal-plan/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (planRes.ok) {
          const planData = await planRes.json();
          activePlanId = planData.data?.id;
        }
      } catch (err) {
        console.error("Fetch plan error:", err);
      }
    }

    if (!activePlanId) { setLoading(false); return; }
    setPlanId(Number(activePlanId));

    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${activePlanId}/groceries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Fetch groceries error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (item) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${item.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isChecked: !i.isChecked } : i));
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || !planId) return;
    setAdding(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemName: newItem.trim(), quantityText: "", category: "General" }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.data, ...prev]);
        setNewItem("");
      }
    } catch (err) {
      console.error("Add item error:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (authLoading || loading) return <div style={{ padding: 20 }}>Loading groceries...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);
  const checkedCount = checked.length;
  const totalCount = items.length;

  if (!planId) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Dashboard</button>
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0, fontSize: 18 }}>🛒 No grocery list yet</p>
          <p style={{ margin: "8px 0 20px", fontSize: 13 }}>Generate a meal plan first to get your grocery list.</p>
          <button onClick={() => navigate("/meal-wizard")} style={{ background: "#4299e1", color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontWeight: 600 }}>Open Meal Wizard</button>
        </div>
      </div>
    );
  }

  const rowStyle = (isChecked) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f7fafc",
    background: "white",
    gap: 10,
    opacity: isChecked ? 0.55 : 1,
  });

  function ItemRow({ item }) {
    return (
      <div style={rowStyle(item.isChecked)}>
        <input
          type="checkbox"
          checked={item.isChecked}
          onChange={() => handleToggle(item)}
          style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }}
        />
        <span style={{
          flex: 1, fontSize: 14,
          textDecoration: item.isChecked ? "line-through" : "none",
          color: item.isChecked ? "#a0aec0" : "#2d3748",
        }}>
          {item.itemName}
          {item.isUserAdded && <span style={{ fontSize: 10, color: "#9f7aea", marginLeft: 6, fontWeight: 600 }}>custom</span>}
        </span>
        {confirmDeleteId !== item.id ? (
          <button
            id={`delete-grocery-${item.id}`}
            onClick={() => setConfirmDeleteId(item.id)}
            style={{ background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: 18, padding: 0 }}
          >×</button>
        ) : (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              id={`cancel-grocery-delete-${item.id}`}
              onClick={() => setConfirmDeleteId(null)}
              style={{ fontSize: 11, padding: "3px 7px", borderRadius: 6, border: "1px solid #cbd5e0", background: "white", cursor: "pointer" }}
            >Cancel</button>
            <button
              id={`confirm-grocery-delete-${item.id}`}
              onClick={() => handleDelete(item.id)}
              style={{ fontSize: 11, padding: "3px 7px", borderRadius: 6, border: "none", background: "#e53e3e", color: "white", cursor: "pointer" }}
            >Delete</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <button onClick={() => navigate("/weekly-plan")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Weekly Plan
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Grocery List</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666" }}>
            {checkedCount} of {totalCount} items checked
          </p>
        </div>
        {totalCount > 0 && (
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "#f7fafc",
            border: "3px solid #48bb78", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#276749",
          }}>
            {Math.round((checkedCount / totalCount) * 100)}%
          </div>
        )}
      </div>

      {/* Add custom item */}
      <form onSubmit={handleAddItem} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Add a custom item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #cbd5e0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={adding || !newItem.trim()}
          style={{ padding: "10px 18px", background: adding ? "#a0aec0" : "#4299e1", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: adding ? "not-allowed" : "pointer" }}
        >
          {adding ? "..." : "+ Add"}
        </button>
      </form>

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ border: "1px dashed #cbd5e0", borderRadius: 10, padding: "24px", textAlign: "center", color: "#a0aec0" }}>
          <p style={{ margin: 0 }}>No grocery items yet.</p>
        </div>
      )}

      {/* To Buy section (Categorized) */}
      {unchecked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>
            To Buy ({unchecked.length})
          </p>
          
          {(() => {
            // Group the unchecked items
            const grouped = unchecked.reduce((acc, item) => {
              const cat = item.category || "🏷️ General";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(item);
              return acc;
            }, {});
            
            // Render each category block
            return Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <h5 style={{ margin: "0 0 6px 4px", fontSize: 13, color: "#4a5568" }}>{cat}</h5>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  {catItems.map((item) => <ItemRow key={item.id} item={item} />)}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Done section */}
      {checked.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#48bb78", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Done ✓ ({checked.length})
          </p>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            {checked.map((item) => <ItemRow key={item.id} item={item} />)}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{ width: "100%", padding: "12px", background: "#edf2f7", color: "#2d3748", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default GroceryPage;