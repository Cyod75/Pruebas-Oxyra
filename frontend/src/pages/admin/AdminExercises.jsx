import React, { useState, useEffect } from "react";
import { API_URL } from "../../config/api";
import { oxyConfirm } from "../../utils/customAlert";

const VALID_MUSCLES = [
  'Pecho','Espalda Alta','Espalda Media','Espalda Baja','Hombro',
  'Cuadriceps','Femoral','Gluteo','Gemelo','Aductores',
  'Bíceps','Tríceps','Antebrazo','Trapecio','Abdomen','General'
];

const MUSCLE_COLORS = {
  'Pecho':        'bg-red-500/10 text-red-400 border-red-500/20',
  'Espalda Alta': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Espalda Media':'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Espalda Baja': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Hombro':       'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Cuadriceps':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Femoral':      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Gluteo':       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Gemelo':       'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Aductores':    'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Bíceps':       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Tríceps':      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Antebrazo':    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Trapecio':     'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Abdomen':      'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'General':      'bg-zinc-700/30 text-zinc-400 border-zinc-700',
};

const emptyForm = { nombre: '', grupo_muscular: 'General', descripcion: '', equipamiento: '' };

export default function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchExercises = async () => {
    try {
      const r = await fetch(`${API_URL}/api/admin/exercises`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (r.ok) setExercises(data.exercises || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExercises(); }, []);

  const handleEdit = (ex) => {
    setForm({ nombre: ex.nombre, grupo_muscular: ex.grupo_muscular, descripcion: ex.descripcion || '', equipamiento: ex.equipamiento || '' });
    setEditingId(ex.idEjercicio);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const url = editingId ? `${API_URL}/api/admin/exercises/${editingId}` : `${API_URL}/api/admin/exercises`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      showToast(editingId ? 'Ejercicio actualizado' : `"${form.nombre}" añadido al catálogo`, 'success');
      handleCancel();
      fetchExercises();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (ex) => {
    if (!(await oxyConfirm(`¿Eliminar "${ex.nombre}" del catálogo? Esto puede afectar rutinas existentes.`))) return;
    setActionLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/admin/exercises/${ex.idEjercicio}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      showToast(`"${ex.nombre}" eliminado del catálogo`, 'warning');
      fetchExercises();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setActionLoading(false); }
  };

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.nombre.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = filterMuscle ? ex.grupo_muscular === filterMuscle : true;
    return matchSearch && matchMuscle;
  });

  // Group by muscle
  const grouped = filtered.reduce((acc, ex) => {
    const g = ex.grupo_muscular || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(ex);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
          toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
          'bg-red-500/10 border-red-500/30 text-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="font-black text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Catálogo de Ejercicios</h2>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-1">{exercises.length} ejercicios · {Object.keys(grouped).length} grupos activos</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (editingId) handleCancel(); else setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black rounded-2xl hover:bg-zinc-100 transition-all text-sm shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          Nuevo Ejercicio
        </button>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 md:p-8 ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white">{editingId ? '✏️ Editar Ejercicio' : '➕ Añadir al Catálogo'}</h3>
            <button onClick={handleCancel} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Nombre del Ejercicio *</label>
              <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Ej. Press de banca con barra" maxLength={80}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-white placeholder-zinc-700 focus:outline-none transition-all"
              />
            </div>
            {/* Grupo Muscular */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Grupo Muscular *</label>
              <select required value={form.grupo_muscular} onChange={e => setForm({...form, grupo_muscular: e.target.value})}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none transition-all appearance-none cursor-pointer"
                style={{colorScheme: 'dark'}}
              >
                {VALID_MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {/* Equipamiento */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Equipamiento</label>
              <input value={form.equipamiento} onChange={e => setForm({...form, equipamiento: e.target.value})}
                placeholder="Ej. Barra, Mancuernas, Máquina..." maxLength={60}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-white placeholder-zinc-700 focus:outline-none transition-all"
              />
            </div>
            {/* Descripción */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Descripción / Instrucciones</label>
              <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Describe la técnica correcta del ejercicio..." rows={3} maxLength={500}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-white placeholder-zinc-700 focus:outline-none transition-all resize-none"
              />
            </div>
            {/* Actions */}
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={handleCancel}
                className="px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-black text-sm transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={actionLoading}
                className="px-8 py-3 rounded-2xl bg-white text-black font-black text-sm hover:bg-zinc-100 transition-all disabled:opacity-50 flex items-center gap-2">
                {actionLoading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                {editingId ? 'Guardar Cambios' : 'Añadir Ejercicio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-blue-700/50 transition-all"
          />
        </div>
        <select value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-blue-700/50 transition-all appearance-none cursor-pointer sm:w-48"
          style={{colorScheme: 'dark'}}
        >
          <option value="">Todos los grupos</option>
          {VALID_MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4,6,7].map(i => <div key={i} className="h-20 bg-zinc-900/30 rounded-[22px]" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped).sort().map(muscle => (
            <div key={muscle}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${MUSCLE_COLORS[muscle] || MUSCLE_COLORS.General}`}>
                  {muscle}
                </span>
                <div className="h-px flex-1 bg-zinc-900" />
                <span className="text-[10px] text-zinc-600 font-black">{grouped[muscle].length} ejercicios</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped[muscle].map(ex => (
                  <div key={ex.idEjercicio}
                    className="group flex items-center gap-4 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-700/50 rounded-[22px] px-5 py-4 transition-all duration-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-zinc-100 group-hover:text-white truncate">{ex.nombre}</p>
                      {ex.equipamiento && <p className="text-[10px] text-zinc-600 font-bold mt-0.5 truncate">{ex.equipamiento}</p>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                      <button onClick={() => handleEdit(ex)}
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-all" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(ex)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1a2.75 2.75 0 0 0-2.75 2.75v1.25H3a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5h-3V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 13a.75.75 0 0 0 .75-.75V8.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75Z" clipRule="evenodd" />
                          <path d="M3.5 6.5h13v10.75a2.75 2.75 0 0 1-2.75 2.75H6.25a2.75 2.75 0 0 1-2.75-2.75V6.5Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">No se encontraron ejercicios</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
