import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ModernLoader({ text = "PREPARANDO TIENDA..." }) {
  const { isDark } = useTheme();
  const rgbBase = isDark ? "255, 255, 255" : "30, 30, 35";

  return (
    <div className="flex flex-col items-center justify-center pt-24 fixed inset-0 overflow-hidden bg-background/50 backdrop-blur-md z-[9999] transition-colors duration-500 touch-none">
      <style>{`
        :root {
            /* Tamaño grande para impacto */
            --cube-size: 45px;
            --gap: 10px;
            --duration: 2.5s;
        }

        .loader-assembly {
            position: relative;
            width: 0; 
            height: 0;
            transform-style: preserve-3d;
            animation: assemblyRotate 10s linear infinite;
            /* Asegura que la animación esté centrada verticalmente antes del margen del texto */
            margin-bottom: 50px; 
        }

        .cube-wrapper {
            position: absolute;
            transform-style: preserve-3d;
            animation: expandContract var(--duration) ease-in-out infinite;
        }

        .tl { --x: -1; --y: -1; }
        .tr { --x:  1; --y: -1; }
        .bl { --x: -1; --y:  1; }
        .br { --x:  1; --y:  1; }

        .cube {
            width: var(--cube-size);
            height: var(--cube-size);
            margin-left: calc(var(--cube-size) / -2);
            margin-top: calc(var(--cube-size) / -2);
            transform-style: preserve-3d;
            animation: spinCube var(--duration) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Estilos de cristal dinámicos */
        .face {
            position: absolute;
            width: 100%;
            height: 100%;
            /* Relleno muy sutil */
            background: rgba(${rgbBase}, 0.03);
            /* Borde más definido */
            border: 1px solid rgba(${rgbBase}, 0.7);
            /* Brillo exterior e interior para efecto 3D premium */
            box-shadow: 0 0 20px rgba(${rgbBase}, 0.1), inset 0 0 15px rgba(${rgbBase}, 0.05);
            backface-visibility: visible;
            transition: all 0.5s ease;
        }

        .front  { transform: rotateY(0deg) translateZ(calc(var(--cube-size)/2)); }
        .back   { transform: rotateY(180deg) translateZ(calc(var(--cube-size)/2)); }
        .right  { transform: rotateY(90deg) translateZ(calc(var(--cube-size)/2)); }
        .left   { transform: rotateY(-90deg) translateZ(calc(var(--cube-size)/2)); }
        .top    { transform: rotateX(90deg) translateZ(calc(var(--cube-size)/2)); }
        .bottom { transform: rotateX(-90deg) translateZ(calc(var(--cube-size)/2)); }

        @keyframes assemblyRotate {
            0%   { transform: rotateX(25deg) rotateY(0deg); }
            100% { transform: rotateX(25deg) rotateY(360deg); }
        }

        @keyframes expandContract {
            0%, 100% {
                transform: translate(
                    calc(var(--x) * (var(--cube-size) / 2 + 2px)), 
                    calc(var(--y) * (var(--cube-size) / 2 + 2px))
                );
            }
            50% {
                /* Expansión máxima */
                transform: translate(
                    calc(var(--x) * (var(--cube-size) + var(--gap) + 5px)), 
                    calc(var(--y) * (var(--cube-size) + var(--gap) + 5px))
                );
            }
        }

        @keyframes spinCube {
            0%, 100% { transform: rotateX(0deg) rotateY(0deg); }
            50%      { transform: rotateX(90deg) rotateY(90deg); }
        }
      `}</style>

      <div className="loader-assembly">
        <div className="cube-wrapper tl"><div className="cube"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div></div></div>
        <div className="cube-wrapper tr"><div className="cube"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div></div></div>
        <div className="cube-wrapper bl"><div className="cube"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div></div></div>
        <div className="cube-wrapper br"><div className="cube"><div className="face front"></div><div className="face back"></div><div className="face right"></div><div className="face left"></div><div className="face top"></div><div className="face bottom"></div></div></div>
      </div>

      {text && (
        <p className="mt-24 text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase animate-pulse text-center px-4">
          {text}
        </p>
      )}
    </div>
  );
}