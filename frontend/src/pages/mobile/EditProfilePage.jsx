import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconLoader, IconCheck, IconX } from "../../components/icons/Icons"; 
import { API_URL } from '../../config/api';
import DefaultAvatar from "../../components/DefaultAvatar";

export default function EditProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Username availability state
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null | true | false
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const originalUsername = useRef(""); // para no verificar si no cambió
  
  const BIO_LIMIT = 150;
  
  const [editForm, setEditForm] = useState({ 
      nombre: "", 
      username: "",
      biografia: "",
      genero: "M", 
      peso: "", 
      altura: "", 
      file: null 
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Debounce username check — igual que en Register
  useEffect(() => {
    // Si el usuario no cambió, no hace falta verificar
    if (editForm.username === originalUsername.current) {
      setUsernameAvailable(null);
      return;
    }
    
    if (editForm.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username/${editForm.username}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch (err) {
        console.error("Error checking username", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editForm.username]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        originalUsername.current = data.username || "";
        setEditForm({
            nombre: data.nombre_completo || "",
            username: data.username || "",
            biografia: data.biografia || "",
            genero: data.genero || "M",
            peso: data.peso_kg || "",
            altura: data.estatura_cm || "",
            file: null
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (isSubmitting) return;
    setErrorMsg("");
    
    if (!editForm.nombre.trim()) { 
        setErrorMsg(t("profile.edit.name_required")); 
        return; 
    }

    // Bloquear si el username está en uso
    if (usernameAvailable === false) {
      setErrorMsg(t("auth.register.username_taken"));
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("nombre_completo", editForm.nombre);
    formData.append("username", editForm.username);
    
    // Formatear numéricos de forma segura al enviarlos al backend para evitar ERROR 500
    const pesoVal = parseFloat(String(editForm.peso).replace(',', '.')) || 0;
    const alturaVal = parseInt(editForm.altura, 10) || 0;
    formData.append("peso_kg", pesoVal);
    formData.append("estatura_cm", alturaVal);
    
    formData.append("genero", editForm.genero);
    formData.append("biografia", editForm.biografia);

    if (editForm.file) {
        formData.append("foto", editForm.file);
    }

    try {
        const res = await fetch(`${API_URL}/api/users/update`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData 
        });

        if (res.ok) {
            navigate("/profile");
        } else { 
            const errorData = await res.json().catch(() => ({}));
            setErrorMsg(errorData.error || t("profile.edit.error_updating"));
        }
    } catch (err) { 
        // Si NGINX da 413, bloquea la petición sin headers CORS, haciendo que Fetch crashee y caiga aquí.
        // Si el archivo adjuntado en state pesaba más de 1MB, esta es probablemente la causa.
        if (editForm.file && editForm.file.size > 1024 * 1024) {
            setErrorMsg(t("profile.edit.error_image_size"));
        } else {
            setErrorMsg(t("profile.edit.error_connection"));
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file) { 
        setErrorMsg("");
        
        // 1. Seguridad: Solo aceptar imágenes
        if (!file.type.startsWith("image/")) {
            setErrorMsg(t("profile.edit.error_image_format"));
            return;
        }

        // 2. Seguridad: Límite de Peso Visual (2 Megabytes)
        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setErrorMsg(t("profile.edit.error_image_limit", { max: MAX_SIZE_MB }));
            return;
        }

        setEditForm(p => ({...p, file})); 
        setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-background flex items-center justify-center"><IconLoader className="animate-spin w-8 h-8 text-muted-foreground" /></div>;
  }

  // Icono de disponibilidad de username (igual que en Register)
  const UsernameStatusIcon = () => {
    if (editForm.username === originalUsername.current) return null;
    if (editForm.username.length < 3) return null;
    if (isCheckingUsername) return <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin shrink-0" />;
    if (usernameAvailable === true) return <IconCheck className="w-4 h-4 text-green-500 shrink-0" />;
    if (usernameAvailable === false) return <IconX className="w-4 h-4 text-red-500 shrink-0" />;
    return null;
  };

  const renderStepper = (value, onChange, step = 1, isFloat = false) => {
    const handleDecrement = () => {
      const current = parseFloat(String(value).replace(',', '.')) || 0;
      onChange(Math.max(0, current - step).toFixed(isFloat ? 1 : 0));
    };
    
    const handleIncrement = () => {
      const current = parseFloat(String(value).replace(',', '.')) || 0;
      onChange((current + step).toFixed(isFloat ? 1 : 0));
    };

    return (
      <div className="flex flex-1 items-center justify-end gap-3">
         <button onClick={handleDecrement} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/30 text-muted-foreground hover:bg-secondary transition-colors text-lg font-medium leading-none pb-0.5 active:scale-95">-</button>
         <div className="w-14 text-center">
            <span className="font-semibold text-sm">
                {i18n.language === 'es' ? String(value).replace('.', ',') : String(value)}
            </span>
         </div>
         <button onClick={handleIncrement} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/30 text-muted-foreground hover:bg-secondary transition-colors text-lg font-medium leading-none pb-0.5 active:scale-95">+</button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col animate-in fade-in duration-300">
      
      {/* HEADER SUPERIOR */}
      <div className="fixed top-0 w-full z-50 flex items-center justify-between px-4 bg-background/90 backdrop-blur-md border-b border-border/40" 
           style={{
             paddingTop: "var(--safe-area-top)",
             height: "calc(3.5rem + var(--safe-area-top))"
           }}>
        <button 
           onClick={() => navigate("/profile")}
           className="text-foreground text-sm font-medium px-2 py-1 hover:opacity-70 transition-opacity active:scale-95"
        >
           {t("profile.edit.cancel")}
        </button>
        <h1 className="text-base font-bold tracking-tight">{t("profile.edit.title")}</h1>
        <button 
           onClick={handleSaveChanges}
           disabled={isSubmitting || usernameAvailable === false}
           className="text-blue-500 text-sm font-bold px-2 py-1 hover:opacity-70 transition-opacity active:scale-95 disabled:opacity-50"
        >
           {isSubmitting ? <IconLoader className="animate-spin w-4 h-4 inline-block" /> : t("profile.edit.done")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: "calc(3.5rem + var(--safe-area-top))" }}>
         
         {/* AVATAR */}
         <div className="flex flex-col items-center mt-6 mb-8">
            <DefaultAvatar
                userId={userData?.idUsuario ?? userData?.username}
                name={editForm.nombre || userData?.nombre_completo}
                src={previewUrl || userData?.foto_perfil}
                size="h-28 w-28"
                className="border border-border/40 shadow-sm mb-4"
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button 
               onClick={() => fileInputRef.current.click()}
               className="text-blue-500 text-[14px] font-semibold hover:text-blue-400 active:scale-95 transition-all px-3 py-1 bg-blue-500/10 rounded-full"
            >
               {t("profile.edit.change_photo")}
            </button>
         </div>

         {/* MENSAJE DE ERROR */}
         {errorMsg && (
            <div className="px-5 mb-4">
               <p className="text-red-500 text-[13px] text-center font-medium bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{errorMsg}</p>
            </div>
         )}
         
         {/* FORMULARIO */}
         <div className="px-4">
             <div className="bg-secondary/10 border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                
                {/* Campo: Nombre */}
                <div className="flex items-center px-4 py-3 border-b border-border/40 min-h-[50px]">
                   <label className="w-[100px] text-foreground font-semibold text-[14px] shrink-0">
                      {t("profile.edit.name_label")}
                   </label>
                   <div className="flex-1 min-w-0">
                       <input 
                          type="text" 
                          maxLength={30}
                          value={editForm.nombre}
                          onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                          placeholder={t("profile.edit.name_placeholder")}
                          className="w-full bg-transparent border-none text-[15px] placeholder:text-muted-foreground outline-none text-right pb-0.5"
                       />
                   </div>
                </div>

                {/* Campo: Usuario (username) */}
                <div className="flex flex-col border-b border-border/40">
                   <div className="flex items-center px-4 py-3 min-h-[50px]">
                      <label className="w-[100px] text-foreground font-semibold text-[14px] shrink-0">
                         {t("profile.edit.username_label")}
                      </label>
                      <div className="flex flex-1 items-center justify-end gap-2 min-w-0 overflow-hidden">
                         <UsernameStatusIcon />
                         <input 
                            type="text"
                            maxLength={30}
                            autoCapitalize="none"
                            autoCorrect="off"
                            value={editForm.username}
                            onChange={e => {
                              setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s/g, "")});
                              setErrorMsg("");
                            }}
                            placeholder={t("profile.edit.username_placeholder")}
                            className={`bg-transparent border-none text-[15px] placeholder:text-muted-foreground outline-none text-right pb-0.5 min-w-0 flex-1 truncate ${usernameAvailable === false && editForm.username !== originalUsername.current ? 'text-red-500' : ''}`}
                         />
                      </div>
                   </div>
                  {/* Mensaje de error unicamente, sin redundancia de tick de exito */}
                  {usernameAvailable === false && editForm.username !== originalUsername.current && (
                    <p className="text-[12.5px] text-red-500 text-right px-4 pb-2.5 -mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                      {t("auth.register.username_taken")}
                    </p>
                  )}
                </div>

                {/* Campo: Presentación */}
                <div className="flex px-4 py-3 border-b border-border/40 min-h-[50px]">
                   <label className="w-[105px] text-foreground font-semibold text-[14px] shrink-0 pt-0.5">
                      {t("profile.edit.bio_label")}
                   </label>
                   <div className="flex-1 flex flex-col items-end">
                       <textarea 
                          value={editForm.biografia}
                          onChange={e => {
                             if (e.target.value.length <= BIO_LIMIT) {
                                setEditForm({...editForm, biografia: e.target.value});
                             }
                          }}
                          placeholder={t("profile.edit.bio_placeholder")}
                          className="w-full bg-transparent border-none text-[14px] placeholder:text-muted-foreground outline-none resize-none min-h-[60px] text-right py-0.5 leading-relaxed"
                       />
                       <span className={`text-[10px] uppercase tracking-wider font-bold mt-1.5 transition-colors ${editForm.biografia.length >= BIO_LIMIT ? 'text-red-500' : 'text-muted-foreground/40'}`}>
                           {editForm.biografia.length} / {BIO_LIMIT}
                       </span>
                   </div>
                </div>

                {/* Campo: Género */}
                <div className="flex items-center px-4 py-3 border-b border-border/40 min-h-[50px]">
                   <label className="w-[105px] text-foreground font-semibold text-[14px] shrink-0">
                      {t("profile.edit.gender_label")}
                   </label>
                   <span className="flex-1 text-[15px] text-muted-foreground text-right select-none cursor-default">
                      {editForm.genero === 'M' ? t("profile.edit.male") : editForm.genero === 'F' ? t("profile.edit.female") : t("profile.edit.other")}
                   </span>
                </div>

                {/* Campo: Peso */}
                <div className="flex items-center px-4 py-1.5 border-b border-border/40 min-h-[50px]">
                   <label className="w-[105px] text-foreground font-semibold text-[14px] shrink-0">
                      {t("profile.edit.weight_label")}
                   </label>
                   {renderStepper(editForm.peso, (val) => setEditForm({...editForm, peso: val}), 1, true)}
                </div>

                {/* Campo: Altura */}
                <div className="flex items-center px-4 py-1.5 min-h-[50px]">
                   <label className="w-[105px] text-foreground font-semibold text-[14px] shrink-0">
                      {t("profile.edit.height_label")}
                   </label>
                   {renderStepper(editForm.altura, (val) => setEditForm({...editForm, altura: val}), 1, false)}
                </div>
                
             </div>
         </div>
      </div>
    </div>
  );
}

