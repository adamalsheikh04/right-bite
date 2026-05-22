import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MOCK_MEALS = [
  { name: "Avocado Toast & Egg", calories: 340, protein: 14, carbs: 28, fat: 18, desc: "Sourdough toast with mashed avocado and a poached egg." },
  { name: "Mediterranean Salmon Salad", calories: 520, protein: 38, carbs: 12, fat: 34, desc: "Grilled salmon on mixed greens with feta, olives, and olive oil dressing." },
  { name: "Chicken and Rice Bowl", calories: 610, protein: 45, carbs: 65, fat: 12, desc: "Chicken breast with white rice, broccoli, and light soy sauce." },
  { name: "Protein Berry Smoothie", calories: 280, protein: 25, carbs: 32, fat: 4, desc: "Whey protein with mixed berries, almond milk, and banana." },
  { name: "Oatmeal with Almonds & Banana", calories: 380, protein: 10, carbs: 54, fat: 12, desc: "Rolled oats cooked in water, topped with sliced banana and honey." }
];

function LogMealPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [logMethod, setLogMethod] = useState(null); // null | 'manual' | 'upload' | 'camera'
  const [photo, setPhoto] = useState(null); // base64 representation of snapped or uploaded image
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

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

  // Clean up camera stream if active on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handle live video play when camera starts
  useEffect(() => {
    const video = document.getElementById("camera-video");
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(err => console.error("Video play failed:", err));
    }
  }, [stream, cameraActive]);

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

  // Camera Management Helpers
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
      setErrors((prev) => ({ ...prev, camera: "" }));
    } catch (err) {
      console.error("Camera access failed:", err);
      setErrors((prev) => ({
        ...prev,
        camera: "Could not access camera. Please check permissions or upload a photo instead."
      }));
      setLogMethod("upload");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById("camera-video");
    const canvas = document.createElement("canvas");
    if (video) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhoto(dataUrl);
      stopCamera();
    }
  };

  // Drag and Drop/Upload Helpers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock AI Auto-Fill Analysis
  const handleAiAutoFill = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      const randomMeal = MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)];
      setFormData({
        mealName: randomMeal.name,
        mealType: formData.mealType,
        calories: randomMeal.calories,
        proteinG: randomMeal.protein,
        carbsG: randomMeal.carbs,
        fatG: randomMeal.fat,
        description: `${randomMeal.desc}\n\n[AI Analysis: Nutrition estimates generated successfully from your photo.]`,
      });
      setAiAnalyzing(false);
    }, 1200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          photoBase64: photo || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`✅ "${formData.mealName}" logged successfully!`);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setErrors({ form: data.message || "Failed to log meal" });
      }
    } catch {
      setErrors({ form: "Network error. Is the backend running?" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetMethod = () => {
    stopCamera();
    setLogMethod(null);
    setPhoto(null);
    setErrors({});
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "3rem" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between" }}>
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
          
          {logMethod && (
            <button
              onClick={handleResetMethod}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: 0
              }}
            >
              🔄 Change Log Method
            </button>
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Log a Meal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Keep track of what you eat today.
          </p>
        </div>

        {successMsg && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid #10b981",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            color: "#10b981",
            fontWeight: 500,
            fontSize: "0.9375rem"
          }}>
            {successMsg}
          </div>
        )}

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

        {errors.camera && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            color: "#ef4444",
            fontSize: "0.875rem"
          }}>
            {errors.camera}
          </div>
        )}

        {/* Method Selector */}
        {!logMethod && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginTop: "1rem" }}>
            <div 
              onClick={() => setLogMethod("manual")}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                boxShadow: "var(--shadow-sm)"
              }}
              className="rb-method-card"
            >
              <div style={{ fontSize: "2.5rem" }}>✍️</div>
              <div>
                <h3 style={{ color: "var(--text-h)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>Manual Log</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Enter your meal details and macronutrients manually.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setLogMethod("upload")}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                boxShadow: "var(--shadow-sm)"
              }}
              className="rb-method-card"
            >
              <div style={{ fontSize: "2.5rem" }}>📁</div>
              <div>
                <h3 style={{ color: "var(--text-h)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>Upload Photo</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Select or drag a food picture. Optional AI will estimate macros!
                </p>
              </div>
            </div>

            <div 
              onClick={() => {
                setLogMethod("camera");
                startCamera();
              }}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                boxShadow: "var(--shadow-sm)"
              }}
              className="rb-method-card"
            >
              <div style={{ fontSize: "2.5rem" }}>📸</div>
              <div>
                <h3 style={{ color: "var(--text-h)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>Take Photo</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
                  Snap a live picture of your food using your device camera.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Flow Card */}
        {logMethod && (
          <Card>
            {/* Live Camera Flow */}
            {logMethod === "camera" && cameraActive && !photo && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <label className="rb-input-label">Capture Live Photo</label>
                <div style={{ position: "relative", width: "100%", height: "300px", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "#000" }}>
                  <video 
                    id="camera-video" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                    playsInline 
                    muted 
                  />
                  <div style={{ position: "absolute", bottom: "1rem", left: "0", right: "0", display: "flex", justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        backgroundColor: "#fff",
                        border: "5px solid rgba(16, 185, 129, 0.4)",
                        borderRadius: "50%",
                        width: "4rem",
                        height: "4rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        boxShadow: "var(--shadow-lg)"
                      }}
                      title="Take Photo"
                    >
                      📸
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
                    Cancel
                  </Button>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                    Point camera at your meal and snap!
                  </span>
                </div>
              </div>
            )}

            {/* Photo Uploader Flow */}
            {logMethod === "upload" && !photo && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="rb-input-label">Upload Food Image</label>
                <div 
                  style={{
                    border: "2px dashed var(--primary)",
                    borderRadius: "var(--radius-lg)",
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "rgba(16, 185, 129, 0.02)",
                    position: "relative"
                  }}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer"
                    }}
                  />
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🥗</div>
                  <h4 style={{ color: "var(--text-h)", marginBottom: "0.25rem" }}>Choose or drag file here</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
                    Supports PNG, JPG, JPEG up to 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Photo Preview & AI Analyze Action */}
            {photo && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="rb-input-label">Food Image Attached</label>
                <div style={{ position: "relative", width: "100%", height: "250px", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                  <img src={photo} alt="Food Log" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button 
                    type="button" 
                    onClick={() => setPhoto(null)} 
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      backgroundColor: "rgba(239, 68, 68, 0.95)",
                      border: "none",
                      color: "#fff",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      boxShadow: "var(--shadow-sm)",
                      transition: "background var(--transition-fast)"
                    }}
                  >
                    ✕ Clear Image
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={aiAnalyzing}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--primary)",
                    backgroundColor: "rgba(16, 185, 129, 0.05)",
                    color: "var(--primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  {aiAnalyzing ? (
                    <>🤖 AI is analyzing image details...</>
                  ) : (
                    <>✨ Auto-Fill with AI Nutrition Estimate</>
                  )}
                </button>
              </div>
            )}

            {/* Logging Form (Visible for manual OR when photo is uploaded/snapped) */}
            {(logMethod === "manual" || photo) && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Meal Name */}
                <Input
                  label="Meal Name *"
                  type="text"
                  name="mealName"
                  placeholder="e.g., Avocado Toast, Grilled Chicken"
                  value={formData.mealName}
                  onChange={handleChange}
                  error={errors.mealName}
                  required
                />

                {/* Meal Type */}
                <div className="rb-input-wrapper">
                  <label className="rb-input-label">Meal Type *</label>
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleChange}
                    className="rb-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {MEAL_TYPES.map((type) => (
                      <option key={type} value={type} style={{ backgroundColor: 'var(--bg-surface)' }}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calories */}
                <Input
                  label="Calories *"
                  type="number"
                  name="calories"
                  placeholder="e.g., 350"
                  value={formData.calories}
                  onChange={handleChange}
                  error={errors.calories}
                  min="0"
                  required
                />

                {/* Macros Grid */}
                <div>
                  <label className="rb-input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Macros (optional)</label>
                  <div className="rb-macros-grid">
                    <Input
                      label="Protein (g)"
                      type="number"
                      name="proteinG"
                      placeholder="0"
                      value={formData.proteinG}
                      onChange={handleChange}
                      error={errors.proteinG}
                      min="0"
                    />
                    <Input
                      label="Carbs (g)"
                      type="number"
                      name="carbsG"
                      placeholder="0"
                      value={formData.carbsG}
                      onChange={handleChange}
                      error={errors.carbsG}
                      min="0"
                    />
                    <Input
                      label="Fat (g)"
                      type="number"
                      name="fatG"
                      placeholder="0"
                      value={formData.fatG}
                      onChange={handleChange}
                      error={errors.fatG}
                      min="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="rb-input-wrapper">
                  <label className="rb-input-label">Notes / Description (optional)</label>
                  <textarea
                    name="description"
                    placeholder="e.g., Added hot honey and red pepper flakes"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="rb-input"
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: "0.5rem" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={saving || !!successMsg}
                  >
                    {saving ? "Saving..." : successMsg ? "Logged! Redirecting..." : "Log Meal"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default LogMealPage;