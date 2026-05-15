import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { API_URL } from "../config/api";

/**
 * ConnectionContext — versión simplificada
 * ----------------------------------------
 * Estados:
 *  - "checking"  → Health-check inicial o al pulsar "Reintentar"
 *  - "online"    → Backend responde correctamente
 *  - "offline"   → Error de red detectado (por fetch fallido o health-check)
 *
 * Reglas clave:
 *  - Cuando todo va bien NO hay ningún polling ni intervalo activo.
 *  - El auto-retry SOLO se activa cuando status === "offline".
 *  - El usuario detiene el auto-retry simplemente pulsando "Reintentar"
 *    (que hace un check inmediato y limpia el intervalo).
 */

const ConnectionContext = createContext(null);

const RETRY_INTERVAL  = 8000; // auto-retry cada 8 s, solo en estado offline
const HEALTH_ENDPOINT = `${API_URL}/api/health`;
const HEALTH_TIMEOUT  = 5000;

async function checkBackendReachable() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);
  try {
    const res = await fetch(HEALTH_ENDPOINT, {
      method: "GET",
      signal: controller.signal,
      cache:  "no-store",
    });
    clearTimeout(timer);
    // 2xx-4xx = el servidor responde (aunque sea 401/403, significa que está vivo)
    return res.status < 500;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

export function ConnectionProvider({ children }) {
  const [status, setStatus] = useState("checking");
  const retryTimerRef = useRef(null);
  const isMounted     = useRef(true);

  // Limpia el intervalo de retry
  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // Arranca el intervalo de retry — solo se llama cuando status pasa a "offline"
  const startRetry = useCallback(() => {
    clearRetry(); // evita duplicados
    retryTimerRef.current = setInterval(async () => {
      const ok = await checkBackendReachable();
      if (!isMounted.current) return;
      if (ok) {
        setStatus("online");
        clearRetry(); // ← para el intervalo en cuanto hay conexión
      }
    }, RETRY_INTERVAL);
  }, [clearRetry]);

  // Health-check único (inicial o manual). NO inicializa ningún intervalo si ok.
  const runCheck = useCallback(async () => {
    const ok = await checkBackendReachable();
    if (!isMounted.current) return;
    if (ok) {
      setStatus("online");
      clearRetry();
    } else {
      setStatus("offline");
      startRetry(); // solo aquí empieza el polling
    }
  }, [clearRetry, startRetry]);

  // Solo un check al montar. Si tiene éxito: sin polling. Si falla: arranca retry.
  useEffect(() => {
    isMounted.current = true;
    runCheck();
    return () => {
      isMounted.current = false;
      clearRetry();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * retryManually — botón "Reintentar" de ConnectionErrorScreen.
   * Para el intervalo, muestra "checking" y hace un check inmediato.
   */
  const retryManually = useCallback(() => {
    clearRetry();
    setStatus("checking");
    runCheck();
  }, [clearRetry, runCheck]);

  /**
   * reportError — llamado por las páginas cuando un fetch falla.
   * Si todavía no estamos en offline, activa la pantalla y el retry.
   */
  const reportError = useCallback(() => {
    setStatus(prev => {
      if (prev !== "offline") {
        startRetry();
        return "offline";
      }
      return prev;
    });
  }, [startRetry]);

  return (
    <ConnectionContext.Provider value={{ status, retryManually, reportError }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection debe usarse dentro de ConnectionProvider");
  return ctx;
}
