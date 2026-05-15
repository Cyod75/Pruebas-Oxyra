import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../config/api";
import { oxyConfirm } from "../../utils/customAlert";
import { 
  IconUser, IconLock, IconCheck, IconX, IconEye, IconEyeOff 
} from "../../components/icons/Icons";

const RoleSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const roles = [
        { id: 'usuario', label: 'Usuario Estándar', color: 'bg-zinc-800', text: 'text-zinc-400' },
        { id: 'admin', label: 'Administrador', color: 'bg-blue-600', text: 'text-white' }
    ];

    const currentRole = roles.find(r => r.id === value) || roles[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-1.5 flex-1 min-w-[200px]" ref={containerRef}>
            <label className="text-[10px] font-black text-zinc-500 pl-1 uppercase tracking-[0.2em]">Rol del Miembro</label>
            <div className={`relative ${isOpen ? 'z-[200]' : 'z-auto'}`}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl px-5 py-3.5 flex items-center justify-between group h-[52px]"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${currentRole.color} shadow-[0_0_8px_rgba(37,99,235,0.4)]`} />
                        <span className="text-sm font-bold text-zinc-100">{currentRole.label}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-[150] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => {
                                    onChange({ target: { name: 'rol', value: role.id } });
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-zinc-800/80 ${value === role.id ? 'bg-zinc-800' : ''}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${role.color} ${value === role.id ? 'opacity-100' : 'opacity-40'}`} />
                                <span className={`text-sm font-bold ${value === role.id ? 'text-white' : 'text-zinc-500'}`}>{role.label}</span>
                                {value === role.id && <IconCheck className="w-4 h-4 text-blue-500 ml-auto" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FormInput = ({ label, icon, type, name, placeholder, value, onChange, extraProps = {}, rightElement = null }) => (
    <div className="space-y-1.5 flex-1 min-w-[280px]">
        <label className="text-[10px] font-black text-zinc-500 pl-1 uppercase tracking-[0.2em]">{label}</label>
        <div className="group bg-zinc-900/40 border border-zinc-800 focus-within:border-blue-500/50 focus-within:bg-zinc-900/60 transition-all duration-300 rounded-2xl flex items-center pl-4 pr-2 py-3.5 relative shadow-inner">
            <div className="text-zinc-600 group-focus-within:text-blue-500 transition-colors duration-300">
                {icon}
            </div>
            <input 
                type={type} 
                name={name}
                className="bg-transparent border-none text-zinc-100 w-full ml-3 focus:outline-none placeholder-zinc-700 font-bold text-sm h-7"
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                {...extraProps}
            />
            {rightElement && (
                <div className="ml-2 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
    </div>
);

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        nombre_completo: "",
        username: "",
        email: "",
        password: "",
        rol: "usuario"
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al cargar usuarios");
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
        setSuccess("");
    };

    // Crear usuario directamente
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError("");
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/api/admin/users`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al crear usuario");
            
            setSuccess(`¡${formData.username} creado con éxito!`);
            setFormData({ nombre_completo: "", username: "", email: "", password: "", rol: "usuario" });
            fetchUsers();
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!(await oxyConfirm(`¿Seguro que quieres eliminar a ${user.username}? Esta acción es irreversible.`))) return;
        
        setActionLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/api/admin/users/${user.idUsuario}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al eliminar");
            }
            setSuccess("Usuario eliminado correctamente");
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nombre_completo && u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const myId = userData.id;
    const myRole = userData.rol;

    const canDeleteUser = (targetUser) => {
        if (targetUser.idUsuario === myId) return false;
        if (targetUser.rol === 'superadmin') return false;
        if (myRole === 'superadmin') return true;
        if (myRole === 'admin' && targetUser.rol === 'usuario') return true;
        return false;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            
            {/* Notificaciones Flotantes */}
            {(error || success) && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-in border backdrop-blur-xl ${
                    error ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
                    <p className="font-black text-sm tracking-wide">{error || success}</p>
                </div>
            )}

            {/* Header de la Página */}
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl md:text-4xl font-black tracking-tightest text-white">
                    Dashboard <span className="text-blue-600 italic">Control</span>
                </h2>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Panel de Administración Avanzada</p>
                </div>
            </div>

            {/* SECCIÓN CREAR USUARIO */}
            <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-[40px] p-6 md:p-10 backdrop-blur-md relative ring-1 ring-white/5 overflow-hidden">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[22px] shadow-lg shadow-blue-900/20">
                        <IconUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Registrar Miembro</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Acceso manual a la plataforma</p>
                    </div>
                </div>

                    <form onSubmit={handleCreateUser} className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            <FormInput 
                                label="Nombre Real"
                                icon={<IconUser className="w-5 h-5" />}
                                type="text"
                                name="nombre_completo"
                                placeholder="Ej. David de Jesus"
                                value={formData.nombre_completo}
                                onChange={handleFormChange}
                            />
                            <FormInput 
                                label="Identificador"
                                icon={<span className="font-black text-sm">@</span>}
                                type="text"
                                name="username"
                                placeholder="david_fit"
                                value={formData.username}
                                onChange={handleFormChange}
                            />
                            <FormInput 
                                label="Correo Contacto"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>}
                                type="email"
                                name="email"
                                placeholder="david@oxyra.app"
                                value={formData.email}
                                onChange={handleFormChange}
                            />
                            <FormInput 
                                label="Contraseña"
                                icon={<IconLock className="w-5 h-5" />}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Seguridad alta"
                                value={formData.password}
                                onChange={handleFormChange}
                                rightElement={
                                    <button
                                        type="button"
                                        className="p-1 px-2 text-zinc-500 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                    </button>
                                }
                            />
                            
                            <RoleSelect 
                                value={formData.rol}
                                onChange={handleFormChange}
                            />

                            <div className="flex items-end flex-1 min-w-[280px]">
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="w-full bg-white text-black font-black h-[54px] rounded-2xl shadow-xl shadow-white/5 hover:bg-zinc-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {actionLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "REGISTRAR USUARIO"}
                                </button>
                            </div>
                        </div>
                    </form>
            </section>

            {/* LISTADO DE USUARIOS - RESPONSIVE CARDS */}
            <section className="bg-zinc-950/20 border border-zinc-900 rounded-[40px] p-6 md:px-10 md:py-12 relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-white">Explorador</h3>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{users.length} MIEMBROS</span>
                            </div>
                        </div>
                        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Gestión de privacidad y roles</p>
                    </div>

                    <div className="relative group w-full lg:w-96">
                        <input 
                            type="text" 
                            placeholder="Filtrar por nombre, @user o email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-blue-700/50 focus:bg-zinc-900 transition-all shadow-inner placeholder-zinc-700 text-white"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-zinc-900/30 rounded-3xl border border-zinc-800/20" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                        {filteredUsers.map(user => (
                            <div key={user.idUsuario} className="group relative bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-700/50 p-4 md:p-5 rounded-[28px] transition-all duration-300 flex items-center justify-between overflow-hidden shadow-sm">
                                <div className="flex items-center gap-4 relative z-10 w-full pr-12">
                                    {/* Avatar con Indicador */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`absolute -inset-1 rounded-2xl blur-[8px] opacity-0 group-hover:opacity-40 transition-opacity bg-blue-500`} />
                                        <img 
                                            src={user.foto_perfil && user.foto_perfil.startsWith('http') ? user.foto_perfil : `${API_URL}/${user.foto_perfil || 'uploads/default-avatar.png'}`} 
                                            alt={user.username} 
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover ring-2 ring-zinc-800 group-hover:ring-blue-600 transition-all relative z-10"
                                            onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=111&color=fff&bold=true`}}
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-zinc-950 z-20 ${
                                            user.rol === 'superadmin' ? 'bg-amber-500' : user.rol === 'admin' ? 'bg-blue-600' : 'bg-zinc-700'
                                        }`} />
                                    </div>

                                    {/* Info Text */}
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-black text-zinc-100 text-sm md:text-base truncate group-hover:text-white flex items-center gap-2">
                                            {user.nombre_completo || user.username}
                                            {user.rol === 'superadmin' && <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md border border-amber-500/20">ROOT</span>}
                                        </h4>
                                        <p className="text-[11px] text-zinc-500 font-bold tracking-tight">@{user.username}</p>
                                        
                                        <div className="mt-2.5 flex flex-wrap gap-2">
                                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${
                                                user.rol === 'admin' || user.rol === 'superadmin' 
                                                ? 'bg-blue-500/5 border-blue-500/20 text-blue-500' 
                                                : 'bg-zinc-800/40 border-zinc-800/60 text-zinc-500'
                                            }`}>
                                                {user.rol}
                                            </div>
                                            {user.rango_global && user.rango_global !== 'Sin Rango' && (
                                                <div className="px-2 py-0.5 rounded-lg bg-zinc-800/40 border border-zinc-800/60 text-[8px] font-black text-zinc-400">
                                                    {user.rango_global}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Eliminar - Condicional según jerarquía */}
                                {canDeleteUser(user) && (
                                    <button 
                                        onClick={() => handleDeleteUser(user)}
                                        className="absolute right-4 md:right-5 p-2.5 md:p-3 bg-red-500/0 hover:bg-red-500/90 text-red-500 hover:text-white rounded-xl transition-all duration-300 z-20 md:opacity-0 group-hover:opacity-100"
                                        title="Revocar acceso"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.75 1a2.75 2.75 0 0 0-2.75 2.75v1.25H3a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5h-3V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 13a.75.75 0 0 0 .75-.75V8.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75Z" clipRule="evenodd" /><path d="M3.5 6.5h13v10.75a2.75 2.75 0 0 1-2.75 2.75H6.25a2.75 2.75 0 0 1-2.75-2.75V6.5Z" /></svg>
                                    </button>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}

                {filteredUsers.length === 0 && !loading && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                            <IconUser className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">No se encontraron miembros</p>
                    </div>
                )}
            </section>
        </div>
    );
}
