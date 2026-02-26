"use client";

import { useEffect, useRef, useState } from "react";

const JITSI_DOMAIN = "meet.jit.si";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: JitsiOptions) => JitsiApi;
  }
}

interface JitsiOptions {
  roomName: string;
  width: string | number;
  height: string | number;
  parentNode: HTMLElement;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: { displayName?: string };
}

interface JitsiApi {
  dispose: () => void;
}

export function VideoCallRoom({
  roomName,
  displayName,
}: {
  roomName: string;
  displayName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName || !containerRef.current) return;

    const loadScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Nu s-a putut încărca serviciul de videoconferință.");
      document.head.appendChild(script);
    };

    loadScript();
  }, [roomName]);

  useEffect(() => {
    if (!scriptLoaded || !window.JitsiMeetExternalAPI || !containerRef.current) return;

    const sanitizedRoom = roomName.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!sanitizedRoom) {
      setError("Nume invalid pentru sală.");
      return;
    }

    try {
      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: sanitizedRoom,
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
        userInfo: displayName ? { displayName } : undefined,
      });

      apiRef.current = api;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la pornirea videoconferinței.");
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [scriptLoaded, roomName, displayName]);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-800 dark:bg-rose-950/30">
        <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Dacă nu te conectezi automat, acceptă accesul la microfon și cameră în browser. Poți părăsi apelul oricând din butonul roșu de închidere.
      </p>
      <div
        ref={containerRef}
        className="h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-slate-700"
      />
    </div>
  );
}
