import React from 'react';

export default function SettingsSection({ title, children }) {
  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">
        {title}
      </h3>
      {/* Contenedor estilo Card flotante */}
      <div className="border border-border/40 rounded-2xl bg-card overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}