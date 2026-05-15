import React, { useState, useEffect } from "react";
import { API_URL } from "../../config/api";

const StatCard = ({ label, value, sub, icon, accent = "blue" }) => {
  const accents = {
    blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   glow: "shadow-blue-500/10" },
    amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  glow: "shadow-amber-500/10" },
    emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",glow: "shadow-emerald-500/10" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/10" },
    rose:   { bg: "bg-rose-500/10",   border: "border-rose-500/20",   text: "text-rose-400",   glow: "shadow-rose-500/10" },
  };
  const c = accents[accent] || accents.blue;
  return (
    <div className={`relative bg-zinc-900/40 border ${c.border} rounded-[28px] p-6 flex flex-col gap-4 overflow-hidden group hover:bg-zinc-900/60 transition-all duration-300 shadow-lg ${c.glow}`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 ${c.bg} rounded-2xl border ${c.border}`}>
          <div className={c.text}>{icon}</div>
        </div>
        {sub && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">{sub}</span>}
      </div>
      <div>
        <p className="text-4xl font-black text-white tracking-tight">{value ?? <span className="opacity-20">—</span>}</p>
        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${c.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none`} />
    </div>
  );
};

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 6 ? "Buenas noches" : hour < 14 ? "Buenos días" : hour < 21 ? "Buenas tardes" : "Buenas noches";

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-24 bg-zinc-900/40 rounded-[28px]" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-zinc-900/30 rounded-[28px]" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hero Greeting */}
      <div className="bg-gradient-to-br from-blue-600/10 via-zinc-900/30 to-zinc-900/0 border border-blue-500/10 rounded-[32px] p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{greeting},</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-1">
            {userData.username} <span className={userData.rol === 'superadmin' ? 'text-amber-500' : 'text-blue-500'}>✦</span>
          </h1>
          <p className="text-zinc-600 text-sm font-bold mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className={`px-5 py-3 rounded-2xl border font-black text-sm uppercase tracking-widest ${
          userData.rol === 'superadmin'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {userData.rol}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Usuarios Totales" value={stats?.totalUsers} sub="plataforma" accent="blue"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" /></svg>}
        />
        <StatCard label="Nuevos esta semana" value={stats?.newUsersThisWeek} sub="+7 días" accent="emerald"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.18.16.207.1.46.17.739.17.28 0 .533-.07.74-.17.065-.05.127-.105.18-.16A2.5 2.5 0 0 1 8 8a2.5 2.5 0 0 1 .33.62Z" /><path fillRule="evenodd" d="M9.99 2A8 8 0 1 0 17.99 10a8 8 0 0 0-8-8Zm.01 12.5a.75.75 0 0 1-.75-.75v-.3c-.9-.13-1.73-.53-2.31-1.15a.75.75 0 0 1 1.1-1.02c.33.35.84.59 1.44.66V9.23a3.875 3.875 0 0 1-1.547-.606A2.25 2.25 0 0 1 7.5 7a2.5 2.5 0 0 1 1.75-2.372v-.128a.75.75 0 0 1 1.5 0v.257c.77.15 1.45.52 1.94 1.05a.75.75 0 1 1-1.1 1.02 1.83 1.83 0 0 0-1.09-.53v2.36a3.85 3.85 0 0 1 1.6.634 2.29 2.29 0 0 1 .85 1.79 2.29 2.29 0 0 1-.85 1.79c-.5.37-1.06.59-1.6.68v.15a.75.75 0 0 1-.75.75Z" clipRule="evenodd" /></svg>}
        />
        <StatCard label="Ejercicios Catálogo" value={stats?.totalExercises} sub="base de datos" accent="purple"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10Z" /></svg>}
        />
        <StatCard label="Entrenos Guardados" value={stats?.totalWorkouts} sub="histórico" accent="amber"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /></svg>}
        />
        <StatCard label="Entrenos Hoy" value={stats?.workoutsToday} sub="hoy" accent="rose"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12Z" /><path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" /></svg>}
        />
        <StatCard label="Staff Admin" value={stats?.totalAdmins} sub="privilegiados" accent="amber"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[28px] p-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-5">🏆 Usuarios Más Activos</h3>
          <div className="space-y-3">
            {stats?.topUsers?.map((u, i) => (
              <div key={u.username} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : 'text-zinc-600'}`}>#{i+1}</span>
                <img
                  src={u.foto_perfil?.startsWith('http') ? u.foto_perfil : `${API_URL}/${u.foto_perfil}`}
                  alt={u.username}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-800"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${u.username}&background=111&color=fff&bold=true`; }}
                />
                <span className="text-sm font-bold text-zinc-200 flex-1">@{u.username}</span>
                <span className="text-xs font-black text-zinc-500">{u.total_workouts} entrenos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[28px] p-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-5">🆕 Últimos Registros</h3>
          <div className="space-y-3">
            {stats?.recentUsers?.map((u) => (
              <div key={u.username} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.rol === 'admin' || u.rol === 'superadmin' ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                <span className="text-sm font-bold text-zinc-200 flex-1 truncate">@{u.username}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${u.rol === 'superadmin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : u.rol === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{u.rol}</span>
                <span className="text-[10px] text-zinc-600 font-bold">{new Date(u.created_at).toLocaleDateString('es-ES')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
