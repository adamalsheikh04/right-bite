import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import logo from "../assets/logo.png";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Registered successfully");
      login(data.data.user, data.data.token);
      navigate("/settings");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  const cardHeader = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "0.5rem" }}>
      <img 
        src={logo} 
        alt="Right Bite Logo" 
        style={{ 
          width: "5.5rem", 
          height: "5.5rem", 
          objectFit: "contain", 
          marginBottom: "0.75rem"
        }} 
      />
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.03em" }}>
        Right<span style={{ color: "var(--text-h)" }}>Bite</span>
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
        Start your personalized nutrition journey today
      </p>
    </div>
  );

  return (
    <AuthLayout>
      <Card header={cardHeader}>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth style={{ marginTop: '0.5rem' }}>
            Create Account
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Already have an account? </span>
          <Link to="/" style={{ fontWeight: 500 }}>
            Log in
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}

export default RegisterPage;