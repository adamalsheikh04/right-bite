import { useState } from "react";
<<<<<<< HEAD
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function LogMealPage() {
  const [foodItem, setFoodItem] = useState("");
  const [loggedFoods, setLoggedFoods] = useState([
    { id: 1, name: "Grilled Chicken Breast", calories: 165 },
    { id: 2, name: "Brown Rice", calories: 215 },
  ]);

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodItem.trim()) return;

    // Mock adding food
    const newFood = {
      id: Date.now(),
      name: foodItem,
      calories: Math.floor(Math.random() * 300) + 50, // mock calories
    };

    setLoggedFoods([newFood, ...loggedFoods]);
    setFoodItem("");
  };

  const handleRemove = (id) => {
    setLoggedFoods(loggedFoods.filter((food) => food.id !== id));
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Log a Meal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Keep track of what you eat today.
          </p>
        </div>

        <Card style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleAddFood} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add Food Item"
                type="text"
                placeholder="e.g., Apple, Chicken Salad"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: "1px" }}>
              <Button type="submit" variant="primary">
                Add Food
              </Button>
            </div>
          </form>
        </Card>

        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--text-h)" }}>
            Today's Log
          </h2>
          
          {loggedFoods.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
              No foods logged yet. Start adding!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loggedFoods.map((food) => (
                <Card key={food.id} style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", margin: 0, color: "var(--text-h)", fontWeight: 600 }}>
                        {food.name}
                      </h3>
                      <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        {food.calories} kcal
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleRemove(food.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
=======
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function LogMealPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    mealName: "",
    mealType: "Breakfast",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (authLoading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.mealName.trim()) newErrors.mealName = "Meal name is required";
    if (formData.calories === "" || Number(formData.calories) < 0)
      newErrors.calories = "Enter a valid calorie amount (0 or more)";
    if (formData.proteinG !== "" && Number(formData.proteinG) < 0)
      newErrors.proteinG = "Protein cannot be negative";
    if (formData.carbsG !== "" && Number(formData.carbsG) < 0)
      newErrors.carbsG = "Carbs cannot be negative";
    if (formData.fatG !== "" && Number(formData.fatG) < 0)
      newErrors.fatG = "Fat cannot be negative";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealName: formData.mealName.trim(),
          mealType: formData.mealType,
          calories: Number(formData.calories) || 0,
          proteinG: Number(formData.proteinG) || 0,
          carbsG: Number(formData.carbsG) || 0,
          fatG: Number(formData.fatG) || 0,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`✅ "${formData.mealName}" logged successfully!`);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setErrors({ form: data.message || "Failed to log meal" });
      }
    } catch (error) {
      setErrors({ form: "Network error. Is the backend running?" });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    border: errors[fieldName] ? "1px solid #e53e3e" : "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "14px", marginBottom: 16 }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: 4 }}>Log a Meal</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>Track what you eat today.</p>

      {successMsg && (
        <div style={{ background: "#c6f6d5", border: "1px solid #38a169", padding: "12px", borderRadius: "8px", marginBottom: 16, color: "#276749" }}>
          {successMsg}
        </div>
      )}

      {errors.form && (
        <div style={{ background: "#fed7d7", border: "1px solid #e53e3e", padding: "12px", borderRadius: "8px", marginBottom: 16, color: "#9b2c2c" }}>
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Meal Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meal Name *</label>
          <input
            type="text"
            name="mealName"
            placeholder="e.g. Oatmeal with Berries"
            value={formData.mealName}
            onChange={handleChange}
            style={inputStyle("mealName")}
          />
          {errors.mealName && <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: 4 }}>{errors.mealName}</p>}
        </div>

        {/* Meal Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meal Type *</label>
          <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            style={inputStyle("mealType")}
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Calories */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Calories *</label>
          <input
            type="number"
            name="calories"
            placeholder="e.g. 350"
            value={formData.calories}
            onChange={handleChange}
            min="0"
            style={inputStyle("calories")}
          />
          {errors.calories && <p style={{ color: "#e53e3e", fontSize: "12px", marginTop: 4 }}>{errors.calories}</p>}
        </div>

        {/* Macros Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Protein (g)</label>
            <input
              type="number"
              name="proteinG"
              placeholder="0"
              value={formData.proteinG}
              onChange={handleChange}
              min="0"
              style={inputStyle("proteinG")}
            />
            {errors.proteinG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.proteinG}</p>}
          </div>
          <div>
            <label style={labelStyle}>Carbs (g)</label>
            <input
              type="number"
              name="carbsG"
              placeholder="0"
              value={formData.carbsG}
              onChange={handleChange}
              min="0"
              style={inputStyle("carbsG")}
            />
            {errors.carbsG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.carbsG}</p>}
          </div>
          <div>
            <label style={labelStyle}>Fat (g)</label>
            <input
              type="number"
              name="fatG"
              placeholder="0"
              value={formData.fatG}
              onChange={handleChange}
              min="0"
              style={inputStyle("fatG")}
            />
            {errors.fatG && <p style={{ color: "#e53e3e", fontSize: "11px", marginTop: 2 }}>{errors.fatG}</p>}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            name="description"
            placeholder="e.g. Full bowl, added honey"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            style={{ ...inputStyle("description"), resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !!successMsg}
          style={{
            width: "100%",
            padding: "14px",
            background: saving || successMsg ? "#a0aec0" : "#38a169",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: saving || successMsg ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : successMsg ? "Logged! Redirecting..." : "Log Meal"}
        </button>
      </form>
    </div>
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b
  );
}

export default LogMealPage;