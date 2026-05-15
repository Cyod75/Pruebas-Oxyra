import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserListItem from "../../components/shared/UserListItem";
import BackButton from "../../components/shared/BackButton";
import LeaderboardTab from "./social/LeaderboardTab";
import { API_URL } from "../../config/api";
import { IconSearch, IconLoader, IconX, IconUser, IconTrophy } from "../../components/icons/Icons";

// Hook para debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MobileSearch() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("explorar");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus al cambiar a la pestaña Explorar
  useEffect(() => {
    if (activeTab === "explorar" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/users/search?query=${debouncedQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const handleSwitchToExplore = () => {
    setActiveTab("explorar");
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground animate-in fade-in duration-300">
      
      {/* --- HEADER STICKY --- */}
      <div
        className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 pb-0 px-4"
        style={{ paddingTop: 'calc(1rem + var(--safe-area-top))' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <BackButton className="shrink-0" />
          <h1 className="text-lg font-bold flex-1">{t("search.community")}</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-zinc-900/80 h-10 p-1 rounded-xl">
            <TabsTrigger 
              value="explorar" 
              className="flex-1 rounded-lg text-xs font-bold data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1.5 transition-all"
            >
              <IconSearch className="h-3.5 w-3.5" />
              {t("search.explore")}
            </TabsTrigger>
            <TabsTrigger 
              value="ranking" 
              className="flex-1 rounded-lg text-xs font-bold data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1.5 transition-all"
            >
              <IconTrophy className="h-3.5 w-3.5" />
              {t("search.ranking")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Barra de búsqueda - solo visible en tab Explorar */}
        <AnimatePresence>
          {activeTab === "explorar" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-3">
                <div className="relative group">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-4 w-4 transition-colors group-focus-within:text-primary" />
                  <Input 
                    ref={inputRef}
                    placeholder={t("search.search_placeholder")} 
                    className="pl-10 pr-10 h-11 rounded-2xl bg-secondary/50 border-transparent focus-visible:bg-secondary focus-visible:ring-1 focus-visible:ring-primary/30 transition-all text-base shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query.length > 0 && (
                    <button 
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-foreground/10 text-muted-foreground hover:bg-foreground/20 active:scale-95 transition-all"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "ranking" && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <LeaderboardTab onSwitchToExplore={handleSwitchToExplore} />
            </motion.div>
          )}

          {activeTab === "explorar" && (
            <motion.div
              key="explorar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ScrollArea className="h-full w-full">
                <div className="px-4 py-4 min-h-[calc(100vh-200px)]">
                  
                  {/* ESTADO: CARGANDO */}
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-70">
                      <IconLoader className="animate-spin text-primary h-8 w-8" />
                      <p className="text-xs font-medium text-muted-foreground animate-pulse">{t("search.searching")}</p>
                    </div>
                  )}

                  {/* ESTADO: SIN BÚSQUEDA (INICIAL) */}
                  {!loading && query.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 select-none">
                      <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4 border border-border">
                        <IconSearch className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold">{t("search.discover_community")}</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        {t("search.discover_desc")}
                      </p>
                    </div>
                  )}

                  {/* ESTADO: SIN RESULTADOS */}
                  {!loading && results.length === 0 && query.length > 1 && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
                      <IconUser className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{t("search.not_found", { query })}</p>
                      <p className="text-xs text-muted-foreground">{t("search.try_another")}</p>
                    </div>
                  )}

                  {/* LISTA DE RESULTADOS */}
                  <div className="space-y-3">
                    {results.length > 0 && (
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-1">
                        {t("search.results")}
                      </p>
                    )}
                    {results.map((user) => (
                      <div key={user.idUsuario} className="animate-in slide-in-from-bottom-2 duration-300">
                        <UserListItem user={user} />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}