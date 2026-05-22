import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function SettingsPage() {
  const navigate = useNavigate();
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile data states
  const [profileData, setProfileData] = useState({
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
    photoPath: "",
  });

  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);

  // Account data states
  const [accountData, setAccountData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // Password data states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state toggles
  const [profileLoading, setProfileLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [accountSuccess, setAccountSuccess] = useState(null);

  useEffect(() => {
    async function fetchProfileData() {
      const token = localStorage.getItem("token");
      if (!token) { setFetchingProfile(false); return; }

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const p = json.data;
          if (p) {
            setProfileData({
              fullName: p.fullName || "",
              age: p.age || "",
              sex: p.sex || "",
              heightCm: p.heightCm || "",
              currentWeightKg: p.currentWeightKg || "",
              targetWeightKg: p.targetWeightKg || "",
              goal: p.goal || "",
              activityLevel: p.activityLevel || "",
              primaryDietaryStyle: p.primaryDietaryStyle || "none",
              allergiesText: p.allergiesText || "",
              dislikedFoodsText: p.dislikedFoodsText || "",
              photoPath: p.photoPath || "",
            });
            if (p.photoPath) {
              setPhotoPreview(`http://localhost:5000${p.photoPath}`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile settings:", err);
      } finally {
        setFetchingProfile(false);
      }
    }

    if (!authLoading && user) {
      setAccountData({
        username: user.email.split('@')[0],
        email: user.email,
        phone: "+1 (555) 019-2834",
      });
      fetchProfileData();
    }
  }, [authLoading, user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          photoBase64: photoBase64 // passes uploaded image, remains null if unchanged
        })
      });

      const json = await response.json();
      if (response.ok) {
        setProfileSuccess("Physical profile saved successfully!");
        setPhotoBase64(null); // reset base64 to avoid resending
        if (json.data?.photoPath) {
          setProfileData(prev => ({ ...prev, photoPath: json.data.photoPath }));
          setPhotoPreview(`http://localhost:5000${json.data.photoPath}`);
        }
        // Force refresh the global Auth context so sidebar and navbar sync instantly
        await refreshUser();
        setTimeout(() => setProfileSuccess(null), 3000);
      } else {
        setProfileError(json.message || "Failed to save physical profile details.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setProfileError("A network error occurred. Is the server online?");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountSuccess(null);
    // Simulate save
    setTimeout(() => {
      setAccountLoading(false);
      setAccountSuccess("Account preferences saved successfully!");
      setTimeout(() => setAccountSuccess(null), 3000);
    }, 800000 / 1000000 + 600); // quick mock feedback
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

  if (authLoading || fetchingProfile) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: "2rem",
              height: "2rem",
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Settings...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: "720px", margin: "0 auto", paddingBottom: "3rem" }}>
        
        {/* Breadcrumb Header */}
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

        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.35rem", color: "var(--text-h)", fontWeight: 600 }}>
            Settings & Control Panel
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
            Configure your physical attributes, manage theme styles, and protect credentials.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1: Appearance Preferences */}
          <Card header={<h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--text-h)" }}>🎨 Appearance Preferences</h2>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-h)", fontSize: "0.95rem" }}>Interface Theme</p>
                <p style={{ margin: "0.15rem 0 0", color: "var(--text-muted)", fontSize: "0.825rem" }}>
                  Select the color style of the application. Adaptable for day or night.
                </p>
              </div>
              <div style={{ width: "220px" }}>
                <div style={{
                  display: 'flex',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.25rem',
                  position: 'relative',
                  userSelect: 'none'
                }}>
                  {/* Sliding theme pill */}
                  <div style={{
                    position: 'absolute',
                    top: '0.25rem',
                    bottom: '0.25rem',
                    left: theme === 'light' ? '0.25rem' : 'calc(50% + 0.125rem)',
                    width: 'calc(50% - 0.375rem)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'calc(var(--radius-lg) - 0.25rem)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1
                  }} />
                  
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: theme === 'light' ? 'var(--primary-hover)' : 'var(--text-muted)',
                      padding: '0.5rem 0',
                      fontSize: '0.85rem',
                      fontWeight: theme === 'light' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      zIndex: 2,
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    ☀️ Light
                  </button>
                  
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: theme === 'dark' ? 'var(--primary-hover)' : 'var(--text-muted)',
                      padding: '0.5rem 0',
                      fontSize: '0.85rem',
                      fontWeight: theme === 'dark' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      zIndex: 2,
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    🌙 Dark
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 2: Physical & Nutritional Profile */}
          <Card header={<h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--text-h)" }}>👤 Physical Parameters & Profile</h2>}>
            
            {profileError && (
              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid var(--danger)", padding: "0.875rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", color: "var(--danger)", fontWeight: 500, fontSize: "0.85rem" }}>
                ⚠️ {profileError}
              </div>
            )}

            {profileSuccess && (
              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid var(--primary)", padding: "0.875rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", color: "var(--primary-hover)", fontWeight: 600, fontSize: "0.85rem" }}>
                ✓ {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Photo Avatar Uploader */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)' }}>
                <div 
                  onClick={handlePhotoUploadClick}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2.5px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  className="rb-action-tile"
                  title="Upload profile picture"
                >
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="User Profile Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ fontSize: '2.25rem', color: 'var(--primary-hover)', fontWeight: 700 }}>
                      {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Subtle Camera Hover Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    fontSize: '0.625rem',
                    textAlign: 'center',
                    padding: '0.15rem 0',
                    fontWeight: 600
                  }}>
                    UPLOAD
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem', color: 'var(--text-h)' }}>Profile Picture</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Clear square photos look best! Clicking the circle allows uploading standard JPG or PNG images.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePhotoUploadClick}
                    style={{ marginTop: '0.625rem', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    📁 Choose Photo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange} 
                    accept="image/*" 
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Full Name */}
              <Input
                label="Full Name *"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={handleProfileChange}
                required
              />

              {/* Age and Sex Row */}
              <div className="rb-responsive-grid">
                <Input
                  label="Age *"
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={profileData.age}
                  onChange={handleProfileChange}
                  min="10"
                  max="120"
                  required
                />
                <div className="rb-input-wrapper">
                  <label className="rb-input-label">Sex *</label>
                  <select
                    name="sex"
                    value={profileData.sex}
                    onChange={handleProfileChange}
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
                  value={profileData.heightCm}
                  onChange={handleProfileChange}
                  min="50"
                  max="300"
                  required
                />
                <Input
                  label="Current Weight (kg) *"
                  type="number"
                  name="currentWeightKg"
                  placeholder="Weight"
                  value={profileData.currentWeightKg}
                  onChange={handleProfileChange}
                  min="20"
                  max="500"
                  required
                />
              </div>

              {/* Target Weight */}
              <Input
                label="Target Weight (kg)"
                type="number"
                name="targetWeightKg"
                placeholder="Target Weight"
                value={profileData.targetWeightKg || ""}
                onChange={handleProfileChange}
                min="20"
                max="500"
              />

              {/* Goal Select */}
              <div className="rb-input-wrapper">
                <label className="rb-input-label">Goal *</label>
                <select
                  name="goal"
                  value={profileData.goal}
                  onChange={handleProfileChange}
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
                  value={profileData.activityLevel}
                  onChange={handleProfileChange}
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
                  value={profileData.primaryDietaryStyle}
                  onChange={handleProfileChange}
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
                  value={profileData.allergiesText}
                  onChange={handleProfileChange}
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
                  value={profileData.dislikedFoodsText}
                  onChange={handleProfileChange}
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" disabled={profileLoading} style={{ minWidth: '180px', fontWeight: 600 }}>
                  {profileLoading ? "Calculating Targets..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </Card>

          {/* SECTION 3: Account Settings & Security */}
          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card header={<h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--text-h)" }}>🔒 Account Security & Credentials</h2>}>
              
              {accountSuccess && (
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid var(--primary)", padding: "0.875rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", color: "var(--primary-hover)", fontWeight: 600, fontSize: "0.85rem" }}>
                  ✓ {accountSuccess}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={accountData.username}
                  onChange={handleAccountChange}
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={accountData.email}
                  onChange={handleAccountChange}
                  disabled
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={accountData.phone}
                  onChange={handleAccountChange}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', borderTop: '1px dashed var(--border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--text-h)' }}>Change Password</h3>
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <Button type="submit" variant="primary" disabled={accountLoading} style={{ minWidth: '180px' }}>
                  {accountLoading ? "Saving Changes..." : "Save Account Data"}
                </Button>
              </div>
            </Card>
          </form>

        </div>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;