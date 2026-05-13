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
<<<<<<< HEAD
  const [isEditing, setIsEditing] = useState(false);
=======
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b

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
<<<<<<< HEAD
        alert("Profile saved successfully!");
        setIsEditing(false);
=======
        setSuccess("Profile saved successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const selectStyle = { 
    width: "100%", 
    padding: "0.625rem 0.875rem", 
    borderRadius: "var(--radius-md)", 
    border: "1px solid var(--border)", 
    background: "var(--bg)", 
    color: "var(--text)", 
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s ease"
  };

  const textareaStyle = {
    ...selectStyle,
    fontFamily: "inherit",
    resize: "vertical"
  };

  if (authLoading || fetching) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    </AppLayout>
  );
=======
  if (authLoading || fetching) return <div style={{ padding: 20 }}>Loading profile...</div>;
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b

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

  return (
<<<<<<< HEAD
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        
        {!isEditing ? (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
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
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}>
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase())}
              </div>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-h)', fontWeight: '600' }}>
                {formData.fullName || user.name || "User Profile"}
              </h2>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                {user.email}
              </p>
              
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </Card>
        ) : (
          <Card header={<h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-h)" }}>Edit Profile</h2>}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
=======
    <div style={{ padding: 20 }}>
      <h2>Profile Setup</h2>
      
      {error && (
        <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f5c6cb" }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #c3e6cb" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 10 }}>
          <label>Full Name</label><br />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Age"
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Sex</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Height (cm)"
                  type="number"
                  name="heightCm"
                  placeholder="Height"
                  value={formData.heightCm}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  name="currentWeightKg"
                  placeholder="Weight"
                  value={formData.currentWeightKg}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Target Weight (kg)"
                type="number"
                name="targetWeightKg"
                placeholder="Target Weight"
                value={formData.targetWeightKg}
                onChange={handleChange}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Goal</label>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Activity Level</label>
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
                  <option value="very_active">Very Active (Professional athlete/physical job)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Dietary Style</label>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Allergies / Foods to Avoid</label>
                <textarea
                  name="allergiesText"
                  placeholder="e.g. Peanuts, Shellfish"
                  rows="3"
                  value={formData.allergiesText}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>Disliked Foods</label>
                <textarea
                  name="dislikedFoodsText"
                  placeholder="e.g. Mushrooms, Olives"
                  rows="3"
                  value={formData.dislikedFoodsText}
                  onChange={handleChange}
                  style={textareaStyle}
                />
              </div>

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