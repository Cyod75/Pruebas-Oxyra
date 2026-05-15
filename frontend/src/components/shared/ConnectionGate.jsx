import React from "react";
import { useConnection } from "../../context/ConnectionContext";
import ModernLoader from "./ModernLoader";
import ConnectionErrorScreen from "./ConnectionErrorScreen";

/**
 * ConnectionGate
 * ---------------
 * Wrapper que envuelve el contenido de la app y gestiona los tres estados:
 *
 *  1. "checking" (fase inicial) → Muestra el ModernLoader animado.
 *  2. "offline"                 → Muestra la pantalla de error de conexión (cubre todo).
 *  3. "online"                  → Renderiza los children normalmente.
 *
 * IMPORTANTE:
 *  - El ModernLoader SOLO se muestra en la carga inicial (cuando status === "checking"
 *    Y aún no hemos determinado el primer estado).
 *  - Si estando "online" se pierde la conexión → status pasa a "offline" → se muestra
 *    ConnectionErrorScreen sin pasar por el loader.
 */
export default function ConnectionGate({ children }) {
  const { status } = useConnection();

  if (status === "checking") {
    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background">
        <ModernLoader text="CONECTANDO CON OXYRA..." />
      </div>
    );
  }

  if (status === "offline") {
    return <ConnectionErrorScreen />;
  }

  // status === "online"
  return <>{children}</>;
}
