import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n.js'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { ConnectionProvider } from './context/ConnectionContext'
import ConnectionGate from './components/shared/ConnectionGate'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

if (Capacitor.isNativePlatform()) {
  document.body.classList.add('is-native-app');
  StatusBar.setOverlaysWebView({ overlay: true });
  StatusBar.setStyle({ style: Style.Dark });

  // Gestionar el botón/gesto de retroceso nativo en Android
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    // Si el webview tiene historial para retroceder o no estamos en la ruta raíz
    if (canGoBack || window.history.length > 2) { 
      window.history.back();
    } else {
      // Si no hay más historial, salimos de la app
      CapacitorApp.exitApp();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="347793586128-k66ji06lfekp2cc9ipd2g7tsvnht739q.apps.googleusercontent.com">
      <BrowserRouter>
        <ThemeProvider>
          <ConnectionProvider>
            <ConnectionGate>
              <App />
            </ConnectionGate>
          </ConnectionProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)