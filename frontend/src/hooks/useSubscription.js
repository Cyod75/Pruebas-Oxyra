import { useState, useEffect } from "react";
import { API_URL } from '../config/api';

export const useSubscription = () => {
    const [isPro, setIsPro] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        try {
            const res = await fetch(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            const isUserPro = data.es_pro === 1;
            setIsPro(isUserPro);
            
            if (isUserPro && data.fecha_fin_suscripcion) {
                const end = new Date(data.fecha_fin_suscripcion);
                const now = new Date();
                const diffTime = end - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                setDaysLeft(diffDays > 0 ? diffDays : 0);
            } else {
                setDaysLeft(0);
            }
        } catch (err) {
            console.error("Error fetching sub status", err);
        }
    };

    const handleSubscribe = async (paymentData, onSuccess) => {
        setLoading(true);
        // Simulamos validación (2s)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_URL}/api/users/subscribe`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({}) 
            });

            if (res.ok) {
                await fetchStatus(); 
                if (onSuccess) onSuccess();
            } else {
                throw new Error("Error en el pago");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (onSuccess) => {
        // NOTA: Hemos quitado el confirm() nativo de aquí.
        // La confirmación visual se hará en el componente.

        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${API_URL}/api/users/cancel-subscription`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchStatus();
                if (onSuccess) onSuccess(); // Callback para cerrar el popup si es necesario
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        isPro,
        daysLeft,
        loading,
        handleSubscribe,
        handleCancel
    };
};