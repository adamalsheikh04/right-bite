import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MealWizardPage from "./pages/MealWizardPage";
import WeeklyPlanPage from "./pages/WeeklyPlanPage";
import PlanHistoryPage from "./pages/PlanHistoryPage";
import GroceryPage from "./pages/GroceryPage";
import LogMealPage from "./pages/LogMealPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
        <Route path="/meal-wizard" element={<ProtectedRoute><MealWizardPage /></ProtectedRoute>} />
        <Route path="/weekly-plan" element={<ProtectedRoute><WeeklyPlanPage /></ProtectedRoute>} />
        <Route path="/plan-history" element={<ProtectedRoute><PlanHistoryPage /></ProtectedRoute>} />
        <Route path="/groceries" element={<ProtectedRoute><GroceryPage /></ProtectedRoute>} />
        <Route path="/log-meal" element={<ProtectedRoute><LogMealPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;