"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  onClose?: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onClose?.(), 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "rgba(0,255,135,0.08)", border: "rgba(0,255,135,0.25)", dot: "#00FF87" },
    info: { bg: "rgba(0,168,255,0.08)", border: "rgba(0,168,255,0.25)", dot: "#00A8FF" },
    error: { bg: "rgba(255,60,60,0.08)", border: "rgba(255,60,60,0.25)", dot: "#FF3C3C" },
  };
  const c = colors[type];

  return (
    <div
      className={leaving ? "toast-out" : "toast-in"}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 260,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${c.border}`,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, boxShadow: `0 0 8px ${c.dot}`, flexShrink: 0 }} />
      <span className="text-sm font-medium text-white">{message}</span>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: { id: string; message: string; type?: "success" | "info" | "error" }[]; onRemove: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end"
      style={{ pointerEvents: "none" }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <Toast message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
        </div>
      ))}
    </div>
  );
}
