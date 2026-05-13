<<<<<<< HEAD
import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function GroceryPage() {
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [groceries, setGroceries] = useState([
    { id: 1, name: "Chicken Breast", quantity: "2 lbs", completed: false },
    { id: 2, name: "Brown Rice", quantity: "1 bag", completed: false },
    { id: 3, name: "Eggs", quantity: "1 dozen", completed: true },
    { id: 4, name: "Greek Yogurt", quantity: "32 oz", completed: false },
    { id: 5, name: "Bananas", quantity: "1 bunch", completed: true },
  ]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newGrocery = {
      id: Date.now(),
      name: newItem,
      quantity: newQuantity || "1",
      completed: false,
    };

    setGroceries([newGrocery, ...groceries]);
    setNewItem("");
    setNewQuantity("1");
  };

  const toggleComplete = (id) => {
    setGroceries(groceries.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleRemove = (id) => {
    setGroceries(groceries.filter(item => item.id !== id));
  };

  // Group items to show active first, completed second
  const activeItems = groceries.filter(item => !item.completed);
  const completedItems = groceries.filter(item => item.completed);

  return (
    <AppLayout>
      <div style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Grocery List
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Manage the ingredients you need for your meal plan.
          </p>
        </div>

        {/* Add Item Section */}
        <Card style={{ marginBottom: "2.5rem" }}>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 200px" }}>
              <Input
                label="Item Name"
                type="text"
                placeholder="e.g., Spinach, Almond Milk"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: "1 1 100px" }}>
              <Input
                label="Quantity"
                type="text"
                placeholder="e.g., 2 lbs, 1 bunch"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "1px" }}>
              <Button type="submit" variant="primary">
                Add Item
              </Button>
            </div>
          </form>
        </Card>

        {/* Grocery List */}
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-h)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>To Buy</span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {activeItems.length} items
            </span>
          </h2>
          
          {activeItems.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", marginBottom: "2rem" }}>
              All caught up! Nothing to buy.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {activeItems.map((item) => (
                <div key={item.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  background: "var(--bg)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-md)", 
                  padding: "1rem 1.25rem",
                  transition: "all 0.2s ease"
                }} className="table-row-hover">
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={item.completed} 
                      onChange={() => toggleComplete(item.id)}
                      style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer", accentColor: "var(--primary)" }}
                    />
                    <div>
                      <span style={{ fontSize: "1rem", color: "var(--text-h)", fontWeight: 500, display: "block" }}>
                        {item.name}
                      </span>
                      {item.quantity && item.quantity !== "1" && (
                        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", padding: "0 0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-h)", marginTop: "2rem" }}>
                Completed
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {completedItems.map((item) => (
                  <div key={item.id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    background: "var(--bg)", 
                    border: "1px solid var(--border)", 
                    borderRadius: "var(--radius-md)", 
                    padding: "1rem 1.25rem",
                    opacity: 0.6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => toggleComplete(item.id)}
                        style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer", accentColor: "var(--primary)" }}
                      />
                      <div>
                        <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500, display: "block", textDecoration: "line-through" }}>
                          {item.name}
                        </span>
                        {item.quantity && item.quantity !== "1" && (
                          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", padding: "0 0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
=======
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
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b
  );
}

export default GroceryPage;