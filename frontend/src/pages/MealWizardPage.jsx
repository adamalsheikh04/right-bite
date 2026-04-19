import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PROTEIN_OPTIONS = ["Chicken", "Beef", "Fish", "Eggs", "Dairy", "Legumes", "Tofu"];

const labelStyle = { fontSize: 14, fontWeight: 600, color: "#2d3748", display: "block", marginBottom: 6 };
const selectStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid #cbd5e0",
  borderRadius: 8, fontSize: 14, background: "white", boxSizing: "border-box",
};

function MealWizardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    mealsPerDay: "3",
    proteinSources: [],
    avoidFoodsText: "",
    cookingEffort: "any",
    budgetLevel: "medium",
    cuisineStyle: "mixed",
    varietyLevel: "medium",
    extraNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  if (authLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <div style={{ padding: 20 }}><button onClick={() => navigate("/")}>Please Login</button></div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleProtein = (source) => {
    setForm((prev) => {
      const current = prev.proteinSources;
      const updated = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      return { ...prev, proteinSources: updated };
    });
    if (errors.proteinSources) setErrors((prev) => ({ ...prev, proteinSources: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.mealsPerDay) e.mealsPerDay = "Please select meals per day";
    if (form.proteinSources.length === 0) e.proteinSources = "Select at least one protein source";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setGenerating(true);
    const token = localStorage.getItem("token");

    try {
      // Step 1: Save preferences
      setStatusMsg("Saving your preferences...");
      const prefRes = await fetch("http://localhost:5000/api/meal-plan/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mealsPerDay: Number(form.mealsPerDay),
          proteinSources: form.proteinSources,
          avoidFoodsText: form.avoidFoodsText,
          cookingEffort: form.cookingEffort,
          budgetLevel: form.budgetLevel,
          cuisineStyle: form.cuisineStyle,
          varietyLevel: form.varietyLevel,
          extraNotes: form.extraNotes,
        }),
      });
      if (!prefRes.ok) {
        const d = await prefRes.json();
        setErrors({ form: d.message || "Failed to save preferences" });
        return;
      }

      // Step 2: Generate plan
      setStatusMsg("Generating your 7-day meal plan...");
      const genRes = await fetch("http://localhost:5000/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!genRes.ok) {
        const d = await genRes.json();
        setErrors({ form: d.message || "Failed to generate plan" });
        return;
      }

      setStatusMsg("✅ Plan generated! Redirecting...");
      setTimeout(() => navigate("/weekly-plan"), 1200);
    } catch {
      setErrors({ form: "Network error. Is the backend running?" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
      <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
        ← Back to Dashboard
      </button>
      <h2 style={{ margin: "0 0 4px" }}>Meal Plan Wizard</h2>
      <p style={{ margin: "0 0 24px", color: "#666", fontSize: 13 }}>Tell us your preferences and we'll build your 7-day plan.</p>

      {errors.form && (
        <div style={{ background: "#fed7d7", border: "1px solid #e53e3e", padding: 12, borderRadius: 8, marginBottom: 16, color: "#9b2c2c", fontSize: 14 }}>
          {errors.form}
        </div>
      )}
      {statusMsg && (
        <div style={{ background: "#ebf8ff", border: "1px solid #63b3ed", padding: 12, borderRadius: 8, marginBottom: 16, color: "#2b6cb0", fontSize: 14 }}>
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Meals per day */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Meals Per Day *</label>
          <select name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} style={selectStyle}>
            <option value="3">3 Meals (Breakfast, Lunch, Dinner)</option>
            <option value="4">4 Meals (+ Snack)</option>
            <option value="5">5 Meals (+ 2 Snacks)</option>
          </select>
          {errors.mealsPerDay && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.mealsPerDay}</p>}
        </div>

        {/* Protein Sources */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Preferred Protein Sources *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PROTEIN_OPTIONS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => toggleProtein(src)}
                style={{
                  padding: "8px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 500,
                  border: form.proteinSources.includes(src) ? "2px solid #4299e1" : "1px solid #cbd5e0",
                  background: form.proteinSources.includes(src) ? "#ebf8ff" : "white",
                  color: form.proteinSources.includes(src) ? "#2b6cb0" : "#555",
                }}
              >
                {src}
              </button>
            ))}
          </div>
          {errors.proteinSources && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.proteinSources}</p>}
        </div>

        {/* Foods to avoid */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Foods to Avoid</label>
          <textarea
            name="avoidFoodsText"
            placeholder="e.g. pork, nuts, dairy (optional)"
            value={form.avoidFoodsText}
            onChange={handleChange}
            rows={2}
            style={{ ...selectStyle, resize: "vertical" }}
          />
        </div>

        {/* Cooking Effort */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Cooking Effort</label>
          <select name="cookingEffort" value={form.cookingEffort} onChange={handleChange} style={selectStyle}>
            <option value="easy">Quick & Easy (under 15 min)</option>
            <option value="moderate">Moderate (15–30 min)</option>
            <option value="any">Any</option>
          </select>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Budget Level</label>
          <select name="budgetLevel" value={form.budgetLevel} onChange={handleChange} style={selectStyle}>
            <option value="low">Low Budget</option>
            <option value="medium">Medium Budget</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        {/* Cuisine */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Cuisine Style</label>
          <select name="cuisineStyle" value={form.cuisineStyle} onChange={handleChange} style={selectStyle}>
            <option value="arabic">Arabic / Middle Eastern</option>
            <option value="western">Western</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Variety */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Variety Level</label>
          <select name="varietyLevel" value={form.varietyLevel} onChange={handleChange} style={selectStyle}>
            <option value="low">Low — Repeat meals for simplicity</option>
            <option value="medium">Medium — Some variety each day</option>
            <option value="high">High — Different meals every day</option>
          </select>
        </div>

        {/* Extra Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Extra Notes (optional)</label>
          <textarea
            name="extraNotes"
            placeholder="Any other dietary preferences or notes..."
            value={form.extraNotes}
            onChange={handleChange}
            rows={2}
            style={{ ...selectStyle, resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          style={{
            width: "100%", padding: "14px", fontWeight: 700, fontSize: 16, borderRadius: 10, border: "none",
            background: generating ? "#a0aec0" : "#4299e1", color: "white",
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? statusMsg || "Generating..." : "✨ Generate My 7-Day Plan"}
        </button>
      </form>
    </div>
  );
}

export default MealWizardPage;