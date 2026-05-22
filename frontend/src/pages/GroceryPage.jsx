import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const CATEGORY_MAP = {
  Produce: {
    emoji: "🥦",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.08)",
    keywords: ["spinach", "kale", "apple", "banana", "tomato", "onion", "garlic", "berry", "berries", "avocado", "lemon", "lime", "pepper", "carrot", "broccoli", "herb", "cilantro", "cucumber", "lettuce", "salad", "potato", "cabbage", "celery", "mushroom", "ginger", "fruit", "vegetable", "grape", "orange", "pear", "peach", "strawberry", "blueberry", "raspberry", "mint", "basil", "parsley", "zucchini"]
  },
  "Meat & Poultry": {
    emoji: "🥩",
    color: "#f43f5e",
    bg: "rgba(244, 63, 94, 0.08)",
    keywords: ["chicken", "beef", "pork", "turkey", "steak", "breast", "thigh", "sausage", "bacon", "lamb", "ham", "meat", "rib", "patties", "patty", "veal", "duck"]
  },
  Seafood: {
    emoji: "🐟",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.08)",
    keywords: ["salmon", "fish", "tuna", "shrimp", "prawn", "cod", "crab", "lobster", "seafood", "halibut", "sardine", "tilapia", "trout"]
  },
  "Dairy & Eggs": {
    emoji: "🥛",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.08)",
    keywords: ["milk", "egg", "cheese", "butter", "yogurt", "cream", "dairy", "cheddar", "mozzarella", "parmesan", "ricotta", "sour cream", "curd", "feta"]
  },
  Bakery: {
    emoji: "🍞",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    keywords: ["bread", "loaf", "bun", "toast", "tortilla", "pita", "bagel", "croissant", "bakery", "muffin", "naan", "flatbread", "sourdough", "donut", "pastry"]
  },
  "Pantry & Grains": {
    emoji: "🥫",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.08)",
    keywords: ["rice", "pasta", "noodle", "bean", "flour", "sugar", "oil", "sauce", "soup", "spice", "salt", "pepper", "canned", "honey", "oat", "oats", "cereal", "chickpea", "lentil", "quinoa", "vinegar", "mustard", "mayo", "ketchup", "soy sauce", "olive", "nut", "almond", "peanut", "seed", "syrup", "jam", "broth"]
  },
  Beverages: {
    emoji: "🥤",
    color: "#14b8a6",
    bg: "rgba(20, 184, 166, 0.08)",
    keywords: ["water", "juice", "tea", "coffee", "soda", "beverage", "coke", "sprite", "lemonade", "seltzer", "tonic", "smoothie"]
  },
  General: {
    emoji: "🛒",
    color: "#6b7280",
    bg: "rgba(107, 114, 128, 0.08)",
    keywords: []
  }
};

const styles = `
  .grocery-page-container {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 4rem;
    animation: fadeInPage 0.4s ease-out;
  }
  
  @keyframes fadeInPage {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .stats-card {
    background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(16, 185, 129, 0.03) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .stats-progress-container {
    width: 100%;
    height: 8px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }

  .stats-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary) 0%, #10b981 100%);
    border-radius: 99px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Custom Checkbox styles */
  .checkbox-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .custom-checkbox {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    margin-right: 1rem;
    flex-shrink: 0;
  }

  .checkbox-wrapper:hover .custom-checkbox {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-focus);
    transform: scale(1.05);
  }

  .checkbox-wrapper.checked .custom-checkbox {
    background-color: var(--primary);
    border-color: var(--primary);
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
  }

  .checkmark-svg {
    width: 0.75rem;
    height: 0.75rem;
    stroke: white;
    stroke-width: 3px;
    fill: none;
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    transition: stroke-dashoffset 0.25s ease-out;
  }

  .checkbox-wrapper.checked .checkmark-svg {
    stroke-dashoffset: 0;
  }

  .item-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-h);
    transition: all 0.3s ease;
  }

  .checkbox-wrapper.checked .item-text {
    color: var(--text-muted);
    text-decoration: line-through;
    opacity: 0.75;
  }

  /* Accordion styling */
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1.25rem;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 0.5rem;
    user-select: none;
  }

  .category-header:hover {
    border-color: var(--primary);
    background: rgba(16, 185, 129, 0.02);
    transform: translateY(-1px);
  }

  .category-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    opacity: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.25rem;
    margin-bottom: 0.75rem;
  }

  .category-content.open {
    max-height: 1500px;
    opacity: 1;
    margin-bottom: 1rem;
    padding-top: 0.25rem;
  }

  .arrow-icon {
    transition: transform 0.3s ease;
    color: var(--text-muted);
  }

  .arrow-icon.open {
    transform: rotate(180deg);
    color: var(--primary);
  }

  /* Item row styling */
  .item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 0.875rem 1.25rem;
    transition: all 0.2s ease;
    animation: slideInRow 0.25s ease-out;
  }

  .item-row:hover {
    border-color: var(--border-focus);
    transform: translateX(2px);
    box-shadow: var(--shadow-sm);
  }

  @keyframes slideInRow {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Toast notification */
  .toast-notification {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    color: white;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transform: translateY(100px);
    opacity: 0;
    animation: slideUpToast 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .toast-notification.success {
    background: #10b981;
  }

  .toast-notification.error {
    background: #ef4444;
  }

  @keyframes slideUpToast {
    to { transform: translateY(0); opacity: 1; }
  }

  /* Utility toolbar floating/sticky bar */
  .utility-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 0.75rem 1.25rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
    flex-wrap: wrap;
    gap: 0.75rem;
  }
`;

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

  // New features state
  const [toast, setToast] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [completedExpanded, setCompletedExpanded] = useState(false);

  useEffect(() => {
    if (!authLoading) fetchGroceries();
  }, [authLoading]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  function getDisplayCategory(itemName, itemCategory) {
    let catKey = itemCategory || "General";
    if (catKey === "General" || catKey === "General 🛒" || !catKey || catKey.toLowerCase().includes("general")) {
      const lowerName = itemName.toLowerCase();
      for (const [key, config] of Object.entries(CATEGORY_MAP)) {
        if (config.keywords.some(kw => lowerName.includes(kw))) {
          return key;
        }
      }
      return "General";
    }
    
    if (catKey.toLowerCase().includes("produce") || catKey.toLowerCase().includes("veg") || catKey.toLowerCase().includes("fruit")) return "Produce";
    if (catKey.toLowerCase().includes("meat") || catKey.toLowerCase().includes("poultry") || catKey.toLowerCase().includes("chicken")) return "Meat & Poultry";
    if (catKey.toLowerCase().includes("seafood") || catKey.toLowerCase().includes("fish")) return "Seafood";
    if (catKey.toLowerCase().includes("dairy") || catKey.toLowerCase().includes("egg") || catKey.toLowerCase().includes("milk") || catKey.toLowerCase().includes("cheese")) return "Dairy & Eggs";
    if (catKey.toLowerCase().includes("bakery") || catKey.toLowerCase().includes("bread")) return "Bakery";
    if (catKey.toLowerCase().includes("pantry") || catKey.toLowerCase().includes("grain") || catKey.toLowerCase().includes("canned") || catKey.toLowerCase().includes("spice")) return "Pantry & Grains";
    if (catKey.toLowerCase().includes("bev") || catKey.toLowerCase().includes("drink") || catKey.toLowerCase().includes("water")) return "Beverages";
    
    return catKey;
  }

  const getCategoryConfig = (cat) => {
    return CATEGORY_MAP[cat] || {
      emoji: "🏷️",
      color: "var(--primary)",
      bg: "var(--primary-light)"
    };
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: prev[cat] === false ? true : false
    }));
  };

  async function fetchGroceries() {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    let activePlanId = searchParams.get("planId");

    if (!activePlanId) {
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
    const originalItems = [...items];

    // Optimistic state toggle
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isChecked: !i.isChecked } : i));

    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${item.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed server toggle");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setItems(originalItems);
      showToast("Connection failed. Could not update item.", "error");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || !planId) return;

    const itemName = newItem.trim();
    const token = localStorage.getItem("token");
    const tempId = Date.now();
    const detectedCategory = getDisplayCategory(itemName, "General");

    const tempItem = {
      id: tempId,
      itemName,
      quantityText: "",
      category: detectedCategory,
      isChecked: false,
      isUserAdded: true,
      isOptimistic: true
    };

    const originalItems = [...items];
    setItems((prev) => [tempItem, ...prev]);
    setNewItem("");

    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemName, quantityText: "", category: detectedCategory }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => prev.map((i) => i.id === tempId ? data.data : i));
        showToast("Item added successfully!", "success");
      } else {
        throw new Error("Failed to add");
      }
    } catch (err) {
      console.error("Add item error:", err);
      setItems(originalItems);
      setNewItem(itemName);
      showToast("Failed to add item.", "error");
    }
  };

  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("token");
    const originalItems = [...items];

    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setConfirmDeleteId(null);

    try {
      const res = await fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Item removed", "success");
      } else {
        throw new Error("Failed server delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setItems(originalItems);
      showToast("Failed to delete item.", "error");
    }
  };

  const handleCheckAll = async () => {
    const activeItems = items.filter((i) => !i.isChecked);
    if (activeItems.length === 0) return;

    const originalItems = [...items];
    setItems((prev) => prev.map((i) => ({ ...i, isChecked: true })));
    showToast("All items marked as checked!", "success");

    const token = localStorage.getItem("token");
    try {
      const promises = activeItems.map((item) =>
        fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${item.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const results = await Promise.all(promises);
      if (results.some((r) => !r.ok)) throw new Error("Some checks failed");
    } catch (err) {
      console.error("Check all error:", err);
      setItems(originalItems);
      showToast("Failed to check all items.", "error");
    }
  };

  const handleClearChecked = async () => {
    const completedItems = items.filter((i) => i.isChecked);
    if (completedItems.length === 0) return;

    const originalItems = [...items];
    setItems((prev) => prev.filter((i) => !i.isChecked));
    showToast("Cleared completed items!", "success");

    const token = localStorage.getItem("token");
    try {
      const promises = completedItems.map((item) =>
        fetch(`http://localhost:5000/api/meal-plan/${planId}/groceries/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      const results = await Promise.all(promises);
      if (results.some((r) => !r.ok)) throw new Error("Some deletes failed");
    } catch (err) {
      console.error("Clear checked error:", err);
      setItems(originalItems);
      showToast("Failed to clear some items.", "error");
    }
  };

  const handleExportList = () => {
    const activeItems = items.filter((i) => !i.isChecked);
    if (activeItems.length === 0) {
      showToast("No active items to export!", "error");
      return;
    }

    const grouped = activeItems.reduce((acc, item) => {
      const cat = getDisplayCategory(item.itemName, item.category);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    let text = `🛒 *RightBite Shopping List* 🛒\n\n`;
    Object.entries(grouped).forEach(([category, catItems]) => {
      const emoji = CATEGORY_MAP[category]?.emoji || "🏷️";
      text += `${emoji} *${category}*\n`;
      catItems.forEach((item) => {
        text += `  ☐ ${item.itemName}${item.quantityText ? ` (${item.quantityText})` : ""}\n`;
      });
      text += `\n`;
    });
    text += `Generated with RightBite App ✨`;

    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("List copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        showToast("Could not copy list.", "error");
      });
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading groceries...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <h2 style={{ color: 'var(--text-h)', marginBottom: '1rem' }}>Not Logged In</h2>
        <Button onClick={() => navigate("/")} variant="primary">Go to Login</Button>
      </div>
    );
  }

  if (!planId) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 480, margin: "2rem auto", padding: "1rem" }}>
          <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm" style={{ marginBottom: "1.5rem" }}>
            ← Dashboard
          </Button>
          <Card style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--text-h)" }}>🛒 No grocery list yet</p>
            <p style={{ margin: "0.5rem 0 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Generate a meal plan first to get your grocery list.
            </p>
            <Button
              onClick={() => navigate("/meal-wizard")}
              variant="primary"
              fullWidth
            >
              Open Meal Wizard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const activeItems = items.filter((i) => !i.isChecked);
  const completedItems = items.filter((i) => i.isChecked);
  const totalCount = items.length;
  const checkedCount = completedItems.length;
  const completionRate = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  let statusMessage = "Just starting! 🛒";
  if (completionRate === 100) statusMessage = "All items purchased! Ready to cook! 🍳🎉";
  else if (completionRate >= 75) statusMessage = "Almost there, final stretch! 🚀";
  else if (completionRate >= 50) statusMessage = "Halfway through your list! 🥦";
  else if (completionRate >= 25) statusMessage = "Making great progress! 🥛";

  // Group active items by auto-categorized department
  const groupedActive = activeItems.reduce((acc, item) => {
    const cat = getDisplayCategory(item.itemName, item.category);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Standard sorting order
  const sortedCategories = Object.keys(CATEGORY_MAP).filter(cat => groupedActive[cat] && groupedActive[cat].length > 0);
  Object.keys(groupedActive).forEach(cat => {
    if (!sortedCategories.includes(cat)) {
      sortedCategories.push(cat);
    }
  });

  return (
    <AppLayout>
      <style>{styles}</style>
      
      {/* Toast popup */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="grocery-page-container">
        
        {/* Back Link */}
        <Button 
          onClick={() => navigate("/weekly-plan")} 
          variant="outline" 
          size="sm" 
          style={{ marginBottom: "1.5rem" }}
        >
          ← Back to Weekly Plan
        </Button>

        {/* Title */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", color: "var(--text-h)" }}>
            Grocery Shopping List
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", margin: 0 }}>
            Smart categorization and instant updates for a smooth grocery run.
          </p>
        </div>

        {/* Glassmorphic Stats bar */}
        <div className="stats-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-h)" }}>
              {checkedCount} of {totalCount} Completed
            </span>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>
              {completionRate}%
            </span>
          </div>
          <div className="stats-progress-container">
            <div className="stats-progress-bar" style={{ width: `${completionRate}%` }} />
          </div>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500, fontStyle: "italic" }}>
            {statusMessage}
          </span>
        </div>

        {/* Add custom item form */}
        <Card style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleAddItem} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Input
                label="Quick Add Item"
                type="text"
                placeholder="e.g., Organic Spinach, Greek Yogurt, Salmon"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: "1px" }}>
              <Button type="submit" variant="primary" disabled={adding || !newItem.trim()}>
                {adding ? "Adding..." : "Add to List"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Floating/Sticky Utility Bar */}
        {totalCount > 0 && (
          <div className="utility-bar">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button onClick={handleExportList} variant="outline" size="sm" style={{ gap: "0.375rem" }}>
                📋 Copy Text List
              </Button>
              {activeItems.length > 0 && (
                <Button onClick={handleCheckAll} variant="outline" size="sm">
                  ✓ Check All
                </Button>
              )}
            </div>
            {completedItems.length > 0 && (
              <Button onClick={handleClearChecked} variant="danger" size="sm">
                🗑 Clear Completed
              </Button>
            )}
          </div>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)", border: "2px dashed var(--border)", borderRadius: "var(--radius-xl)", background: "var(--bg-surface)" }}>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: "var(--text-h)" }}>🛒 Your Grocery List is Empty</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem" }}>Add custom items above or generate your weekly meal plan in the wizard.</p>
          </div>
        )}

        {/* Active Items (Smart Categorized Accordions) */}
        {activeItems.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-h)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>To Buy</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {activeItems.length} active items
              </span>
            </h2>

            {sortedCategories.map((category) => {
              const catItems = groupedActive[category];
              const config = getCategoryConfig(category);
              const isExpanded = expandedCategories[category] !== false;

              return (
                <div key={category} style={{ marginBottom: "0.75rem" }}>
                  <div 
                    className="category-header" 
                    onClick={() => toggleCategory(category)}
                    style={{ borderLeft: `4px solid ${config.color}` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{config.emoji}</span>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-h)" }}>
                        {category}
                      </span>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        background: config.bg, 
                        color: config.color, 
                        padding: "0.15rem 0.5rem", 
                        borderRadius: "99px",
                        fontWeight: 600
                      }}>
                        {catItems.length}
                      </span>
                    </div>
                    <svg 
                      className={`arrow-icon ${isExpanded ? 'open' : ''}`} 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  <div className={`category-content ${isExpanded ? 'open' : ''}`}>
                    {catItems.map((item) => (
                      <div key={item.id} className="item-row" style={{
                        borderColor: confirmDeleteId === item.id ? "var(--danger)" : "var(--border)"
                      }}>
                        <div 
                          className={`checkbox-wrapper ${item.isChecked ? 'checked' : ''}`}
                          onClick={() => handleToggle(item)}
                          style={{ flex: 1 }}
                        >
                          <div className="custom-checkbox">
                            <svg className="checkmark-svg" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="item-text">
                              {item.itemName}
                              {item.isUserAdded && (
                                <span style={{ 
                                  fontSize: "0.625rem", 
                                  background: "var(--primary-light)", 
                                  color: "var(--primary-hover)", 
                                  padding: "0.125rem 0.375rem", 
                                  borderRadius: "4px", 
                                  marginLeft: "0.5rem", 
                                  fontWeight: 600,
                                  display: "inline-block",
                                  verticalAlign: "middle"
                                }}>
                                  custom
                                </span>
                              )}
                            </span>
                            {item.quantityText && (
                              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                {item.quantityText}
                              </span>
                            )}
                          </div>
                        </div>

                        {confirmDeleteId !== item.id ? (
                          <button 
                            onClick={() => setConfirmDeleteId(item.id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", padding: "0 0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                            title="Remove item"
                          >
                            &times;
                          </button>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button 
                              onClick={() => setConfirmDeleteId(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item.id)}
                              variant="danger"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Items Accordion */}
        {completedItems.length > 0 && (
          <div style={{ marginTop: "2.5rem" }}>
            <div 
              className="category-header" 
              onClick={() => setCompletedExpanded(!completedExpanded)}
              style={{ 
                background: "rgba(16, 185, 129, 0.02)", 
                borderColor: "var(--primary)",
                borderLeft: "4px solid var(--primary)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem", color: "var(--primary)" }}>✓</span>
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-h)" }}>
                  Purchased / Done
                </span>
                <span style={{ 
                  fontSize: "0.75rem", 
                  background: "var(--primary-light)", 
                  color: "var(--primary-hover)", 
                  padding: "0.15rem 0.5rem", 
                  borderRadius: "99px",
                  fontWeight: 600
                }}>
                  {completedItems.length}
                </span>
              </div>
              <svg 
                className={`arrow-icon ${completedExpanded ? 'open' : ''}`} 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            <div className={`category-content ${completedExpanded ? 'open' : ''}`}>
              {completedItems.map((item) => (
                <div key={item.id} className="item-row" style={{
                  opacity: 0.8,
                  borderColor: confirmDeleteId === item.id ? "var(--danger)" : "var(--border)"
                }}>
                  <div 
                    className="checkbox-wrapper checked"
                    onClick={() => handleToggle(item)}
                    style={{ flex: 1 }}
                  >
                    <div className="custom-checkbox">
                      <svg className="checkmark-svg" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="item-text">
                        {item.itemName}
                        {item.isUserAdded && (
                          <span style={{ 
                            fontSize: "0.625rem", 
                            background: "var(--primary-light)", 
                            color: "var(--primary-hover)", 
                            padding: "0.125rem 0.375rem", 
                            borderRadius: "4px", 
                            marginLeft: "0.5rem", 
                            fontWeight: 600,
                            display: "inline-block",
                            verticalAlign: "middle"
                          }}>
                            custom
                          </span>
                        )}
                      </span>
                      {item.quantityText && (
                        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                          {item.quantityText}
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmDeleteId !== item.id ? (
                    <button 
                      onClick={() => setConfirmDeleteId(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", padding: "0 0.5rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                      title="Remove item"
                    >
                      &times;
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button 
                        onClick={() => setConfirmDeleteId(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleDelete(item.id)}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

export default GroceryPage;