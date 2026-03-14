import Link from "next/link";
import { PushNotificationsPrompt } from "./push-notifications-prompt";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between md:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">
            miTDF · Tierra del Fuego
          </p>
          <p>
            Noticias, servicios y datos útiles para quienes viven y visitan la
            provincia.
          </p>
          <div className="mt-2">
            <PushNotificationsPrompt />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contacto"
            className="transition-colors hover:text-foreground"
          >
            Contacto
          </Link>
          <Link
            href="/auspiciar"
            className="transition-colors hover:text-foreground"
          >
            Auspiciar
          </Link>
          <Link href="/faq" className="transition-colors hover:text-foreground">
            Preguntas frecuentes
          </Link>
          <span className="opacity-60">© {new Date().getFullYear()} miTDF</span>
        </div>
      </div>
    </footer>
  );
}
