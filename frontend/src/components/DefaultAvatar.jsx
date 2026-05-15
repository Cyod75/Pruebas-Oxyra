import React, { useEffect, useState } from 'react';
import { getColorFromMuscularStats } from '../utils/getUserColor';
import { API_URL } from '../config/api';

/**
 * Extrae las 2 primeras iniciales de un nombre completo o username.
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Mapea clases de contenedor (w-24, w-16, etc.) a tamaños de texto de Tailwind.
 */
function getTextSizeClass(sizeStr) {
  if (sizeStr.includes('w-28') || sizeStr.includes('h-28')) return 'text-4xl';
  if (sizeStr.includes('w-24') || sizeStr.includes('h-24')) return 'text-3xl';
  if (sizeStr.includes('w-20') || sizeStr.includes('h-20')) return 'text-2xl';
  if (sizeStr.includes('w-16') || sizeStr.includes('h-16')) return 'text-xl';
  if (sizeStr.includes('w-14') || sizeStr.includes('h-14')) return 'text-lg';
  if (sizeStr.includes('w-12') || sizeStr.includes('h-12')) return 'text-base';
  if (sizeStr.includes('w-10') || sizeStr.includes('h-10')) return 'text-sm';
  if (sizeStr.includes('w-8') || sizeStr.includes('h-8')) return 'text-xs';
  return 'text-base';
}

export default function DefaultAvatar({
  userId,
  name,          // ← nombre del usuario para extraer iniciales
  size = 'w-16 h-16',
  className = '',
  src,
  style,
  seed,
  muscularStats, // ← array [{ grupo_muscular, rango_actual }] (opcional)
}) {
  const [hasError, setHasError] = useState(false);

  //  Normalizar src 
  const normalizeSrc = (value) => {
    if (!value || typeof value !== 'string') return null;
    const v = value.trim();
    if (!v) return null;
    if (
      v.startsWith('http://') ||
      v.startsWith('https://') ||
      v.startsWith('blob:')   ||
      v.startsWith('data:')
    ) return v;
    return v.startsWith('/') ? `${API_URL}${v}` : `${API_URL}/${v}`;
  };

  const normalizedSrc = normalizeSrc(src);
  const colorSeed     = seed ?? userId ?? 'oxyra-user';

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  const showFallback = !normalizedSrc || hasError;

  //  Color del fondo y Texto 
  const rankResult = getColorFromMuscularStats(muscularStats);

  let bgStyle = {};
  let fallbackBgClass = '';
  let fallbackTextClass = '';

  if (rankResult && rankResult.rankLabel !== 'Sin Rango') {
    // Tiene un rango válido -> Background de color del rango
    bgStyle = { background: rankResult.color };
    
    // Calcular luminosidad para que el texto contraste
    const hex = rankResult.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    
    const isLight = L > 0.179;
    fallbackTextClass = isLight ? 'text-black/60' : 'text-white/90';
  } else {
    // NO tiene rango o es "Sin Rango" -> Fondo gris sutil (bg-secondary)
    fallbackBgClass = 'bg-secondary';
    fallbackTextClass = 'text-foreground/60'; // Se adaptará automáticamente según light/dark mode
  }

  //  Tamaño de texto 
  const textSizeClass = getTextSizeClass(size);
  const initials = getInitials(name || userId); // usamos userId si name es undefined

  // Ring sutil para perfiles sin avatar
  const ringClass = showFallback ? 'ring-1 ring-border/50' : 'ring-1 ring-border/30';

  return (
    <div
      role="img"
      aria-label={`Avatar de ${name || 'usuario'}`}
      className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden select-none ${ringClass} ${size} ${fallbackBgClass} ${className}`}
      style={{
        ...(style || {}),
        ...(showFallback && bgStyle.background ? bgStyle : {}),
      }}
    >
      {showFallback ? (
        <span
          className={`font-bold tracking-tight leading-none ${textSizeClass} ${fallbackTextClass}`}
          style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
          aria-hidden="true"
        >
          {initials}
        </span>
      ) : (
        <img
          src={normalizedSrc}
          alt={`Foto de perfil de ${name || 'usuario'}`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

