import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Auspiciar",
  description:
    "Auspiciar miTDF. Contacto para publicidad y auspicios en el portal de noticias y servicios de Tierra del Fuego.",
  openGraph: {
    title: "Auspiciar | miTDF",
    description: "Contacto para auspicios y publicidad en miTDF.",
    url: "https://mitdf.com.ar/auspiciar",
  },
  alternates: { canonical: "https://mitdf.com.ar/auspiciar" },
};

export default function AuspiciarPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif font-semibold tracking-tight md:text-3xl">
          Auspiciar
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Si querés auspiciar miTDF o publicitar en el sitio, contactanos por
          e-mail o teléfono.
        </p>
      </header>

      <section className="space-y-4" aria-label="Contacto para auspicios">
        <div className="flex flex-col gap-2">
          <a
            href="mailto:info@mitdf.com.ar"
            className="inline-flex items-center gap-2 text-foreground underline hover:no-underline"
          >
            <Mail className="h-4 w-4 shrink-0" />
            info@mitdf.com.ar
          </a>
          <a
            href="tel:+542964579741"
            className="inline-flex items-center gap-2 text-foreground underline hover:no-underline"
          >
            <Phone className="h-4 w-4 shrink-0" />
            2964 579741
          </a>
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-t pt-4">
        Sitio creado por{" "}
        <a
          href="https://casaa.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          casaa.com.ar
        </a>
      </p>

      <p className="text-xs text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          Volver al inicio
        </Link>
        {" · "}
        <Link href="/contacto" className="underline hover:text-foreground">
          Contacto
        </Link>
        {" · "}
        <Link href="/faq" className="underline hover:text-foreground">
          Preguntas frecuentes
        </Link>
      </p>
    </article>
  );
}
