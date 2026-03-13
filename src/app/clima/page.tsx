import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clima en Tierra del Fuego",
  description:
    "Próximamente: pronóstico del tiempo en Ushuaia, Río Grande y Tolhuin directamente en miTDF.",
};

export default function ClimaPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-serif font-semibold tracking-tight">
        Clima en Tierra del Fuego
      </h1>
      <p className="text-sm text-muted-foreground">
        Estamos trabajando en un módulo de clima en tiempo real para Ushuaia, Río Grande y Tolhuin.
        Muy pronto vas a poder ver temperatura, viento, sensación térmica y pronóstico extendido
        directamente acá.
      </p>
    </section>
  );
}

