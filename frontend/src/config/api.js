let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
// Normalizamos la URL base para evitar el error de doble ruta (/api/api/...)
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);

export const API_URL = baseUrl;
console.log("[Config API] API_URL inicializada como:", API_URL);