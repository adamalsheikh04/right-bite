import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

function MealWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    goal: "",
    mealsPerDay: "",
    dietType: "",
    cuisineStyle: "",
    allergies: "",
    extraNotes: ""
  });

  // Mock toggle for proteins
  const [proteins, setProteins] = useState({
    chicken: false,
    beef: false,
    fish: false,
    eggs: false,
    plantBased: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleProtein = (key) => {
    setProteins(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/weekly-plan");
    }, 1500);
  };

  // Reusable styles for form elements
  const selectStyle = { 
    width: "100%", 
    padding: "0.875rem 1rem", 
    borderRadius: "var(--radius-md)", 
    border: "1px solid var(--border)", 
    background: "var(--bg)", 
    color: "var(--text)", 
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease"
  };

  const textareaStyle = {
    ...selectStyle,
    fontFamily: "inherit",
    resize: "vertical"
  };

  // Option box style (selectable cards)
  const renderOptionBox = (label, isSelected, onClick) => (
    <div 
      onClick={onClick}
      style={{
        padding: "1rem",
        borderRadius: "var(--radius-md)",
        border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
        background: isSelected ? "var(--primary-light)" : "var(--bg)",
        color: isSelected ? "var(--primary-hover)" : "var(--text)",
        cursor: "pointer",
        textAlign: "center",
        fontWeight: isSelected ? 600 : 500,
        transition: "all 0.2s ease"
      }}
    >
      {label}
    </div>
  );

  return (
    <AppLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem", color: "var(--text-h)" }}>
            Meal Plan Wizard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", maxWidth: "500px", margin: "0 auto" }}>
            Let's create a personalized nutrition plan tailored to your goals and preferences.
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem", position: "relative" }}>
          <div style={{ position: "absolute", top: "20px", left: "0", right: "0", height: "2px", background: "var(--border)", zIndex: 0 }} />
          {[1, 2, 3].map(step => (
            <div key={step} style={{ 
              position: "relative", 
              zIndex: 1, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "0.5rem",
              width: "33%"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: currentStep >= step ? "var(--primary)" : "var(--bg)",
                border: `2px solid ${currentStep >= step ? "var(--primary)" : "var(--border)"}`,
                color: currentStep >= step ? "white" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "1.125rem",
                transition: "all 0.3s ease"
              }}>
                {step}
              </div>
              <span style={{ 
                fontSize: "0.875rem", 
                fontWeight: currentStep >= step ? 600 : 500,
                color: currentStep >= step ? "var(--text-h)" : "var(--text-muted)",
              }}>
                {step === 1 ? "Goals" : step === 2 ? "Preferences" : "Generate"}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content wrapped in Card */}
        <Card style={{ padding: "2.5rem" }}>
          
          {currentStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center" }}>Step 1: Define Your Goal</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>What is your primary goal?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                  {renderOptionBox("Weight Loss", formData.goal === "lose", () => setFormData({...formData, goal: "lose"}))}
                  {renderOptionBox("Maintain Weight", formData.goal === "maintain", () => setFormData({...formData, goal: "maintain"}))}
                  {renderOptionBox("Muscle Gain", formData.goal === "gain", () => setFormData({...formData, goal: "gain"}))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>How many meals per day?</label>
                <select name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} style={selectStyle}>
                  <option value="">Select meals</option>
                  <option value="3">3 Meals (Breakfast, Lunch, Dinner)</option>
                  <option value="4">4 Meals (+ 1 Snack)</option>
                  <option value="5">5 Meals (+ 2 Snacks)</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center" }}>Step 2: Dietary Preferences</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>Diet Type</label>
                <select name="dietType" value={formData.dietType} onChange={handleChange} style={selectStyle}>
                  <option value="">Select Diet Type</option>
                  <option value="omnivore">Standard / Omnivore</option>
                  <option value="keto">Keto</option>
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>Preferred Protein Sources</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
                  {renderOptionBox("Chicken", proteins.chicken, () => toggleProtein("chicken"))}
                  {renderOptionBox("Beef", proteins.beef, () => toggleProtein("beef"))}
                  {renderOptionBox("Fish", proteins.fish, () => toggleProtein("fish"))}
                  {renderOptionBox("Eggs", proteins.eggs, () => toggleProtein("eggs"))}
                  {renderOptionBox("Plant-Based", proteins.plantBased, () => toggleProtein("plantBased"))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center" }}>Step 3: Final Details</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>Allergies or Foods to Avoid</label>
                <textarea 
                  name="allergies" 
                  value={formData.allergies} 
                  onChange={handleChange} 
                  placeholder="e.g. Peanuts, Shellfish, Mushrooms" 
                  rows="3" 
                  style={textareaStyle} 
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600, color: "var(--text-h)" }}>Any other notes?</label>
                <textarea 
                  name="extraNotes" 
                  value={formData.extraNotes} 
                  onChange={handleChange} 
                  placeholder="e.g. Quick prep only, strict budget" 
                  rows="2" 
                  style={textareaStyle} 
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} style={{ padding: "0.75rem 2rem", minWidth: "120px" }}>
                  Back
                </Button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <Button variant="primary" onClick={handleNext} style={{ padding: "0.75rem 2rem", minWidth: "140px" }}>
                  Next Step
                </Button>
              ) : (
                <Button variant="primary" onClick={handleGenerate} disabled={loading} style={{ padding: "0.75rem 2rem", minWidth: "160px" }}>
                  {loading ? "Generating..." : "Generate Plan ✨"}
                </Button>
              )}
            </div>
          </div>

        </Card>
      </div>
    </AppLayout>
=======
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
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b
  );
}

export default MealWizardPage;