import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/config/api";
import { IconLoader, IconTrophy } from "@/components/icons/Icons";
import Podium from "./components/Podium";
import LeaderboardItem from "./components/LeaderboardItem";
import EmptyLeaderboard from "./components/EmptyLeaderboard";

export default function LeaderboardTab({ onSwitchToExplore }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showStickyUser, setShowStickyUser] = useState(false);

  const currentUserRowRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Obtener el ID del usuario actual
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCurrentUserId(data.idUsuario);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchMe();
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/api/users/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al cargar leaderboard");
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Observer para detectar si la fila del usuario actual es visible
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    // Si NO es visible y el usuario está en posición #4+, mostrar sticky
    setShowStickyUser(!entry.isIntersecting);
  }, []);

  useEffect(() => {
    if (!currentUserRowRef.current) return;
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1
    });
    observer.observe(currentUserRowRef.current);
    return () => observer.disconnect();
  }, [leaderboard, currentUserId, handleIntersection]);

  // --- ESTADOS ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <IconLoader className="animate-spin text-primary h-8 w-8" />
        <p className="text-xs font-medium text-muted-foreground animate-pulse">
          Cargando ranking...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-6">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground">Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  // Solo el usuario (sin amigos mutuos)
  if (leaderboard.length <= 1) {
    return <EmptyLeaderboard onSwitchToExplore={onSwitchToExplore} />;
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const currentUser = leaderboard.find(u => u.idUsuario === currentUserId);
  const currentUserPosition = leaderboard.findIndex(u => u.idUsuario === currentUserId) + 1;

  return (
    <div className="flex flex-col h-full relative">
      {/* Header decorativo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 py-3 px-4"
      >
        <IconTrophy className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Ranking de Amigos
        </p>
        <IconTrophy className="h-4 w-4 text-amber-400" />
      </motion.div>

      {/* Podio Top 3 */}
      <Podium top3={top3} />

      {/* Separador */}
      {rest.length > 0 && (
        <div className="mx-6 border-t border-zinc-800/60 my-1" />
      )}

      {/* Lista del resto */}
      <ScrollArea className="flex-1" ref={scrollContainerRef}>
        <div className="pb-20">
          {rest.map((user, idx) => {
            const position = idx + 4;
            const isMe = user.idUsuario === currentUserId;
            return (
              <div
                key={user.idUsuario}
                ref={isMe ? currentUserRowRef : undefined}
              >
                <LeaderboardItem
                  user={user}
                  position={position}
                  isCurrentUser={isMe}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Sticky User Bar: aparece cuando el usuario actual no es visible */}
      <AnimatePresence>
        {showStickyUser && currentUser && currentUserPosition > 3 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-16 left-0 right-0 z-40 mx-2"
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-lg shadow-primary/10">
              <LeaderboardItem
                user={currentUser}
                position={currentUserPosition}
                isCurrentUser={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
