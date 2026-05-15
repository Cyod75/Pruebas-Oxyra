import React from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import logoWhite from "../assets/images/oxyra-white.png";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    label: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Usuarios",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
      </svg>
    ),
  },
  {
    to: "/admin/exercises",
    label: "Ejercicios",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
  {
    to: "/admin/logs",
    label: "Logs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER TOP BAR ===== */}
      <header 
        className="border-b border-white/5 bg-zinc-950/90 backdrop-blur-2xl sticky top-0 z-[100]"
        style={{ paddingTop: 'var(--safe-area-top)' }}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <img src={logoWhite} alt="Oxyra" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-tight">Oxyra <span className="text-blue-500">Admin</span></span>
              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.15em] font-black">Sistema de Control</p> 
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border border-blue-600/20"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User badge + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${userData.rol === 'superadmin' ? 'bg-amber-500' : 'bg-blue-500'} animate-pulse`} />
              <span className="text-xs font-black text-zinc-400">{userData.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 transition-all text-zinc-500 hover:text-red-400"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.068a.75.75 0 1 0-1.064-1.056l-2.5 2.551a.75.75 0 0 0 0 1.05l2.5 2.55a.75.75 0 1 0 1.064-1.056l-1.048-1.068h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl border-t border-white/5"
        style={{ paddingBottom: 'var(--safe-area-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? "text-blue-400" : "text-zinc-600 hover:text-zinc-400"
                }`
              }
            >
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
