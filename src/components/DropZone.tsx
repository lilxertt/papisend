"use client";
import { useState, useRef, useCallback } from "react";
import { formatBytes, getFileIcon } from "@/lib/utils";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; size: number; type: string; url?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const newPreviews = arr.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      }));
      setPreviews((prev) => [...newPreviews, ...prev].slice(0, 6));
      onFiles(arr);
    },
    [onFiles]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className="relative w-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden"
        style={{
          height: 240,
          background: isDragging
            ? "rgba(0,168,255,0.06)"
            : "rgba(255,255,255,0.02)",
          border: `2px dashed ${isDragging ? "rgba(0,168,255,0.6)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: isDragging ? "0 0 40px rgba(0,168,255,0.15), inset 0 0 40px rgba(0,168,255,0.05)" : "none",
        }}
      >
        {/* Animated corner accents */}
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-4 h-4`}
            style={{
              borderTop: i < 2 ? `2px solid rgba(0,168,255,${isDragging ? 0.8 : 0.3})` : "none",
              borderBottom: i >= 2 ? `2px solid rgba(0,168,255,${isDragging ? 0.8 : 0.3})` : "none",
              borderLeft: i % 2 === 0 ? `2px solid rgba(0,168,255,${isDragging ? 0.8 : 0.3})` : "none",
              borderRight: i % 2 === 1 ? `2px solid rgba(0,168,255,${isDragging ? 0.8 : 0.3})` : "none",
              transition: "border-color 0.3s",
            }}
          />
        ))}

        {/* Glow spot following drag */}
        {isDragging && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(0,168,255,0.1) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Upload icon */}
        <div
          className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300"
          style={{
            background: isDragging ? "rgba(0,168,255,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isDragging ? "rgba(0,168,255,0.4)" : "rgba(255,255,255,0.08)"}`,
            transform: isDragging ? "scale(1.1)" : "scale(1)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: isDragging ? "#00A8FF" : "rgba(255,255,255,0.4)" }}
          >
            <path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 17v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-sm font-semibold mb-1" style={{ color: isDragging ? "#00A8FF" : "white" }}>
          {isDragging ? "Release to upload" : "Drop files here"}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          or click to browse · Any file type
        </p>

        {disabled && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Connect a device first
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* File previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                animation: "slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}
            >
              {f.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: "rgba(0,168,255,0.1)" }}
                >
                  {getFileIcon(f.type)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{f.name}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {formatBytes(f.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
