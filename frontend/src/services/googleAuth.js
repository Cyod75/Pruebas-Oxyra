/**
 * ═══════════════════════════════════════════════════════════
 *  OXYRA — CAPA DE ABSTRACCIÓN GOOGLE AUTH
 *
 *  Proporciona una API unificada para Google Sign-In que
 *  delega al plugin nativo (@capgo/capacitor-social-login)
 *  en Android/iOS y no-op en web (donde @react-oauth/google
 *  gestiona el flujo directamente en el componente).
 *
 *  IMPORTANTE: Este módulo NO importa el plugin de forma
 *  estática. Usa import() dinámico para que el bundler web
 *  no falle si el plugin no está disponible.
 * ═══════════════════════════════════════════════════════════
 */

import { Capacitor } from "@capacitor/core";

// ─── Estado interno ─────────────────────────────────────────
let _initialized = false;
let _SocialLogin = null;

// ─── Client IDs de Google (centralizados) ───────────────────
export const GOOGLE_WEB_CLIENT_ID =
  "347793586128-k66ji06lfekp2cc9ipd2g7tsvnht739q.apps.googleusercontent.com";

export const GOOGLE_ANDROID_CLIENT_ID =
  "347793586128-3mp3j044tpd1cppoktiriuefmogsqa5h.apps.googleusercontent.com";

/**
 * Inicializa el plugin nativo de Google Auth.
 * En web no hace nada (el flujo lo gestiona @react-oauth/google).
 * Debe llamarse UNA vez al montar la app o la pantalla de login.
 */
export async function initializeGoogleAuth() {
  if (!Capacitor.isNativePlatform()) {
    // Web: no necesita inicialización nativa
    _initialized = true;
    return;
  }

  if (_initialized) return;

  try {
    console.log("[GoogleAuth] Inicializando plugin nativo (SocialLogin)...");

    // Import dinámico: solo se resuelve en runtime nativo
    const { SocialLogin } = await import("@capgo/capacitor-social-login");
    _SocialLogin = SocialLogin;

    await _SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        mode: "online",
      },
    });

    _initialized = true;
    console.log("[GoogleAuth] Plugin nativo inicializado correctamente.");
  } catch (err) {
    console.error(
      "[GoogleAuth] Error al inicializar el plugin nativo:",
      JSON.stringify(err),
      err
    );
    throw err;
  }
}

/**
 * Ejecuta Google Sign-In en plataforma nativa.
 * Devuelve un objeto normalizado: { email, name, picture, sub }
 *
 * @throws Si el plugin no está inicializado o el login falla.
 */
export async function nativeGoogleSignIn() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("[GoogleAuth] nativeGoogleSignIn() solo funciona en nativo.");
  }

  if (!_initialized || !_SocialLogin) {
    throw new Error("[GoogleAuth] Plugin no inicializado. Llama a initializeGoogleAuth() primero.");
  }

  console.log("[GoogleAuth] Iniciando Google Sign-In nativo...");

  const result = await _SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["profile", "email"],
    },
  });

  console.log("[GoogleAuth] Resultado nativo:", JSON.stringify(result));

  // Normalizar al mismo formato que usa el flujo web
  const profile = result?.result?.profile || result?.profile || {};

  return {
    email: profile.email ?? null,
    name: profile.name ?? profile.displayName ?? null,
    picture: profile.picture ?? profile.imageUrl ?? profile.photoUrl ?? null,
    sub: profile.id ?? profile.sub ?? null,
  };
}

/**
 * Indica si el plugin nativo está listo para usar.
 */
export function isNativeAuthReady() {
  return _initialized;
}

/**
 * Indica si estamos en plataforma nativa.
 */
export function isNative() {
  return Capacitor.isNativePlatform();
}
