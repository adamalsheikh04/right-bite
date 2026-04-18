import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          // Pre-fill form with existing data
          setFormData({
            fullName: data.fullName || "",
            age: data.age || "",
            sex: data.sex || "",
            heightCm: data.heightCm || "",
            currentWeightKg: data.currentWeightKg || "",
            targetWeightKg: data.targetWeightKg || "",
            goal: data.goal || "",
            activityLevel: data.activityLevel || "",
            primaryDietaryStyle: data.primaryDietaryStyle || "",
            allergiesText: data.allergiesText || "",
            dislikedFoodsText: data.dislikedFoodsText || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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
        alert("Profile saved successfully!");
        navigate("/dashboard");
      } else {
        alert(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Please Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile Setup</h2>
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

        <div style={{ marginBottom: 10 }}>
          <label>Age</label><br />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Sex</label><br />
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Height (cm)</label><br />
          <input
            type="number"
            name="heightCm"
            placeholder="Height (cm)"
            value={formData.heightCm}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Current Weight (kg)</label><br />
          <input
            type="number"
            name="currentWeightKg"
            placeholder="Current Weight (kg)"
            value={formData.currentWeightKg}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Target Weight (kg)</label><br />
          <input
            type="number"
            name="targetWeightKg"
            placeholder="Target Weight (kg)"
            value={formData.targetWeightKg}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Goal</label><br />
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Activity Level</label><br />
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          >
            <option value="">Select Activity Level</option>
            <option value="sedentary">Sedentary (Office job, little exercise)</option>
            <option value="light">Light (1-2 days/week exercise)</option>
            <option value="moderate">Moderate (3-5 days/week exercise)</option>
            <option value="active">Active (6-7 days/week exercise)</option>
            <option value="very_active">Very Active (Professional athlete/physical job)</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Dietary Style</label><br />
          <select
            name="primaryDietaryStyle"
            value={formData.primaryDietaryStyle}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
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

        <div style={{ marginBottom: 10 }}>
          <label>Allergies / Foods to Avoid</label><br />
          <textarea
            name="allergiesText"
            placeholder="e.g. Peanuts, Shellfish"
            rows="3"
            value={formData.allergiesText}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Disliked Foods</label><br />
          <textarea
            name="dislikedFoodsText"
            placeholder="e.g. Mushrooms, Olives"
            rows="3"
            value={formData.dislikedFoodsText}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;