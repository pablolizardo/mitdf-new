"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function PushNotificationsPrompt() {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "unsupported" | "denied" | "error">("idle");
  const [farmacias, setFarmacias] = useState(true);
  const [barcaza, setBarcaza] = useState(true);

  const subscribe = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) {
      setStatus("error");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      const payload = {
        endpoint: json.endpoint,
        keys: json.keys,
        farmacias,
        barcaza,
      };

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      setStatus("subscribed");
    } catch (e) {
      console.error("Push subscribe error", e);
      setStatus("error");
    }
  }, [farmacias, barcaza]);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("denied");
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setStatus("subscribed");
        })
      );
    }
  }, []);

  if (status === "unsupported") return null;
  if (status === "subscribed") {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Bell className="size-3.5" aria-hidden />
        Notificaciones activas (farmacia y barcaza)
      </p>
    );
  }
  if (status === "denied") return null;

  return (
    <div className="flex flex-col gap-2 text-xs">
      <p className="text-muted-foreground">
        Recibí una vez al día: farmacia de turno (mañana) y estado de la barcaza (tarde).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={farmacias}
            onChange={(e) => setFarmacias(e.target.checked)}
            className="rounded border-input"
          />
          Farmacia de turno
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={barcaza}
            onChange={(e) => setBarcaza(e.target.checked)}
            className="rounded border-input"
          />
          Barcaza
        </label>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={subscribe}
        disabled={status === "loading" || (!farmacias && !barcaza)}
        className="w-fit"
      >
        {status === "loading" ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Bell className="size-3.5" aria-hidden />
        )}
        {status === "loading" ? "Activando…" : "Activar notificaciones"}
      </Button>
      {status === "error" && (
        <p className="text-destructive text-[11px]">No se pudo activar. Revisá que el sitio esté en HTTPS.</p>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
