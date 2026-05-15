import React, { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  IconPlus,
  IconSparkles,
  IconLoader,
  IconDumbbell,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from "../../components/icons/Icons";
import RoutineCard from "../../components/settings/RoutineCard";
import AIRoutineWizardSheet from "../../components/settings/sheets/AIRoutineWizardSheet";
import CreateManualRoutineSheet from "../../components/settings/sheets/CreateManualRoutineSheet";
import SubscriptionSheet from "../../components/settings/sheets/SubscriptionSheet";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { useSubscription } from "../../hooks/useSubscription";
import ModernLoader from "../../components/shared/ModernLoader";
import { useConnection } from "../../context/ConnectionContext";
import { oxyAlert } from "../../utils/customAlert";

// --- COMPONENTE SORTABLE (Drag & Drop Individual) ---
const SortableItem = ({ item, onDelete, onRename, onStart, onClick }) => {
  const controls = useDragControls();

  // Preparamos datos visuales
  const displayRoutine = {
    nombre_rutina: item.nombre || item.nombre_rutina,
    nivel: item.nivel_dificultad || item.nivel,
    dias: item.dias || [],
    creada_por_ia: item.creada_por_ia,
  };

  return (
    <Reorder.Item
      value={item}
      layout // Ayuda a Framer a calcular mejor el espacio
      dragListener={false}
      dragControls={controls}
      // CORRECCIÓN CLAVE: Eliminado 'transition-transform' y 'active:z-10'
      // 'transition-transform' causaba el conflicto con las físicas de Framer
      className="relative z-0 list-none mb-4 rounded-[26px]" 
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 100,
        // Añadimos sombra para dar sensación de elevación y evitar que visualmente se "pegue"
        // Redujimos la opacidad en light mode para que la sombra sea más sutil
        boxShadow: "0px 12px 24px -10px rgba(0,0,0,0.15)" 
      }}
      transition={{
        // Ajuste de transición para que el reordenamiento de las OTRAS cartas sea suave
        type: "spring",
        damping: 25,
        stiffness: 300
      }}
    >
      <RoutineCard
        routine={displayRoutine}
        onClick={onClick}
        onStart={onStart}
        onDelete={onDelete}
        onRename={onRename}
        dragControls={controls}
      />
    </Reorder.Item>
  );
};

export default function MobileTraining() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Clave para LocalStorage
  const ROUTINE_ORDER_KEY = "user_routine_order";

  // Estados UI
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [isManualSheetOpen, setIsManualSheetOpen] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(true);

  // Estados Rename
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [newName, setNewName] = useState("");
  const [renamingLoading, setRenamingLoading] = useState(false);

  // Datos
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { reportError } = useConnection();

  const {
    isPro,
    daysLeft,
    loading: subLoading,
    handleSubscribe,
    handleCancel,
  } = useSubscription();

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/routines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Error fetching routines");

      let data = await res.json();

      // --- APLICAR ORDEN GUARDADO (LOCAL STORAGE) ---
      const savedOrder = JSON.parse(
        localStorage.getItem(ROUTINE_ORDER_KEY) || "[]",
      );

      if (savedOrder.length > 0) {
        const orderMap = new Map(savedOrder.map((id, index) => [id, index]));

        data.sort((a, b) => {
          // Obtenemos índice guardado o -1 si es nueva
          const indexA = orderMap.has(a.idRutina)
            ? orderMap.get(a.idRutina)
            : -1;
          const indexB = orderMap.has(b.idRutina)
            ? orderMap.get(b.idRutina)
            : -1;

          // 1. Si ambas tienen orden, respetar el guardado
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;

          // 2. Si una es nueva (no tiene orden), ponerla AL PRINCIPIO para que se vea
          if (indexA === -1) return -1;
          if (indexB === -1) return 1;

          return 0;
        });
      }

      setRoutines(data);
      // 2. ÉXITO: Quitamos el loading solo si todo fue bien
      setLoading(false);

    } catch (error) {
      console.error("Error cargando rutinas:", error);
      // Notificamos al sistema global de conexión
      reportError();
    }
  };

  const handleNewRoutine = (newRoutine) => {
    // Al añadir, ponemos la nueva al principio
    const newRoutinesList = [newRoutine, ...routines];
    setRoutines(newRoutinesList);
    // Y actualizamos el orden en LocalStorage inmediatamente
    localStorage.setItem(
      ROUTINE_ORDER_KEY,
      JSON.stringify(newRoutinesList.map((r) => r.idRutina)),
    );
  };

  // --- REORDER & GUARDAR EN LOCAL STORAGE ---
  const handleReorder = (newOrder) => {
    setRoutines(newOrder);

    // Guardamos solo los IDs en el orden actual
    const orderIds = newOrder.map((r) => r.idRutina);
    localStorage.setItem(ROUTINE_ORDER_KEY, JSON.stringify(orderIds));
  };

  const handleDeleteRoutine = async (idRutina) => {
    try {
      const token = localStorage.getItem("authToken");

      // Optimistic Delete
      const updatedRoutines = routines.filter((r) => r.idRutina !== idRutina);
      setRoutines(updatedRoutines);

      // Actualizar LocalStorage también al borrar para mantenerlo limpio
      localStorage.setItem(
        ROUTINE_ORDER_KEY,
        JSON.stringify(updatedRoutines.map((r) => r.idRutina)),
      );

      const res = await fetch(`${API_URL}/api/users/routine/${idRutina}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) fetchRoutines(); // Revertir si falla
    } catch (error) {
      console.error(error);
      fetchRoutines();
    }
  };

  // --- LÓGICA RENOMBRAR ---
  const openRenameModal = (rutina) => {
    setSelectedRoutine(rutina);
    setNewName(rutina.nombre || rutina.nombre_rutina);
    setRenameModalOpen(true);
  };

  const handleSaveRename = async () => {
    if (!newName.trim()) return;
    setRenamingLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_URL}/api/users/routine/${selectedRoutine.idRutina}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre: newName }),
        },
      );

      if (res.ok) {
        setRoutines((prev) =>
          prev.map((r) =>
            r.idRutina === selectedRoutine.idRutina
              ? { ...r, nombre: newName, nombre_rutina: newName }
              : r,
          ),
        );
        setRenameModalOpen(false);
      } else {
        await oxyAlert(t("training.rename_error"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRenamingLoading(false);
    }
  };

  const handleOpenAI = () => {
    if (subLoading) return;
    isPro ? setIsAiSheetOpen(true) : setShowSubscription(true);
  };

  // BLOQUEO DE SEGURIDAD
  if (loading) {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center">
              <ModernLoader text={t("training.preparing")} />
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-5 bg-background relative animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1 text-foreground tracking-tight pl-1">
          {t("training.title")}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm font-medium opacity-70 pl-1">
          {t("training.subtitle")}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleOpenAI}
            className="relative overflow-hidden h-36 rounded-[28px] p-5 flex flex-col justify-between text-left border border-blue-500/10 bg-gradient-to-br from-blue-500/5 via-background to-background hover:border-blue-500/30 group shadow-sm transition-all active:scale-[0.98]"
          >
            {/* MODIFICADO: self-end para alinearlo a la derecha (igual que la mancuerna) */}
            <div className="self-end text-blue-400 group-hover:text-blue-500 transition-colors">
              <IconSparkles className="w-10 h-10" strokeWidth={1.5} />
            </div>
            
            <div className="relative z-10">
              <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 opacity-80">
                {isPro ? t("training.generative_ai") : t("training.pro_feature")}
              </span>
              <span 
                className="block font-bold text-foreground text-lg leading-none tracking-tight"
                dangerouslySetInnerHTML={{ __html: t("training.create_gemini") }}
              />
            </div>
          </button>
          <button
            onClick={() => setIsManualSheetOpen(true)}
            className="relative overflow-hidden h-36 rounded-[28px] p-5 flex flex-col justify-between text-left bg-secondary/10 border border-border/30 hover:bg-secondary/20 transition-all active:scale-[0.97] shadow-sm"
          >
            <div className="self-end text-muted-foreground/70 group-hover:text-foreground transition-colors">
              <IconDumbbell className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-70">
                {t("training.manual")}
              </span>
              <span 
                className="block font-bold text-foreground/90 text-lg leading-none tracking-tight"
                dangerouslySetInnerHTML={{ __html: t("training.create_empty") }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. LISTA RUTINAS */}
      <div>
        <div
          className="flex items-center gap-2 mb-4 px-1 cursor-pointer select-none group"
          onClick={() => setIsRoutinesExpanded(!isRoutinesExpanded)}
        >
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {t("training.my_routines")}
          </h2>
          <div className=" rounded-md hover:bg-secondary/20 transition-colors text-muted-foreground group-hover:text-foreground">
            {isRoutinesExpanded ? (
              <IconChevronDown className="w-5 h-5" />
            ) : (
              <IconChevronUp className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* NOTA: Eliminado el cargando local aquí porque ahora lo maneja ModernLoader globalmente */}
        <div
            className={`transition-all duration-300 ease-in-out ${isRoutinesExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
        >
            {/* LISTA REORDENABLE */}
            {/* Quitamos el gap del Group y lo ponemos como margin-bottom en el Item para evitar problemas de cálculo de Layout */}
            <Reorder.Group
                axis="y"
                values={routines}
                onReorder={handleReorder}
                className="flex flex-col" 
            >
                {routines.map((rutina) => (
                <SortableItem
                    key={rutina.idRutina}
                    item={rutina}
                    onClick={() => navigate(`/routine/${rutina.idRutina}`)}
                    onStart={() =>
                    navigate(`/workout/session/${rutina.idRutina}`)
                    }
                    onDelete={() => handleDeleteRoutine(rutina.idRutina)}
                    onRename={() => openRenameModal(rutina)}
                />
                ))}
            </Reorder.Group>

            <button
                onClick={() => setIsManualSheetOpen(true)}
                className="w-full h-16 rounded-[20px] border border-dashed border-zinc-300 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-4"
            >
                <IconPlus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
                {t("training.add_workout")}
                </span>
            </button>
        </div>
      </div>

      {/* --- MODAL RENOMBRAR --- */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setRenameModalOpen(false)}
          />
          <div className="relative w-full max-w-[320px] bg-[#121212] border border-white/10 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-full text-center space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {t("training.rename_title")}
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                {t("training.rename_desc")}
              </p>
            </div>
            <div className="w-full relative group">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#1c1c1e] text-center border border-white/5 focus:border-blue-500/50 rounded-2xl px-4 py-4 text-white font-bold text-lg placeholder:text-zinc-600 outline-none transition-all duration-300 shadow-inner"
                placeholder={t("training.rename_placeholder")}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              />
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setRenameModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t("training.cancel")}
              </button>
              <button
                onClick={handleSaveRename}
                disabled={renamingLoading}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {renamingLoading ? (
                  <IconLoader className="animate-spin w-4 h-4" />
                ) : (
                  t("training.save")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheets */}
      <AIRoutineWizardSheet
        open={isAiSheetOpen}
        onOpenChange={setIsAiSheetOpen}
        onRoutineCreated={handleNewRoutine}
        isPro={isPro}
      />
      <CreateManualRoutineSheet
        open={isManualSheetOpen}
        onOpenChange={setIsManualSheetOpen}
        onRoutineCreated={handleNewRoutine}
      />
      <SubscriptionSheet
        open={showSubscription}
        onOpenChange={setShowSubscription}
        isPro={isPro}
        daysLeft={daysLeft}
        loading={subLoading}
        onSubscribe={handleSubscribe}
        onCancel={handleCancel}
      />
    </div>
  );
}