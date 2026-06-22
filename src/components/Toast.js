"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ShieldCheck, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = (msg) => addToast("success", msg);
  const showDanger = (msg) => addToast("danger", msg);
  const showWarning = (msg) => addToast("warning", msg);
  const showInfo = (msg) => addToast("info", msg);

  return (
    <ToastContext.Provider value={{ showSuccess, showDanger, showWarning, showInfo }}>
      {children}
      
      {/* Toast container */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "350px",
        width: "100%"
      }}>
        {toasts.map((toast) => {
          let bg = "var(--primary)";
          let icon = <Info size={18} />;
          
          if (toast.type === "success") {
            bg = "var(--success)";
            icon = <ShieldCheck size={18} />;
          } else if (toast.type === "danger") {
            bg = "var(--danger)";
            icon = <AlertCircle size={18} />;
          } else if (toast.type === "warning") {
            bg = "var(--warning)";
            icon = <AlertCircle size={18} />;
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bg,
                color: "#fff",
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                animation: "slideIn 0.3s ease forwards",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px"
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
