import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";

const PROTEIN_OPTIONS = ["Chicken", "Beef", "Fish", "Eggs", "Dairy", "Legumes", "Tofu"];

function MealWizardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
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

  if (authLoading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
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

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setCurrentStep(2); // Jump to preferences step if errors are there
      return;
    }

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

  // Reusable styles for form inputs
  const selectStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text)",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color var(--transition-fast)"
  };

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

        {/* Header Title */}
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
                background: currentStep >= step ? "var(--primary)" : "var(--bg-surface)",
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

        {errors.form && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            color: "#ef4444",
            fontWeight: 500,
            fontSize: "0.9375rem"
          }}>
            {errors.form}
          </div>
        )}

        {statusMsg && (
          <div style={{
            background: "rgba(66, 153, 225, 0.1)",
            border: "1px solid var(--primary)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            color: "var(--primary)",
            fontWeight: 500,
            fontSize: "0.9375rem"
          }}>
            {statusMsg}
          </div>
        )}

        {/* Step Content wrapped in Card */}
        <Card style={{ padding: "2.5rem" }}>
          <form onSubmit={handleSubmit}>
            
            {currentStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center", fontWeight: 600 }}>
                  Step 1: Plan Goals & Options
                </h2>
                
                {/* Meals per day */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Meals Per Day *</label>
                  <select
                    name="mealsPerDay"
                    value={form.mealsPerDay}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="3">3 Meals (Breakfast, Lunch, Dinner)</option>
                    <option value="4">4 Meals (+ 1 Snack)</option>
                    <option value="5">5 Meals (+ 2 Snacks)</option>
                  </select>
                  {errors.mealsPerDay && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.mealsPerDay}</p>}
                </div>

                {/* Cuisine Style */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Preferred Cuisine Style</label>
                  <select
                    name="cuisineStyle"
                    value={form.cuisineStyle}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="mixed">Mixed Styles</option>
                    <option value="arabic">Arabic / Middle Eastern</option>
                    <option value="western">Western / European</option>
                  </select>
                </div>

                {/* Variety Level */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Variety Level</label>
                  <select
                    name="varietyLevel"
                    value={form.varietyLevel}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="low">Low — Repeat meals for simplicity</option>
                    <option value="medium">Medium — Some variety each day</option>
                    <option value="high">High — Different meals every day</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center", fontWeight: 600 }}>
                  Step 2: Dietary Preferences
                </h2>
                
                {/* Proteins */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label" style={{ marginBottom: "0.75rem" }}>Preferred Protein Sources *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {PROTEIN_OPTIONS.map((src) => {
                      const isSelected = form.proteinSources.includes(src);
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => toggleProtein(src)}
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            fontWeight: 500,
                            border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                            background: isSelected ? "var(--primary-light)" : "var(--bg-surface)",
                            color: isSelected ? "var(--primary-hover)" : "var(--text)",
                            transition: "all var(--transition-fast)"
                          }}
                        >
                          {src}
                        </button>
                      );
                    })}
                  </div>
                  {errors.proteinSources && (
                    <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                      {errors.proteinSources}
                    </p>
                  )}
                </div>

                {/* Foods to avoid */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Foods or Allergies to Avoid</label>
                  <textarea
                    name="avoidFoodsText"
                    placeholder="e.g., pork, peanuts, dairy, shellfish (optional)"
                    value={form.avoidFoodsText}
                    onChange={handleChange}
                    rows={3}
                    className="rb-input"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0, textAlign: "center", fontWeight: 600 }}>
                  Step 3: Logistics & Notes
                </h2>
                
                {/* Cooking Effort */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Cooking Effort</label>
                  <select
                    name="cookingEffort"
                    value={form.cookingEffort}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="any">Any Level</option>
                    <option value="easy">Quick & Easy (under 15 min)</option>
                    <option value="moderate">Moderate Prep (15–30 min)</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Budget Level</label>
                  <select
                    name="budgetLevel"
                    value={form.budgetLevel}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="medium">Medium Budget</option>
                    <option value="low">Low Budget</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Extra Notes */}
                <div className="rb-input-wrapper" style={{ margin: 0 }}>
                  <label className="rb-input-label">Extra Notes (optional)</label>
                  <textarea
                    name="extraNotes"
                    placeholder="Any other preferences, goals or diet instructions..."
                    value={form.extraNotes}
                    onChange={handleChange}
                    rows={3}
                    className="rb-input"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "2.5rem", 
              paddingTop: "1.5rem", 
              borderTop: "1px solid var(--border)" 
            }}>
              <div>
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={generating}
                    style={{ padding: "0.625rem 1.5rem", minWidth: "100px" }}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 3 ? (
                  <Button 
                    variant="primary" 
                    onClick={handleNext}
                    style={{ padding: "0.625rem 1.5rem", minWidth: "120px" }}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={generating}
                    style={{ padding: "0.625rem 1.75rem", minWidth: "160px" }}
                  >
                    {generating ? statusMsg || "Generating..." : "Generate Plan ✨"}
                  </Button>
                )}
              </div>
            </div>

          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

export default MealWizardPage;