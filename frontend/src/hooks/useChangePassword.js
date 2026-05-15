import { useState, useEffect } from "react";
import { API_URL } from '../config/api';
export const useChangePassword = (onSuccess) => {
    const [passForm, setPassForm] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // NUEVO: Estado para mensajes visuales (null, 'error', 'success')
    const [status, setStatus] = useState({ type: null, message: "" });
    const [loading, setLoading] = useState(false);

    // Limpiar errores cuando el usuario empieza a escribir de nuevo
    useEffect(() => {
        if (status.type) setStatus({ type: null, message: "" });
    }, [passForm]);

    const toggleShow = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const submitPasswordChange = async () => {
        // Reiniciamos estado
        setStatus({ type: null, message: "" });

        // 1. Validaciones
        if (!passForm.current || !passForm.new || !passForm.confirm) {
            setStatus({ type: "error", message: "Por favor completa todos los campos." });
            return;
        }
        if (passForm.new !== passForm.confirm) {
            setStatus({ type: "error", message: "La nueva contraseña no coincide con la confirmación." });
            return;
        }
        if (passForm.new.length < 6) {
            setStatus({ type: "error", message: "La contraseña debe tener al menos 6 caracteres." });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_URL}/api/users/change-password`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    currentPassword: passForm.current,
                    newPassword: passForm.new
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Error que viene del backend (ej: contraseña actual incorrecta)
                setStatus({ type: "error", message: data.error || "Error al cambiar contraseña" });
            } else {
                // Éxito
                setStatus({ type: "success", message: "¡Contraseña actualizada correctamente!" });
                setPassForm({ current: "", new: "", confirm: "" });
                
                // Opcional: Cerrar el modal después de 1.5 segundos para que lean el mensaje verde
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    setStatus({ type: null, message: "" }); // Limpiar para la próxima
                }, 1500);
            }

        } catch (err) {
            console.error(err);
            setStatus({ type: "error", message: "Error de conexión con el servidor." });
        } finally {
            setLoading(false);
        }
    };

    return {
        passForm,
        setPassForm,
        showPass,
        toggleShow,
        loading,
        status, // <--- Exportamos el estado del mensaje
        submitPasswordChange
    };
};