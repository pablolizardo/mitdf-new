"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Facebook, Link2, Linkedin, Mail, Send } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M12.017 0C5.405 0 2.37 4.348 2.37 7.974c0 2.192.83 4.142 2.61 4.868.292.12.554.004.638-.32.059-.226.198-.8.259-1.037a.593.593 0 00-.145-.588c-.533-.652-.867-1.79-.867-2.868 0-2.774 2.104-5.463 5.68-5.463 3.094 0 5.257 2.107 5.257 5.12 0 3.254-1.623 5.513-3.737 5.513-1.166 0-2.039-.962-1.758-2.142.335-1.414.985-2.94.985-3.96 0-.913-.49-1.674-1.5-1.674-1.19 0-2.144 1.24-2.144 2.9 0 1.057.36 1.77.36 1.77s-1.236 5.24-1.45 6.163c-.43 1.798-.064 4.001-.033 4.22.017.123.176.152.248.06.103-.134 1.37-1.7 1.8-3.27.122-.446.698-2.732.698-2.732.346.664 1.36 1.25 2.437 1.25 3.209 0 5.387-2.932 5.387-6.866C19.79 4.142 16.447 0 12.017 0z" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M24 11.779c0-1.325-1.075-2.4-2.4-2.4-.643 0-1.225.251-1.661.659-1.64-1.101-3.868-1.805-6.326-1.884l1.291-4.076 3.56.843-.005.049c0 1.079.875 1.954 1.955 1.954 1.08 0 1.955-.875 1.955-1.955s-.875-1.955-1.955-1.955c-.77 0-1.436.451-1.752 1.103l-3.962-.939c-.167-.04-.336.057-.385.223l-1.45 4.573c-2.6.03-4.951.74-6.663 1.889-.433-.389-1.003-.629-1.63-.629-1.325 0-2.4 1.075-2.4 2.4 0 .977.583 1.813 1.421 2.195-.036.234-.06.471-.06.712 0 3.568 3.997 6.459 8.915 6.459 4.918 0 8.914-2.891 8.914-6.459 0-.23-.022-.457-.055-.682.876-.364 1.501-1.24 1.501-2.225zm-17.224.819c0-.795.646-1.44 1.44-1.44.794 0 1.439.645 1.439 1.44 0 .794-.645 1.439-1.44 1.439-.793 0-1.439-.645-1.439-1.439zM15.98 17.91c-.789.789-2.3.852-3.017.852-.717 0-2.222-.063-3.017-.852a.335.335 0 01.474-.474c.486.487 1.521.707 2.543.707 1.022 0 2.061-.22 2.544-.707a.335.335 0 01.474.474zm-.238-3.872c-.794 0-1.439-.645-1.439-1.439 0-.795.645-1.44 1.439-1.44.795 0 1.44.645 1.44 1.44 0 .794-.645 1.439-1.44 1.439z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="-2 -2  28 28"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="80 80 800 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M404.63 392.13c-11.92-7.93-51.53-35.49-51.53-35.49 33.4-47.88 77.46-66.52 138.36-66.52 43.07 0 79.64 14.52 105.75 42 26.12 27.49 41.02 66.8 44.41 117.07 14.48 6.07 27.85 13.22 39.99 21.4 48.96 33 75.92 82.34 75.92 138.91 0 120.23-98.34 224.67-276.35 224.67-152.84 0-311.63-89.11-311.63-354.45 0-263.83 153.81-353.92 311.2-353.92 72.68 0 243.16 10.76 307.27 222.94l-60.12 15.63C678.33 213.2 574.4 189.14 479.11 189.14c-157.52 0-246.62 96.13-246.62 300.65 0 183.38 99.59 280.8 248.71 280.8 122.68 0 214.15-63.9 214.15-157.44 0-63.66-53.37-94.14-56.1-94.14-10.42 54.62-38.36 146.5-161.01 146.5-71.46 0-133.07-49.47-133.07-114.29 0-92.56 87.61-126.06 156.8-126.06 25.91 0 57.18 1.75 73.46 5.07 0-28.21-23.81-76.49-83.96-76.49-55.15-.01-69.14 17.92-86.84 38.39zm105.8 96.25c-90.13 0-101.79 38.51-101.79 62.7 0 38.86 46.07 51.74 70.65 51.74 45.06 0 91.35-12.52 98.63-107.31-22.85-5.14-39.88-7.13-67.49-7.13z" />
    </svg>
  );
}
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

type BuildUrlFn = (url: string, title: string) => string;

const SHARE_NETWORKS: {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  buildUrl: BuildUrlFn;
}[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    buildUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    Icon: Facebook,
    buildUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "X",
    Icon: XIcon,
    buildUrl: (url, title) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    Icon: Send,
    buildUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "email",
    label: "Email",
    Icon: Mail,
    buildUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${title}\n\n${url}`
      )}`,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    Icon: PinterestIcon,
    buildUrl: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        url
      )}&description=${encodeURIComponent(title)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    Icon: RedditIcon,
    buildUrl: (url, title) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title)}`,
  },
  {
    id: "threads",
    label: "Threads",
    Icon: ThreadsIcon,
    buildUrl: (url, title) =>
      `https://www.threads.net/intent/post?text=${encodeURIComponent(
        `${title} ${url}`
      )}`,
  },
];

export type CardShareProps = {
  /** Título del card. Por defecto "Acciones". */
  title?: string;
  /** URL absoluta o path para compartir. */
  shareUrl?: string;
  /** Título para el share (opcional). */
  shareTitle?: string;
  /** Si está likeado por el usuario actual. */
  liked?: boolean;
  /** Número de likes a mostrar. */
  likeCount?: number;
  /** Callback al dar like (ej. server action). */
  onLike?: () => void | Promise<void>;
  /** Mostrar solo compartir, solo like, o ambos. */
  variant?: "share" | "like" | "both";
  className?: string;
};

export function CardShare({
  title = "Compartir en",
  shareUrl,
  shareTitle,
  variant = "both",
  className,
}: CardShareProps) {
  const [copied, setCopied] = useState(false);

  const getShareContext = () => {
    const url =
      shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");
    const title =
      shareTitle ?? (typeof document !== "undefined" ? document.title : "");
    return { url, title };
  };

  const handleShareNetwork = (buildUrl: BuildUrlFn) => {
    const { url, title } = getShareContext();
    window.open(buildUrl(url, title), "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const { url } = getShareContext();
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: open same window with url so user can copy
      window.open(url, "_blank");
    }
  };

  return (
    <Card size="sm" className={cn(className, "overflow-visible")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {(variant === "share" || variant === "both") && (
          <div className="flex flex-wrap gap-2">
            {SHARE_NETWORKS.map(({ id, label, Icon, buildUrl }) => (
              <Button
                key={id}
                variant="secondary"
                size="icon-lg"
                aria-label={label}
                data-tooltip={label}
                className="relative group"
                onClick={() => handleShareNetwork(buildUrl)}
              >
                <Icon className="size-5" />
                <span className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Button>
            ))}
            <Button
              variant="secondary"
              size="icon-lg"
              aria-label={copied ? "Copiado" : "Copiar enlace"}
              data-tooltip={copied ? "Copiado" : "Copiar enlace"}
              className="relative group"
              onClick={handleCopyLink}
            >
              <Link2 className="size-5" />
              <span className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                {copied ? "Copiado" : "Copiar enlace"}
              </span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
