import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconBackArrow } from "../icons/Icons"; 

export default function BackButton({ fallbackPath = "/", className = "", ...props }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Lógica: Si hay historial (idx > 0), vuelve atrás. Si no, va al fallback.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleBack} 
      className={`hover:bg-muted/50 -ml-2 ${className}`} // Mantenemos tus estilos base
      {...props} 
    >
      <IconBackArrow className="h-6 w-6" />
    </Button>
  );
}