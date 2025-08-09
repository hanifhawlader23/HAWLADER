import '@fullcalendar/core/index.css';
import '@fullcalendar/daygrid/index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";

// Global error handlers for better debugging, preventing generic "Script error" messages.
window.addEventListener('error', (e) => { console.error('GLOBAL ERROR', e.message, e.filename, e.lineno, e.colno, e.error); });
window.addEventListener('unhandledrejection', (e) => { console.error('UNHANDLED', e.reason); });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  </BrowserRouter>
);