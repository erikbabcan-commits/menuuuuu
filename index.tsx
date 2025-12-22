import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical: Could not find root element to mount the application.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Robustná registrácia Service Workera pre PWA funkcionalitu.
 * Vo vývojovom režime (development) sa chyby potláčajú, v produkcii logujú ticho.
 */
const registerSW = () => {
  if ('serviceWorker' in navigator) {
    const isProd = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (isProd) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.debug('Luxury Menu Builder SW registered:', registration.scope);
          })
          .catch((err) => {
            // Tichý error handling pre dev prostredie
            if (window.location.protocol === 'https:') {
              console.warn('SW registration failed:', err);
            }
          });
      });
    }
  }
};

registerSW();