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
 * Service Worker Registration for PWA
 */
const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          // Registration was successful
          // Fix: Property 'env' does not exist on type 'ImportMeta'
          if ((import.meta as any).env?.DEV) {
            console.debug('ServiceWorker registration successful with scope: ', registration.scope);
          }
        })
        .catch((err) => {
          // registration failed :(
          console.warn('ServiceWorker registration failed: ', err);
        });
    });
  }
};

registerSW();