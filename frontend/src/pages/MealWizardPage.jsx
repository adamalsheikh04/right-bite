import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  );
}

export default MealWizardPage;