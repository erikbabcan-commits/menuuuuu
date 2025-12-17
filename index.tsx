import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // Explicitly construct the URL relative to the current window location
      // This fixes 'origin mismatch' errors in preview environments like StackBlitz or Replit
      const swUrl = new URL('./sw.js', window.location.href).href;
      
      navigator.serviceWorker.register(swUrl).then(
        (registration) => {
          console.log('ServiceWorker registration successful');
        },
        (err) => {
          // Suppress error in development if it's just a duplicate registration or offline
          console.debug('ServiceWorker registration info: ', err);
        }
      );
    } catch (error) {
      console.warn('ServiceWorker initialization skipped:', error);
    }
  });
}