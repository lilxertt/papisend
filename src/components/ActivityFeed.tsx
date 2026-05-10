"use client";
import { ActivityItem } from "@/hooks/useSocket";

const typeConfig = {
  connected: { icon: "🔗", color: "#00FF87", label: "Connected" },
  disconnected: { icon: "⚡", color: "#FF6B6B", label: "Disconnected" },
  transfer: { icon: "📤", color: "#00A8FF", label: "Transfer" },
  complete: { icon: "✅", color: "#00FF87", label: "Complete" },
  info: { icon: "ℹ️", color: "rgba(255,255,255,0.4)", label: "Info" },
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div
            className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Activity will appear here
          </p>
        </div>
      )}
      {activities.map((a, i) => {
        const cfg = typeConfig[a.type];
        return (
          <div
            key={a.id}
            className="activity-item flex items-start gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: `${cfg.color}10` }}
            >
              {cfg.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{a.message}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {timeAgo(a.timestamp)}
              </p>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
              style={{ background: cfg.color, opacity: 0.7 }}
            />
          </div>
        );
      })}
    </div>
  );
}
