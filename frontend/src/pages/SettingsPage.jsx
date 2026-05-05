import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function SettingsPage() {
  const [accountData, setAccountData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-h)" }}>
            Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Manage your account preferences and security.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card header={<h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-h)" }}>Account Settings</h2>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={accountData.username}
                onChange={handleAccountChange}
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={accountData.email}
                onChange={handleAccountChange}
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={accountData.phone}
                onChange={handleAccountChange}
              />
            </div>
          </Card>

          <Card header={<h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-h)" }}>Change Password</h2>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
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
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="submit" variant="primary" disabled={loading} style={{ minWidth: '150px' }}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;