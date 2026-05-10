"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const links = ["Features", "How it works", "Security"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setVisible(y < lastY.current || y < 60);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        background: scrolled ? "rgba(0,0,0,0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00A8FF, #7B61FF)",
              boxShadow: "0 0 20px rgba(0,168,255,0.4)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L8 3L13 8L8 13L3 8Z" fill="white" fillOpacity="0.9" />
              <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">PapiSend</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <button
            className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300"
            style={{
              background: "rgba(0,168,255,0.1)",
              border: "1px solid rgba(0,168,255,0.3)",
              color: "#00A8FF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,168,255,0.2)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,168,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,168,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Open App
          </button>
        </Link>
      </div>
    </nav>
  );
}
