import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      login(data.user, data.token);

      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  const cardHeader = (
    <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌿</div>
      <h1 style={{ fontSize: "1.5rem", color: "var(--text-h)", marginBottom: "0.5rem" }}>
        Welcome back
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
        Log in to continue your nutrition journey
      </p>
    </div>
  );

  return (
    <AuthLayout>
      <Card header={cardHeader}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth style={{ marginTop: '0.5rem' }}>
            Log in
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 500 }}>
            Register
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}

export default LoginPage;