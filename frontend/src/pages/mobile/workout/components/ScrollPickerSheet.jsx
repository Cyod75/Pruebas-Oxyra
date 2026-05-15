import React, { useRef, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ScrollPickerSheet({ open, onOpenChange, title, initialValue, options, onSave, suffix = "" }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const selectedValueRef = useRef(initialValue);
  const [activeItem, setActiveItem] = useState(initialValue);

  // CONFIGURACIÓN (Ajustada para mayor suavidad)
  const ITEM_HEIGHT = 50;       
  const VISIBLE_ITEMS = 5;      
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 250px
  const PADDING_Y = (CONTAINER_HEIGHT / 2) - (ITEM_HEIGHT / 2);

  // Inicialización
  useEffect(() => {
    if (open && scrollRef.current) {
      const index = options.findIndex(opt => opt == initialValue);
      const safeIndex = index === -1 ? 0 : index;
      
      setActiveItem(options[safeIndex]);
      selectedValueRef.current = options[safeIndex];

      const scrollPos = safeIndex * ITEM_HEIGHT;
      
      setTimeout(() => {
         if(scrollRef.current) scrollRef.current.scrollTo({ top: scrollPos, behavior: 'instant' });
      }, 0);
    }
  }, [open, initialValue, options]);

  const handleScroll = () => {
      if(!scrollRef.current) return;
      
      const scrollTop = scrollRef.current.scrollTop;
      const centerIndex = Math.floor((scrollTop + (ITEM_HEIGHT / 2)) / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(centerIndex, options.length - 1));
      
      const newValue = options[clampedIndex];
      selectedValueRef.current = newValue;

      if (newValue !== activeItem) {
        setActiveItem(newValue);
      }
  };

  const handleConfirm = () => {
    onSave(selectedValueRef.current);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[32px] bg-black border-t border-white/10 pb-8 focus:outline-none ring-0 px-0">
        
        <SheetHeader className="mb-4 pt-2 text-center">
          <SheetTitle className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{title}</SheetTitle>
        </SheetHeader>

        {/* CONTENEDOR RUEDA */}
        <div 
            className="relative w-full overflow-hidden"
            style={{ height: CONTAINER_HEIGHT }}
        >
            {/* DEGRADADOS SUAVES */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* LISTA SCROLLABLE */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative z-0"
                style={{ paddingBlock: PADDING_Y }}
            >
                {options.map((val) => {
                    const isActive = val === activeItem;
                    return (
                        <div 
                            key={val}
                            className="snap-center flex items-center justify-center transition-all duration-300 ease-out cursor-pointer"
                            style={{ height: ITEM_HEIGHT }}
                            onClick={(e) => {
                               e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                        >
                            <span 
                                className={`flex items-baseline gap-1 transition-all duration-300 ${
                                    isActive 
                                    ? "text-white text-3xl font-semibold opacity-100 scale-100" // ACTIVO: Blanco puro, tamaño natural
                                    : "text-zinc-500 text-2xl font-normal opacity-40 scale-95" // INACTIVO: Gris, ligeramente más pequeño
                                }`}
                            >
                                {val} 
                                <span className={`text-base font-normal transition-colors duration-300 ${isActive ? "text-zinc-400" : "text-zinc-700"}`}>
                                    {suffix}
                                </span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="px-6 mt-4">
            <Button 
                onClick={handleConfirm} 
                className="w-full h-14 font-bold rounded-2xl text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
            >
                {t("common.confirm")}
            </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}