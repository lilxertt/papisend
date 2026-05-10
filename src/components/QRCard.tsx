"use client";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

type QRPhase = "waiting" | "connecting" | "connected";

interface Step {
  label: string;
  done: boolean;
}

const CONNECTION_STEPS: Step[] = [
  { label: "Authenticating", done: false },
  { label: "Encrypting Session", done: false },
  { label: "Syncing Device", done: false },
  { label: "Preparing Transfer", done: false },
];

interface QRCardProps {
  sessionId: string | null;
  mobileConnected: boolean;
  deviceName?: string | null;
  ping?: number;
}

export default function QRCard({ sessionId, mobileConnected, deviceName, ping }: QRCardProps) {
  const [phase, setPhase] = useState<QRPhase>("waiting");
  const [steps, setSteps] = useState<Step[]>(CONNECTION_STEPS.map((s) => ({ ...s })));
  const [timer, setTimer] = useState(300); // 5 min session
  const [sessionFingerprint, setSessionFingerprint] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Client-only initialisation (avoids SSR/client mismatch)
  useEffect(() => {
    setSessionFingerprint(Math.random().toString(36).slice(2, 10).toUpperCase());
    setOrigin(window.location.origin);
    setMounted(true);
  }, []);

  // Count down timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // React to mobile connection
  useEffect(() => {
    if (mobileConnected && phase === "waiting") {
      setPhase("connecting");
      let idx = 0;
      const stepInterval = setInterval(() => {
        setSteps((prev) => {
          const updated = [...prev];
          if (updated[idx]) updated[idx].done = true;
          return updated;
        });
        idx++;
        if (idx >= CONNECTION_STEPS.length) {
          clearInterval(stepInterval);
          setTimeout(() => setPhase("connected"), 400);
        }
      }, 500);
    }
    if (!mobileConnected && phase === "connected") {
      setPhase("waiting");
      setSteps(CONNECTION_STEPS.map((s) => ({ ...s })));
    }
  }, [mobileConnected, phase]);

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  const qrUrl = sessionId ? `${origin}/mobile?session=${sessionId}` : "";

  return (
    <div
      className="relative w-full max-w-sm mx-auto"
      style={{ animation: "floatYSlow 10s ease-in-out infinite" }}
    >
      {/* Outer massive glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,168,255,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          transform: "scale(1.4)",
        }}
      />

      {/* Light rays */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="light-ray"
          style={{
            left: `${20 + i * 20}%`,
            top: "-60px",
            height: "160px",
            animationDelay: `${i * 0.8}s`,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Main card */}
      <div
        className="relative rounded-3xl p-6 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,168,255,0.3)",
          backdropFilter: "blur(30px)",
          boxShadow: "0 0 40px rgba(0,168,255,0.15), 0 40px 80px rgba(0,0,0,0.6)",
          animation: "borderGlow 2.5s ease-in-out infinite",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="encrypted-badge">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M5 1a2 2 0 0 0-2 2v1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7V3a2 2 0 0 0-2-2zm0 1a1 1 0 0 1 1 1v1H4V3a1 1 0 0 1 1-1z" />
            </svg>
            E2E ENCRYPTED
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono, monospace" }}>
            <span>ID:</span>
            <span style={{ color: "rgba(0,168,255,0.7)" }}>
              {sessionFingerprint ?? "--------"}
            </span>
          </div>
        </div>

        {/* QR / Connecting / Connected area */}
        <div className="relative mb-5 flex items-center justify-center" style={{ height: 220 }}>
          {phase === "waiting" && sessionId && (
            <div
              className="relative rounded-2xl overflow-hidden p-4"
              style={{
                background: "rgba(255,255,255,0.95)",
                animation: "breathe 4s ease-in-out infinite",
              }}
            >
              <QRCodeSVG
                value={qrUrl}
                size={180}
                bgColor="transparent"
                fgColor="#000"
                level="H"
              />
              <div className="scan-line" />
            </div>
          )}

          {phase === "waiting" && !sessionId && (
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "rgba(0,168,255,0.1)", border: "1px solid rgba(0,168,255,0.2)" }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Generating session...
              </p>
            </div>
          )}

          {phase === "connecting" && (
            <div className="text-center">
              {/* Ripple rings */}
              <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                {[0, 0.4, 0.8].map((delay, i) => (
                  <div
                    key={i}
                    className="ring-pulse absolute"
                    style={{
                      width: `${60 + i * 20}px`,
                      height: `${60 + i * 20}px`,
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,168,255,0.15)", border: "2px solid rgba(0,168,255,0.4)" }}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#00A8FF" strokeWidth="1.5" />
                    <path d="M8 12h8M12 8l4 4-4 4" stroke="#00A8FF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-white font-semibold text-sm mb-3">
                Connecting to {deviceName || "device"}...
              </p>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="step-item flex items-center gap-2 text-xs"
                    style={{
                      color: step.done ? "#00FF87" : "rgba(255,255,255,0.35)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: step.done ? "rgba(0,255,135,0.2)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${step.done ? "rgba(0,255,135,0.4)" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      {step.done && (
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path d="M1 3.5L2.5 5L5.5 2" stroke="#00FF87" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "connected" && (
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,168,255,0.15))",
                  border: "2px solid rgba(0,255,135,0.3)",
                  boxShadow: "0 0 30px rgba(0,255,135,0.2)",
                }}
              >
                <span className="text-3xl">📱</span>
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#00FF87", boxShadow: "0 0 10px #00FF87" }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-white font-bold text-base mb-1">Successfully Connected</p>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                {deviceName || "iPhone"} is ready to transfer
              </p>
              {ping !== undefined && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ background: "rgba(0,255,135,0.08)", border: "1px solid rgba(0,255,135,0.2)", color: "#00FF87", fontFamily: "JetBrains Mono, monospace" }}
                >
                  <div className="status-dot" style={{ width: 6, height: 6 }} />
                  {ping}ms ping
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="status-dot"
              style={phase === "connected" ? {} : { background: "#FFD60A", boxShadow: "0 0 8px #FFD60A" }}
            />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {phase === "waiting" ? "Waiting for device connection..." : phase === "connecting" ? "Establishing secure tunnel..." : "Live · Secure"}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}
          >
            {mounted ? `${minutes}:${seconds}` : "05:00"}
          </span>
        </div>
      </div>
    </div>
  );
}
