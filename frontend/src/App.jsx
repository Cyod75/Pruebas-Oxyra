import { Routes, Route, Navigate } from "react-router-dom";

// --- Layouts ---
import MobileView from "./views/MobileView";
import DesktopView from "./views/DesktopView";

// --- Components Shared ---
import ProtectedRoute from "./components/shared/ProtectedRoute";

// --- Auth Pages ---
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// --- Onboarding ---
import OnboardingPage from "./pages/onboarding/OnboardingPage";

import RoutineDetail from "./pages/mobile/workout/RoutineDetail";
import WorkoutSessionPage from "./pages/mobile/workout/WorkoutSessionPage";
import PersonalDataPage from "./pages/mobile/PersonalDataPage";
import EditProfilePage from "./pages/mobile/EditProfilePage";

// --- Mobile Pages ---
import MobileTraining from "./pages/mobile/MobileTraining";
import MobileProducts from "./pages/mobile/MobileProducts";
import MobileStatistics from "./pages/mobile/MobileStatistics";
import MobileProfile from "./pages/mobile/MobileProfile";
import MobileSettings from "./pages/mobile/MobileSettings";
import MobileSearch from "./pages/mobile/MobileSearch";
import MobilePublicProfile from "./pages/mobile/MobilePublicProfile";
import UserConnectionsPage from "./pages/mobile/social/UserConnectionsPage";

// --- Admin Pages ---
import AdminLayout from "./views/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminLogs from "./pages/admin/AdminLogs";

function App() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isAdmin = userData.rol === 'admin' || userData.rol === 'superadmin';

  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* --- RUTA ONBOARDING (protegida: requiere login, solo si NO completado) --- */}
      <Route element={<ProtectedRoute adminOnly={false} onboardingRoute={true} />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* --- RUTAS PROTEGIDAS ADMIN --- */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>
      </Route>

      {/* --- RUTAS PROTEGIDAS USUARIO --- */}
      <Route element={<ProtectedRoute adminOnly={false} />}>
        <Route path="/" element={
          <DesktopView>
            <MobileView />
          </DesktopView>
        }>
          <Route index element={<MobileTraining />} />
          <Route path="products" element={<MobileProducts />} />
          <Route path="stats" element={<MobileStatistics />} />
          <Route path="profile" element={<MobileProfile />} />
          <Route path="search" element={<MobileSearch />} />
          <Route path="profile/:username" element={<MobilePublicProfile />} />
          <Route path="profile/:username/followers" element={<UserConnectionsPage type="followers" />} />
          <Route path="profile/:username/following" element={<UserConnectionsPage type="following" />} />
          <Route path="settings" element={<MobileSettings />} />

          {/* Rutas que antes estaban fuera del layout principal */}
          <Route path="routine/:id" element={<RoutineDetail />} />
          <Route path="workout/session/:routineId" element={<WorkoutSessionPage />} />
          <Route path="settings/personal-data" element={<PersonalDataPage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to={isAdmin ? "/admin" : "/"} />} />
    </Routes>
  );
}

export default App;
