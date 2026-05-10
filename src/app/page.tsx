"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import ParticleCanvas from "@/components/ParticleCanvas";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import QRCard from "@/components/QRCard";
import { useSocket } from "@/hooks/useSocket";

export default function HomePage() {
  const { sessionId, sessionState, createSession, connected } = useSocket("desktop");
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (connected && !sessionId) {
      createSession("My Desktop");
    }
  }, [connected, sessionId, createSession]);

  // Tilt effect on cards
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
  };

  return (
    <>
      <ParticleCanvas />
      <CursorGlow />
      <Navbar />

      <main className="relative z-10 min-h-screen">
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center px-6 pt-24"
          style={{ maxWidth: "100vw", overflow: "hidden" }}
        >
          {/* Ambient background glows */}
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(0,168,255,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(123,97,255,0.07) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12">
            {/* LEFT — copy */}
            <div className="relative z-10">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
                style={{
                  background: "rgba(0,168,255,0.08)",
                  border: "1px solid rgba(0,168,255,0.2)",
                  animation: "fadeIn 0.8s ease forwards",
                }}
              >
                <div className="status-dot" style={{ width: 6, height: 6 }} />
                <span className="text-xs font-medium" style={{ color: "#00A8FF" }}>
                  Live · Open Beta
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-black leading-none tracking-tight mb-6"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  letterSpacing: "-0.04em",
                  animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards",
                  opacity: 0,
                }}
              >
                Instantly send{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #00A8FF, #7B61FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  anything
                </span>{" "}
                between your phone and desktop.
              </h1>

              {/* Sub */}
              <p
                className="text-lg mb-10 max-w-md"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards",
                  opacity: 0,
                }}
              >
                Scan. Connect. Transfer instantly. No apps, no cables, no cloud accounts. Just pure speed.
              </p>

              {/* Buttons */}
              <div
                className="flex flex-wrap gap-3"
                style={{
                  animation: "slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards",
                  opacity: 0,
                }}
              >
                <Link href="/dashboard">
                  <button className="btn-primary text-sm font-bold px-7 py-3.5 rounded-2xl flex items-center gap-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Start Transfer
                  </button>
                </Link>
                <Link href="/mobile">
                  <button className="btn-ghost text-sm font-semibold px-7 py-3.5 rounded-2xl flex items-center gap-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="18" r="1" fill="currentColor" />
                    </svg>
                    Open on Mobile
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div
                className="flex items-center gap-6 mt-10"
                style={{ animation: "fadeIn 1s ease 0.8s forwards", opacity: 0 }}
              >
                <div className="encrypted-badge">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 1a2 2 0 0 0-2 2v1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7V3a2 2 0 0 0-2-2zm0 1a1 1 0 0 1 1 1v1H4V3a1 1 0 0 1 1-1z" />
                  </svg>
                  E2E Encrypted
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  No sign-up required
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Works on any browser
                </span>
              </div>
            </div>

            {/* RIGHT — QR card */}
            <div className="relative flex justify-center lg:justify-end">
              <QRCard
                sessionId={sessionId}
                mobileConnected={!!sessionState?.mobileConnected}
                deviceName={sessionState?.deviceName}
                ping={sessionState?.ping}
              />
            </div>
          </div>
        </section>

        {/* ── CTA FOOTER ────────────────────────────────────────── */}
        <section className="relative py-32 px-6 text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(0,168,255,0.06) 0%, transparent 60%)",
            }}
          />
          <div className="max-w-2xl mx-auto relative z-10">
            <h2
              className="text-5xl font-black mb-6"
              style={{ letterSpacing: "-0.04em" }}
            >
              Ready to transfer at the speed of thought?
            </h2>
            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
              No account. No app. No nonsense. Just open and go.
            </p>
            <Link href="/dashboard">
              <button
                className="btn-primary text-base font-bold px-10 py-4 rounded-2xl"
                style={{ fontSize: "1rem" }}
              >
                Launch PapiSend →
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8 px-6 text-center"
          style={{ borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", fontSize: 13 }}
        >
          <p>© 2026 PapiSend · Built for speed · End-to-end encrypted</p>
        </footer>
      </main>
    </>
  );
}
