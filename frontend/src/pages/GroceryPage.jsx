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
  );
}

export default GroceryPage;