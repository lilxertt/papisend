"use client";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import ParticleCanvas from "@/components/ParticleCanvas";
import CursorGlow from "@/components/CursorGlow";
import DropZone from "@/components/DropZone";
import ActivityFeed from "@/components/ActivityFeed";
import { ToastContainer } from "@/components/Toast";
import { formatBytes, getFileIcon } from "@/lib/utils";
import Link from "next/link";

type SidebarTab = "dashboard" | "transfers" | "devices" | "settings";

const NAV_ITEMS: { id: SidebarTab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "transfers", icon: "📂", label: "Transfers" },
  { id: "devices", icon: "📱", label: "Devices" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function DashboardPage() {
  const { connected, sessionId, sessionState, activities, receivedFiles, createSession, sendFile } = useSocket("desktop");
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [toasts, setToasts] = useState<{ id: string; message: string; type?: "success" | "info" | "error" }[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
  }, []);

  useEffect(() => {
    if (connected && !sessionId) createSession("My Desktop");
  }, [connected, sessionId, createSession]);

  useEffect(() => {
    if (sessionState?.mobileConnected) addToast(`${sessionState.deviceName || "Device"} connected!`, "success");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState?.mobileConnected]);

  useEffect(() => {
    if (receivedFiles.length > 0) {
      const f = receivedFiles[0];
      addToast(`Received: ${f.name}`, "success");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedFiles.length]);

  const handleFiles = useCallback(async (files: File[]) => {
    for (const f of files) {
      await sendFile(f);
      addToast(`Sent: ${f.name}`, "info");
    }
  }, [sendFile, addToast]);

  const mobileConnected = !!sessionState?.mobileConnected;

  return (
    <>
      <ParticleCanvas />
      <CursorGlow />
      <div className="flex h-screen overflow-hidden relative z-10">

        {/* ── SIDEBAR ── */}
        <aside
          className="flex flex-col h-full transition-all duration-500"
          style={{
            width: sidebarCollapsed ? 64 : 220,
            background: "rgba(255,255,255,0.02)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#00A8FF,#7B61FF)", boxShadow: "0 0 16px rgba(0,168,255,0.4)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L8 3L13 8L8 13L3 8Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            {!sidebarCollapsed && <span className="font-bold text-base tracking-tight">PapiSend</span>}
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
                style={{ justifyContent: sidebarCollapsed ? "center" : "flex-start" }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="text-base">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Connection status */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: connected ? "#00FF87" : "#FF6B6B",
                  boxShadow: `0 0 6px ${connected ? "#00FF87" : "#FF6B6B"}`,
                  animation: "statusPulse 2s ease-in-out infinite",
                }}
              />
              {!sidebarCollapsed && (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {connected ? "Server live" : "Connecting..."}
                </span>
              )}
            </div>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mx-3 mb-3 rounded-xl py-2 text-xs flex items-center justify-center transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <header
            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)" }}
          >
            <div>
              <h1 className="font-bold text-lg tracking-tight capitalize">{activeTab}</h1>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {sessionId ? `Session: ${sessionId}` : "Initializing session..."}
              </p>
            </div>

            {/* Connected device pill */}
            {mobileConnected ? (
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-2"
                style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.2)" }}
              >
                <div className="status-dot" style={{ width: 7, height: 7 }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#00FF87" }}>{sessionState?.deviceName || "iPhone"}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {sessionState?.ping ?? "—"}ms · {sessionState?.battery != null ? `🔋 ${sessionState.battery}%` : "Connected"}
                  </p>
                </div>
              </div>
            ) : (
              <Link href="/">
                <div
                  className="flex items-center gap-2 rounded-2xl px-4 py-2 cursor-pointer"
                  style={{ background: "rgba(0,168,255,0.06)", border: "1px solid rgba(0,168,255,0.2)" }}
                >
                  <div className="status-dot status-dot-yellow" style={{ width: 7, height: 7, background: "#FFD60A", boxShadow: "0 0 6px #FFD60A", animation: "statusPulse 2s ease-in-out infinite" }} />
                  <p className="text-xs" style={{ color: "#00A8FF" }}>Waiting for device — Scan QR</p>
                </div>
              </Link>
            )}
          </header>

          {/* Content area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                {/* CENTER — Drop zone */}
                <div className="lg:col-span-2 space-y-6">
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold tracking-tight">Send Files</h2>
                      {!mobileConnected && (
                        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,214,10,0.08)", color: "#FFD60A", border: "1px solid rgba(255,214,10,0.2)" }}>
                          Connect mobile first
                        </span>
                      )}
                    </div>
                    <DropZone onFiles={handleFiles} disabled={!mobileConnected} />
                  </div>

                  {/* Received files */}
                  {receivedFiles.length > 0 && (
                    <div
                      className="rounded-2xl p-6"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <h2 className="font-bold tracking-tight mb-4">Received Files</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {receivedFiles.map((f) => (
                          <a
                            key={f.id}
                            href={f.dataUrl}
                            download={f.name}
                            className="group rounded-xl p-3 transition-all duration-200 flex flex-col gap-2"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,168,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,168,255,0.2)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                          >
                            {f.type.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.dataUrl} alt={f.name} className="w-full h-20 object-cover rounded-lg" />
                            ) : (
                              <div
                                className="w-full h-20 rounded-lg flex items-center justify-center text-3xl"
                                style={{ background: "rgba(0,168,255,0.06)" }}
                              >
                                {getFileIcon(f.type)}
                              </div>
                            )}
                            <p className="text-xs font-medium text-white truncate">{f.name}</p>
                            <p className="text-xs" style={{ color: "rgba(0,168,255,0.6)" }}>↓ Download</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT — Activity + Stats */}
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Files Received", value: receivedFiles.length, color: "#00A8FF" },
                      { label: "Ping", value: sessionState?.ping != null ? `${sessionState.ping}ms` : "—", color: "#00FF87" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-4"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
                        <p className="text-2xl font-bold" style={{ color: stat.color, letterSpacing: "-0.03em" }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Activity feed */}
                  <div
                    className="rounded-2xl p-5"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm tracking-tight">Live Activity</h3>
                      <div className="status-dot" style={{ width: 6, height: 6 }} />
                    </div>
                    <ActivityFeed activities={activities} />
                  </div>

                  {/* Session info */}
                  {sessionId && (
                    <div
                      className="rounded-2xl p-4"
                      style={{ background: "rgba(0,168,255,0.04)", border: "1px solid rgba(0,168,255,0.12)" }}
                    >
                      <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Session ID</p>
                      <p className="font-mono text-sm font-bold" style={{ color: "#00A8FF", letterSpacing: "0.1em" }}>{sessionId}</p>
                      <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Share with mobile → go to /mobile?session={sessionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "transfers" && (
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="font-bold text-xl tracking-tight mb-6">Transfer History</h2>
                {receivedFiles.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">📭</div>
                    <p style={{ color: "rgba(255,255,255,0.3)" }}>No transfers yet. Connect a device and send files.</p>
                  </div>
                ) : (
                  receivedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-4 rounded-2xl px-5 py-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="text-2xl">{getFileIcon(f.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{f.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {new Date(f.receivedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <a
                        href={f.dataUrl}
                        download={f.name}
                        className="text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                        style={{ background: "rgba(0,168,255,0.1)", color: "#00A8FF", border: "1px solid rgba(0,168,255,0.2)" }}
                      >
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "devices" && (
              <div className="max-w-xl mx-auto text-center py-20">
                {mobileConnected ? (
                  <div
                    className="rounded-3xl p-8"
                    style={{ background: "rgba(0,255,135,0.04)", border: "1px solid rgba(0,255,135,0.15)" }}
                  >
                    <div className="text-5xl mb-4">📱</div>
                    <h3 className="font-bold text-xl mb-2">{sessionState?.deviceName}</h3>
                    <div className="status-dot mx-auto mb-4" />
                    <div className="grid grid-cols-2 gap-3 text-sm mt-6">
                      {[
                        ["Ping", `${sessionState?.ping ?? "—"}ms`],
                        ["Battery", sessionState?.battery != null ? `${sessionState.battery}%` : "Unknown"],
                        ["Encryption", "AES-256"],
                        ["Session", sessionId || "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{k}</p>
                          <p className="font-semibold mt-0.5" style={{ color: "#00FF87" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-4">📵</div>
                    <p style={{ color: "rgba(255,255,255,0.3)" }}>No device connected.</p>
                    <Link href="/">
                      <button className="btn-primary mt-6 px-6 py-3 rounded-2xl text-sm font-bold">Scan QR Code</button>
                    </Link>
                  </>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-lg mx-auto space-y-4 py-4">
                <h2 className="font-bold text-xl tracking-tight mb-6">Settings</h2>
                {[
                  { label: "End-to-end encryption", desc: "All sessions are encrypted by default", enabled: true },
                  { label: "Auto-download files", desc: "Automatically save received files", enabled: false },
                  { label: "Desktop notifications", desc: "Notify on file received", enabled: true },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl px-5 py-4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="font-medium text-sm">{s.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.desc}</p>
                    </div>
                    <div
                      className="w-10 h-5 rounded-full relative transition-all duration-300 flex-shrink-0"
                      style={{ background: s.enabled ? "rgba(0,168,255,0.4)" : "rgba(255,255,255,0.08)", border: `1px solid ${s.enabled ? "rgba(0,168,255,0.4)" : "rgba(255,255,255,0.1)"}` }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                        style={{ left: s.enabled ? "calc(100% - 18px)" : "2px", background: s.enabled ? "#00A8FF" : "rgba(255,255,255,0.3)", boxShadow: s.enabled ? "0 0 8px rgba(0,168,255,0.6)" : "none" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </>
  );
}
