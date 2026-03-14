import type { Metadata } from "next";
import { FarmaciaTurnoCard } from "@/components/common/FarmaciaTurnoCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Farmacias de turno · Río Grande, Ushuaia y Tolhuin",
  description:
    "Farmacia de turno hoy en Río Grande, Ushuaia y Tolhuin. Consultá qué farmacia atiende en Tierra del Fuego. Dirección y teléfono actualizados.",
  openGraph: {
    title: "Farmacias de turno en Tierra del Fuego | miTDF",
    description:
      "Farmacia de turno hoy en Río Grande, Ushuaia y Tolhuin. Dirección y teléfono.",
    url: "https://mitdf.com.ar/farmacias",
  },
  alternates: { canonical: "https://mitdf.com.ar/farmacias" },
};

export default function FarmaciasPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif font-semibold tracking-tight md:text-3xl">
          Farmacias de turno en Tierra del Fuego
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Farmacia de turno hoy en <strong>Río Grande</strong>,{" "}
          <strong>Ushuaia</strong> y <strong>Tolhuin</strong>. Consultá qué
          farmacia atiende las 24 horas y su dirección y teléfono.
        </p>
      </header>

      <section
        aria-label="Farmacia de turno por ciudad"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="sm:col-span-2 lg:col-span-3 max-w-xl">
          <FarmaciaTurnoCard />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          Volver al inicio
        </Link>
        {" · "}
        Más servicios:{" "}
        <Link href="/clima" className="underline hover:text-foreground">
          Clima
        </Link>
        ,{" "}
        <Link href="/barcaza" className="underline hover:text-foreground">
          Barcaza
        </Link>
        ,{" "}
        <Link href="/vuelos" className="underline hover:text-foreground">
          Vuelos
        </Link>
      </p>
    </article>
  );
}
