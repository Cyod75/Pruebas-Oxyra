import React from "react";
import { IconCheck, IconTrash } from "../../../../components/icons/Icons";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function SetRow({ setNumber, setData, onWeightClick, onRepsClick, onCheck, onDelete }) {
  
  // Clases dinámicas según estado
  const rowBgClass = setData.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-card border-border/50';
  
  // Framer Motion: Valores para el gesto de arrastre
  const x = useMotionValue(0);
  // El fondo rojo se vuelve más opaco cuanto más arrastras
  const backgroundOpacity = useTransform(x, [0, 100], [0, 1]);
  
  // Umbral para considerar que se quiere borrar
  const deleteThreshold = 100; 

  const handleDragEnd = () => {
    if (x.get() > deleteThreshold) {
      // Si se arrastró lo suficiente a la derecha, ejecutar borrar
      onDelete();
    }
    // Resetear posición (si no se borró o mientras se borra)
    x.set(0);
  };

  return (
    // Contenedor relativo para el efecto de capas
    <div className="relative overflow-hidden rounded-xl mb-3">
        
        {/* CAPA FONDO (ROJO - BORRAR) */}
        {/* Solo visible si la serie NO está completada */}
        {!setData.completed && (
            <motion.div 
                className="absolute inset-0 bg-red-500 flex items-center justify-start pl-6 z-0"
                style={{ opacity: backgroundOpacity }}
            >
                <IconTrash className="w-6 h-6 text-white" />
            </motion.div>
        )}

        {/* CAPA FRONTAL (CONTENIDO DE LA SERIE) - ARRASTRABLE */}
        <motion.div
            drag={!setData.completed ? "x" : false} // Solo arrastrable si no está completada
            dragConstraints={{ left: 0, right: 0 }} // Restricciones elásticas
            dragElastic={{ right: 0.5, left: 0.1 }} // Más elástico hacia la derecha (borrar)
            onDragEnd={handleDragEnd}
            style={{ x, touchAction: "pan-y" }} // touchAction importante para que no bloquee el scroll vertical
            className={`relative z-10 grid grid-cols-[40px_1fr_1fr_40px] gap-3 items-center py-3 px-3 border transition-all duration-300 rounded-xl ${rowBgClass}`}
        >
            
            {/* Columna 1: Número de Serie (Limpio, sin iconos) */}
            <div className="flex items-center justify-center h-full font-bold text-sm text-muted-foreground">
               {setNumber}
            </div>

            {/* Columna 2: Peso (Botón Selector) */}
            <div 
                onClick={!setData.completed ? onWeightClick : undefined}
                className={`h-10 flex items-center justify-center rounded-lg font-bold text-lg cursor-pointer transition-colors ${
                    setData.completed ? 'opacity-100 text-green-600' : 'bg-secondary/40 hover:bg-secondary/60'
                }`}
            >
                {setData.weight ? setData.weight : <span className="text-muted-foreground/30 text-sm">-</span>}
            </div>

            {/* Columna 3: Reps (Botón Selector) */}
            <div 
                 onClick={!setData.completed ? onRepsClick : undefined}
                 className={`h-10 flex items-center justify-center rounded-lg font-bold text-lg cursor-pointer transition-colors ${
                    setData.completed ? 'opacity-100 text-green-600' : 'bg-secondary/40 hover:bg-secondary/60'
                }`}
            >
                {setData.reps ? setData.reps : <span className="text-muted-foreground/30 text-sm">-</span>}
            </div>

            {/* Columna 4: Checkbox */}
            <div className="flex justify-center">
                <button
                    onClick={onCheck}
                    // Detenemos la propagación para que el click en el check no interfiera con el drag
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                        setData.completed 
                        ? 'bg-green-500 text-white scale-105 shadow-green-500/20' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border/30'
                    }`}
                >
                    <IconCheck className="w-5 h-5" strokeWidth={3} />
                </button>
            </div>
        </motion.div>
    </div>
  );
}