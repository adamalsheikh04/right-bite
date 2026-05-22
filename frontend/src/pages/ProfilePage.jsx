import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "",
    heightCm: "",
    currentWeightKg: "",
    targetWeightKg: "",
    goal: "",
    activityLevel: "",
    primaryDietaryStyle: "",
    allergiesText: "",
    dislikedFoodsText: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setFetching(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const p = data.data;
          if (p) {
            // Pre-fill form with existing data
            setFormData({
              fullName: p.fullName || "",
              age: p.age || "",
              sex: p.sex || "",
              heightCm: p.heightCm || "",
              currentWeightKg: p.currentWeightKg || "",
              targetWeightKg: p.targetWeightKg || "",
              goal: p.goal || "",
              activityLevel: p.activityLevel || "",
              primaryDietaryStyle: p.primaryDietaryStyle || "",
              allergiesText: p.allergiesText || "",
              dislikedFoodsText: p.dislikedFoodsText || "",
            });
            
            // If profile is completely blank, go straight to editing
            if (!p.fullName) {
              setIsEditing(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data.");
      } finally {
        setFetching(false);
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile saved successfully!");
        setError(null);
        setTimeout(() => {
          setIsEditing(false);
          setSuccess(null);
        }, 1000);
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

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

  const textareaStyle = {
    ...selectStyle,
    fontFamily: "inherit",
    resize: "vertical"
  };

  if (authLoading || fetching) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
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

  // Format Helper Labels for profile display
  const getGoalLabel = (g) => {
    if (g === "lose") return "Lose Weight 📉";
    if (g === "maintain") return "Maintain Weight ⚖️";
    if (g === "gain") return "Gain Weight 📈";
    return "Not Set";
  };

  const getActivityLabel = (act) => {
    const list = {
      sedentary: "Sedentary (No exercise)",
      light: "Lightly Active (1-2 days/wk)",
      moderate: "Moderately Active (3-5 days/wk)",
      active: "Active (6-7 days/wk)",
      very_active: "Very Active (Physical job)"
    };
    return list[act] || act || "Not Set";
  };

  const getDietLabel = (diet) => {
    if (!diet) return "Not Set";
    return diet.charAt(0).toUpperCase() + diet.slice(1);
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        
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

        {!isEditing ? (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0 2rem' }}>
              
              {/* Profile Avatar */}
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: 'var(--primary-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'var(--primary-hover)',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontWeight: '600'
              }}>
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase())}
              </div>
              
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-h)', fontWeight: '600' }}>
                {formData.fullName || "User Profile"}
              </h2>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                {user.email}
              </p>

              {/* Profile Details Grid */}
              <div 
                className="rb-responsive-grid"
                style={{ 
                  width: '100%', 
                  marginBottom: '2rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1.5rem'
                }}
              >
                
                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Age & Sex</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {formData.age ? `${formData.age} years` : '—'} / {formData.sex ? formData.sex.charAt(0).toUpperCase() + formData.sex.slice(1) : '—'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Height</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {formData.heightCm ? `${formData.heightCm} cm` : '—'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Current Weight</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {formData.currentWeightKg ? `${formData.currentWeightKg} kg` : '—'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Target Weight</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {formData.targetWeightKg ? `${formData.targetWeightKg} kg` : '—'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Goal</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {getGoalLabel(formData.goal)}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Diet Style</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {getDietLabel(formData.primaryDietaryStyle)}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Activity Level</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: 'var(--text-h)' }}>
                    {getActivityLabel(formData.activityLevel)}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Allergies & Avoids</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: formData.allergiesText ? 'var(--text-h)' : 'var(--text-muted)' }}>
                    {formData.allergiesText || 'None recorded'}
                  </p>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.875rem', borderRadius: 'var(--radius-md)', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Disliked Foods</span>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: formData.dislikedFoodsText ? 'var(--text-h)' : 'var(--text-muted)' }}>
                    {formData.dislikedFoodsText || 'None recorded'}
                  </p>
                </div>
              </div>
              
              <Button variant="primary" onClick={() => setIsEditing(true)} style={{ padding: '0.625rem 2rem' }}>
                Edit Profile Settings
              </Button>
            </div>
          </Card>
        ) : (
          <Card header={<h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-h)", fontWeight: 600 }}>Edit Profile Details</h2>}>
            
            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.25rem",
                color: "#ef4444",
                fontWeight: 500,
                fontSize: "0.9375rem"
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid #10b981",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.25rem",
                color: "#10b981",
                fontWeight: 500,
                fontSize: "0.9375rem"
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Full Name */}
              <Input
                label="Full Name *"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              {/* Age and Sex Row */}
              <div className="rb-responsive-grid">
                <Input
                  label="Age *"
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <div className="rb-input-wrapper">
                  <label className="rb-input-label">Sex *</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Height and Weight Row */}
              <div className="rb-responsive-grid">
                <Input
                  label="Height (cm) *"
                  type="number"
                  name="heightCm"
                  placeholder="Height"
                  value={formData.heightCm}
                  onChange={handleChange}
                  min="30"
                  required
                />
                <Input
                  label="Current Weight (kg) *"
                  type="number"
                  name="currentWeightKg"
                  placeholder="Weight"
                  value={formData.currentWeightKg}
                  onChange={handleChange}
                  min="10"
                  required
                />
              </div>

              {/* Target Weight */}
              <Input
                label="Target Weight (kg)"
                type="number"
                name="targetWeightKg"
                placeholder="Target Weight"
                value={formData.targetWeightKg}
                onChange={handleChange}
                min="10"
              />

              {/* Goal Select */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Goal *</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Goal</option>
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              {/* Activity Level */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Activity Level *</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (Office job, little exercise)</option>
                  <option value="light">Light (1-2 days/week exercise)</option>
                  <option value="moderate">Moderate (3-5 days/week exercise)</option>
                  <option value="active">Active (6-7 days/week exercise)</option>
                  <option value="very_active">Very Active (Athlete or physical job)</option>
                </select>
              </div>

              {/* Dietary Style */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Dietary Style *</label>
                <select
                  name="primaryDietaryStyle"
                  value={formData.primaryDietaryStyle}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Dietary Style</option>
                  <option value="omnivore">Omnivore</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="keto">Keto</option>
                  <option value="low_carb">Low Carb</option>
                  <option value="high_protein">High Protein</option>
                </select>
              </div>

              {/* Allergies */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Allergies / Foods to Avoid</label>
                <textarea
                  name="allergiesText"
                  placeholder="e.g. Peanuts, Shellfish (optional)"
                  rows="2"
                  value={formData.allergiesText}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

              {/* Dislikes */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Disliked Foods</label>
                <textarea
                  name="dislikedFoodsText"
                  placeholder="e.g. Mushrooms, Olives (optional)"
                  rows="2"
                  value={formData.dislikedFoodsText}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="outline" fullWidth onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" fullWidth disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default ProfilePage;