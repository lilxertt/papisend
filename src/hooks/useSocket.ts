"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export type TransferStatus = "uploading" | "complete" | "error";

export interface Transfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: TransferStatus;
  startedAt: number;
  dataUrl?: string;
}

export interface SessionState {
  sessionId: string;
  desktopConnected: boolean;
  mobileConnected: boolean;
  deviceName: string | null;
  desktopName: string;
  files: { id: string; name: string; type: string; dataUrl: string; receivedAt: number }[];
  createdAt: number;
  ping: number;
  battery: number | null;
  transferQueue: Transfer[];
}

export interface ActivityItem {
  id: string;
  type: "connected" | "disconnected" | "transfer" | "complete" | "info";
  message: string;
  timestamp: number;
}

export function useSocket(role: "desktop" | "mobile") {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [transferProgress, setTransferProgress] = useState<Record<string, number>>({});
  const [receivedFiles, setReceivedFiles] = useState<SessionState["files"]>([]);

  const addActivity = useCallback((type: ActivityItem["type"], message: string) => {
    setActivities((prev) => [
      { id: Math.random().toString(36).slice(2), type, message, timestamp: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      addActivity("info", "Connected to PapiSend network");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      addActivity("disconnected", "Disconnected from server");
    });

    socket.on("session:created", ({ sessionId }: { sessionId: string }) => {
      setSessionId(sessionId);
    });

    socket.on("session:joined", ({ sessionId, desktopName }: { sessionId: string; desktopName: string }) => {
      setSessionId(sessionId);
      addActivity("connected", `Joined session with ${desktopName}`);
    });

    socket.on("session:state", (state: SessionState) => {
      setSessionState(state);
      if (state.files) setReceivedFiles(state.files);
    });

    socket.on("session:error", ({ message }: { message: string }) => {
      addActivity("info", `Error: ${message}`);
    });

    socket.on("mobile:connected", ({ deviceName }: { deviceName: string }) => {
      addActivity("connected", `${deviceName} connected`);
    });

    socket.on("peer:disconnected", ({ role }: { role: string }) => {
      addActivity("disconnected", `${role === "mobile" ? "Mobile device" : "Desktop"} disconnected`);
    });

    socket.on("transfer:initiated", (transfer: Transfer) => {
      addActivity("transfer", `Receiving: ${transfer.name}`);
    });

    socket.on("transfer:progress", ({ transferId, progress }: { transferId: string; progress: number }) => {
      setTransferProgress((prev) => ({ ...prev, [transferId]: progress }));
    });

    socket.on("transfer:received", ({ fileName, dataUrl, fileType, transferId }: { fileName: string; fileType: string; dataUrl: string; transferId: string }) => {
      addActivity("complete", `Received: ${fileName}`);
      setReceivedFiles((prev) => [
        { id: transferId, name: fileName, type: fileType, dataUrl, receivedAt: Date.now() },
        ...prev,
      ]);
    });

    // Ping measurement
    const pingInterval = setInterval(() => {
      if (socket.connected && sessionId) {
        socket.emit("ping:send", { sessionId, timestamp: Date.now() });
      }
    }, 5000);

    socket.on("ping:receive", ({ timestamp }: { timestamp: number }) => {
      if (sessionId) socket.emit("ping:response", { sessionId, timestamp });
    });

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = useCallback((desktopName = "My Desktop") => {
    socketRef.current?.emit("session:create", { desktopName });
  }, []);

  const joinSession = useCallback((sid: string, deviceName = "iPhone", battery?: number) => {
    socketRef.current?.emit("session:join", { sessionId: sid, deviceName, battery });
  }, []);

  const sendFile = useCallback(
    async (file: File) => {
      if (!sessionId || !socketRef.current) return;
      const socket = socketRef.current;

      const transferId = Math.random().toString(36).slice(2);
      socket.emit("transfer:start", {
        sessionId,
        file: { name: file.name, size: file.size, type: file.type, id: transferId },
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        socket.emit("transfer:complete", {
          sessionId,
          transferId,
          dataUrl,
          fileName: file.name,
          fileType: file.type,
        });
        socket.emit("transfer:progress", { sessionId, transferId, progress: 100 });
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 95);
          socket.emit("transfer:progress", { sessionId, transferId, progress: pct });
          setTransferProgress((prev) => ({ ...prev, [transferId]: pct }));
        }
      };

      reader.readAsDataURL(file);
    },
    [sessionId]
  );

  return {
    socket: socketRef.current,
    connected,
    sessionId,
    sessionState,
    activities,
    transferProgress,
    receivedFiles,
    createSession,
    joinSession,
    sendFile,
    addActivity,
  };
}
