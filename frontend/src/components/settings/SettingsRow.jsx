import React from 'react';
import { IconChevronRight } from "../icons/Icons"; 

export default function SettingsRow({ 
  icon, 
  label, 
  sub, 
  right, 
  onClick, 
  className = "", 
  iconClass = "bg-secondary text-foreground", 
  isDestructive = false 
}) {
  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-border/40 last:border-0
        ${isDestructive ? "hover:bg-red-500/5 text-red-500" : "hover:bg-muted/50"}
        ${className}
      `}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-2 rounded-lg shrink-0 aspect-square flex items-center justify-center ${isDestructive ? "bg-red-500/10 text-red-500" : iconClass}`}>
           {/* Mantenemos h-5 w-5 para el icono interno */}
           {icon && React.cloneElement(icon, { className: "h-5 w-5" })}
        </div>
        
        <div className="flex flex-col truncate pr-2">
          <span className="font-medium text-sm truncate">{label}</span>
          {sub && <span className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</span>}
        </div>
      </div>

      <div className="shrink-0">
        {right ? right : <IconChevronRight className="h-4 w-4 text-muted-foreground/50" />}
      </div>
    </div>
  );
}