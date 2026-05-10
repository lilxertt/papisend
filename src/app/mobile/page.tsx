"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { formatBytes, getFileIcon } from "@/lib/utils";

const FILE_TYPES = [
  { icon: "🖼️", label: "Photos", accept: "image/*" },
  { icon: "🎬", label: "Videos", accept: "video/*" },
  { icon: "🎵", label: "Audio", accept: "audio/*" },
  { icon: "📄", label: "Files", accept: "*/*" },
  { icon: "🗜️", label: "Archive", accept: ".zip,.rar,.7z" },
  { icon: "🔗", label: "Links", accept: "" },
];

function MobileContent() {
  const params = useSearchParams();
  const sessionParam = params.get("session");

  const { connected, sessionId, sessionState, sendFile, activities, joinSession } = useSocket("mobile");
  const [joined, setJoined] = useState(false);
  const [inputId, setInputId] = useState(sessionParam || "");
  const [sending, setSending] = useState<{ name: string; progress: number } | null>(null);
  const [sent, setSent] = useState<{ name: string; type: string }[]>([]);

  useEffect(() => {
    if (connected && sessionParam && !joined) {
      joinSession(sessionParam, "iPhone");
      setJoined(true);
    }
  }, [connected, sessionParam, joined, joinSession]);

  const handleJoin = () => {
    if (inputId.trim()) {
      joinSession(inputId.trim().toUpperCase(), "iPhone");
      setJoined(true);
    }
  };

  const handleSendFile = useCallback(async (accept: string) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setSending({ name: file.name, progress: 0 });
      let prog = 0;
      const interval = setInterval(() => {
        prog = Math.min(prog + Math.random() * 15, 95);
        setSending({ name: file.name, progress: Math.round(prog) });
      }, 120);
      await sendFile(file);
      clearInterval(interval);
      setSending({ name: file.name, progress: 100 });
      setSent((p) => [{ name: file.name, type: file.type }, ...p]);
      setTimeout(() => setSending(null), 1200);
    };
    input.click();
  }, [sendFile]);

  const isConnected = !!sessionState?.desktopConnected || joined;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "#000" }}
    >
      {/* Phone frame */}
      <div
        className="w-full max-w-sm relative overflow-hidden"
        style={{
          background: "rgba(20,20,20,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 44,
          minHeight: 780,
          boxShadow: "0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic Island */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <div
            style={{
              width: 120,
              height: 34,
              background: "#000",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isConnected && (
              <>
                <div className="status-dot" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Live</span>
              </>
            )}
          </div>
        </div>

        {/* Phone content */}
        <div className="flex-1 flex flex-col px-5 pb-8 overflow-hidden">

          {/* If not connected — join screen */}
          {!joined && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#00A8FF,#7B61FF)", boxShadow: "0 0 30px rgba(0,168,255,0.4)" }}
              >
                <span className="text-2xl">📡</span>
              </div>
              <div>
                <h1 className="text-2xl font-black mb-2" style={{ letterSpacing: "-0.04em" }}>PapiSend</h1>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Enter a session ID to connect</p>
              </div>
              <div className="w-full space-y-3">
                <input
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value.toUpperCase())}
                  placeholder="SESSION ID"
                  maxLength={8}
                  className="w-full rounded-2xl px-4 py-3.5 text-center font-mono font-bold tracking-widest text-white text-lg outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    caretColor: "#00A8FF",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <button
                  onClick={handleJoin}
                  disabled={!connected || inputId.length < 6}
                  className="w-full rounded-2xl py-3.5 font-bold text-black text-sm transition-all duration-300"
                  style={{
                    background: connected && inputId.length >= 6 ? "#00A8FF" : "rgba(255,255,255,0.1)",
                    color: connected && inputId.length >= 6 ? "#000" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {connected ? "Connect" : "Connecting to server..."}
                </button>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Or scan the QR code at papisend.app
              </p>
            </div>
          )}

          {/* Connected view */}
          {joined && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="mb-6 mt-2">
                <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.04em" }}>
                  Send Anything
                </h1>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  to {sessionState?.desktopName || "Desktop"}
                </p>
              </div>

              {/* File type grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {FILE_TYPES.map((ft, i) => (
                  <button
                    key={i}
                    onClick={() => ft.label !== "Links" && handleSendFile(ft.accept)}
                    className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,168,255,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,168,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <span className="text-2xl">{ft.icon}</span>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{ft.label}</span>
                  </button>
                ))}
              </div>

              {/* Sending progress */}
              {sending && (
                <div
                  className="mb-4 rounded-2xl p-4"
                  style={{
                    background: "rgba(0,168,255,0.06)",
                    border: "1px solid rgba(0,168,255,0.2)",
                    animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold truncate mr-2">{sending.name}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "#00A8FF", fontFamily: "JetBrains Mono, monospace" }}>
                      {sending.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full progress-shimmer transition-all duration-200"
                      style={{ width: `${sending.progress}%` }}
                    />
                  </div>
                  {sending.progress === 100 && (
                    <p className="text-xs mt-2 text-center" style={{ color: "#00FF87" }}>✓ Sent!</p>
                  )}
                </div>
              )}

              {/* Sent files */}
              {sent.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                  <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Recent sends</p>
                  <div className="space-y-2">
                    {sent.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span className="text-lg">{getFileIcon(f.type)}</span>
                        <span className="text-xs text-white truncate flex-1">{f.name}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#00FF87" }}>✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected device card */}
              <div
                className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3 flex-shrink-0"
                style={{
                  background: "rgba(0,255,135,0.04)",
                  border: "1px solid rgba(0,255,135,0.12)",
                  marginTop: "auto",
                }}
              >
                <div className="status-dot" style={{ width: 8, height: 8 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "#00FF87" }}>
                    {sessionState?.desktopName || "Desktop"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {sessionState?.ping != null ? `${sessionState.ping}ms · Encrypted` : "Encrypted · Live"}
                  </p>
                </div>
                <div className="encrypted-badge" style={{ fontSize: 9 }}>E2E</div>
              </div>
            </div>
          )}
        </div>

        {/* Home bar */}
        <div className="flex justify-center pb-3 flex-shrink-0">
          <div style={{ width: 120, height: 5, background: "rgba(255,255,255,0.25)", borderRadius: 3 }} />
        </div>
      </div>

      {/* Below frame hint */}
      <p className="text-xs mt-6 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
        PapiSend · Mobile View · End-to-end encrypted
      </p>
    </div>
  );
}

export default function MobilePage() {
  return (
    <Suspense>
      <MobileContent />
    </Suspense>
  );
}
