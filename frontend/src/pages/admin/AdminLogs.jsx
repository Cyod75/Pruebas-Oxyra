import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../../config/api";
import { oxyConfirm } from "../../utils/customAlert";

const LEVEL_CONFIG = {
  success: { label: 'Éxito',    dot: 'bg-emerald-500', card: 'border-emerald-500/10 hover:border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  info:    { label: 'Info',     dot: 'bg-blue-500',    card: 'border-blue-500/10 hover:border-blue-500/20',    text: 'text-blue-400',    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  warning: { label: 'Aviso',   dot: 'bg-amber-500',   card: 'border-amber-500/10 hover:border-amber-500/20',   text: 'text-amber-400',   badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  error:   { label: 'Error',   dot: 'bg-red-500',     card: 'border-red-500/10 hover:border-red-500/20',       text: 'text-red-400',     badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
};

const CAT_CONFIG = {
  users:     { label: 'Usuarios',   icon: '👤' },
  exercises: { label: 'Ejercicios', icon: '🏋️' },
  auth:      { label: 'Auth',       icon: '🔐' },
  system:    { label: 'Sistema',    icon: '⚙️' },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [clearing, setClearing] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isSuperAdmin = userData.rol === 'superadmin';

  const token = localStorage.getItem("authToken");

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({ limit: 150 });
    if (levelFilter) params.set('level', levelFilter);
    if (catFilter) params.set('category', catFilter);
    try {
      const r = await fetch(`${API_URL}/api/admin/logs?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const data = await r.json();
        setLogs(data);
        setLastRefresh(new Date());
      }
    } catch { }
    finally { setLoading(false); }
  }, [levelFilter, catFilter, token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleClear = async () => {
    if (!(await oxyConfirm('¿Limpiar TODOS los logs del sistema? Esta acción no se puede deshacer.'))) return;
    setClearing(true);
    try {
      const r = await fetch(`${API_URL}/api/admin/logs`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) await fetchLogs();
    } catch { }
    finally { setClearing(false); }
  };

  const counts = logs.reduce((acc, l) => { acc[l.level] = (acc[l.level] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Logs del Sistema</h2>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-1">
            {logs.length} entradas · Memoria en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            {autoRefresh ? 'Live' : 'Pausado'}
          </button>
          <button onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Refrescar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
            </svg>
          </button>
          {isSuperAdmin && (
            <button onClick={handleClear} disabled={clearing}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-black transition-all disabled:opacity-50 flex items-center gap-2">
              {clearing ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : null}
              Limpiar Logs
            </button>
          )}
        </div>
      </div>

      {/* Level counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setLevelFilter(l => l === key ? '' : key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              levelFilter === key ? cfg.badge + ' ring-1 ring-inset ring-white/10' : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700'
            }`}>
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs font-black text-zinc-300">{cfg.label}</span>
            <span className={`ml-auto text-sm font-black ${cfg.text}`}>{counts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Categoría:</span>
          {[['', 'Todas'], ...Object.entries(CAT_CONFIG).map(([k, v]) => [k, `${v.icon} ${v.label}`])].map(([key, label]) => (
            <button key={key} onClick={() => setCatFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                catFilter === key
                  ? 'bg-blue-600/15 border-blue-600/30 text-blue-400'
                  : 'border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700'
              }`}>
              {label}
            </button>
          ))}
        </div>
        {lastRefresh && (
          <span className="text-[10px] text-zinc-700 font-bold ml-auto self-center">
            Actualizado {lastRefresh.toLocaleTimeString('es-ES')}
          </span>
        )}
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-zinc-900/30 rounded-2xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Sin registros por el momento</p>
          <p className="text-zinc-700 text-xs mt-2">Las acciones del sistema apareceran aquí en tiempo real</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
            const cat = CAT_CONFIG[log.category] || { label: log.category, icon: '📌' };
            const time = new Date(log.timestamp);
            return (
              <div key={log.id}
                className={`group flex items-start gap-4 px-5 py-4 bg-zinc-900/20 border ${cfg.card} rounded-2xl transition-all duration-200 hover:bg-zinc-900/40`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-100 leading-snug">{log.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${cfg.badge}`}>{cfg.label}</span>
                    <span className="text-[9px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">{cat.icon} {cat.label}</span>
                    {log.user && log.user !== 'system' && (
                      <span className="text-[9px] font-black text-zinc-600">por @{log.user}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-[10px] font-black text-zinc-600">{time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  <p className="text-[9px] text-zinc-700 mt-0.5">{time.toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
