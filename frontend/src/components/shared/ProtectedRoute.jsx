import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ adminOnly = false, onboardingRoute = false }) {
  const token = localStorage.getItem("authToken");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const location = useLocation();

  // 1. Verificar autenticación básica
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    return <Navigate to="/welcome" replace />;
  }

  const isAdmin = userData.rol === 'admin' || userData.rol === 'superadmin';
  const onboardingCompleted = !!userData.onboarding_completed;

  // 2. Si es ruta del onboarding en sí
  if (onboardingRoute) {
    // Si ya completó el onboarding, no puede volver a verlo
    if (onboardingCompleted) return <Navigate to="/" replace />;
    // Si aún no lo completó, dejarlo pasar
    return <Outlet />;
  }

  // 3. Si la ruta es SOLO para admin y el usuario NO es admin -> Redirigir al home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Si el usuario ES admin PERO intenta entrar a una ruta de usuario normal
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // 5. Usuario normal — verificar si completó el onboarding
  // Excepto si ya estamos en /onboarding (evitar bucles)
  if (!isAdmin && !onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}