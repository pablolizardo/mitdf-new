import type { Metadata } from "next";
import { BarcazaCard } from "@/components/common/BarcazaCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Barcaza Tabsa · Horarios y estado de cruces",
  description:
    "Horarios y estado de la barcaza Tabsa (Transbordadora Austral Broom). Cruces Primera Angostura, Porvenir - Punta Arenas. Estado de cruces en tiempo real. Tierra del Fuego.",
  openGraph: {
    title: "Barcaza Tabsa · Horarios y estado de cruces | miTDF",
    description:
      "Horarios y estado de la barcaza Tabsa. Cruces Primera Angostura, Porvenir - Punta Arenas. Estado de cruces en tiempo real.",
    url: "https://mitdf.com.ar/barcaza",
  },
  alternates: { canonical: "https://mitdf.com.ar/barcaza" },
};

export default function BarcazaPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif font-semibold tracking-tight md:text-3xl">
          Barcaza: horarios y estado de cruces
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Estado actual de los cruces de la barcaza Tabsa (Transbordadora Austral
          Broom) en Primera Angostura y servicio Porvenir – Punta Arenas.
          La información se actualiza en tiempo real.
        </p>
      </header>

      <section aria-label="Estado de cruces">
        <BarcazaCard />
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
        <Link href="/farmacias" className="underline hover:text-foreground">
          Farmacias de turno
        </Link>
        ,{" "}
        <Link href="/vuelos" className="underline hover:text-foreground">
          Vuelos
        </Link>
      </p>
    </article>
  );
}
