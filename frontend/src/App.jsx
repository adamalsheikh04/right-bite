import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MealWizardPage from "./pages/MealWizardPage";
import WeeklyPlanPage from "./pages/WeeklyPlanPage";
import GroceryPage from "./pages/GroceryPage";
import LogMealPage from "./pages/LogMealPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/meal-wizard" element={<MealWizardPage />} />
        <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
        <Route path="/groceries" element={<GroceryPage />} />
        <Route path="/log-meal" element={<LogMealPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;