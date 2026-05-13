import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MealWizardPage from "./pages/MealWizardPage";
import WeeklyPlanPage from "./pages/WeeklyPlanPage";
import PlanHistoryPage from "./pages/PlanHistoryPage";
import GroceryPage from "./pages/GroceryPage";
import LogMealPage from "./pages/LogMealPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
<<<<<<< HEAD
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/meal-wizard" element={<MealWizardPage />} />
        <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
        <Route path="/groceries" element={<GroceryPage />} />
        <Route path="/log-meal" element={<LogMealPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
=======
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/meal-wizard" element={<ProtectedRoute><MealWizardPage /></ProtectedRoute>} />
        <Route path="/weekly-plan" element={<ProtectedRoute><WeeklyPlanPage /></ProtectedRoute>} />
        <Route path="/plan-history" element={<ProtectedRoute><PlanHistoryPage /></ProtectedRoute>} />
        <Route path="/groceries" element={<ProtectedRoute><GroceryPage /></ProtectedRoute>} />
        <Route path="/log-meal" element={<ProtectedRoute><LogMealPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
>>>>>>> 1315923189aa35117d277d46e10b2880fdf7d10b
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;