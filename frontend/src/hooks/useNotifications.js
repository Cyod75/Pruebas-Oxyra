import { useState, useEffect } from "react";
import { API_URL } from '../config/api';

export const useNotifications = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    // Cargar estado inicial al entrar a la app
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/users/notifications/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setNotificationsEnabled(data.enabled);
        } catch (err) {
            console.error("Error cargando notificaciones", err);
        }
    };

    // Función para activar/desactivar
    const toggleNotifications = async (newState) => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${API_URL}/api/users/notifications/toggle`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ enabled: newState })
            });

            if (res.ok) {
                setNotificationsEnabled(newState);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        notificationsEnabled,
        loading,
        toggleNotifications
    };
};