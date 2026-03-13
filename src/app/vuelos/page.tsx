import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vuelos",
  description:
    "Próximamente: información de vuelos desde y hacia Tierra del Fuego, con horarios y estado actualizado.",
};

export default function VuelosPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-serif font-semibold tracking-tight">
        Vuelos desde y hacia Tierra del Fuego
      </h1>
      <p className="text-sm text-muted-foreground">
        Estamos preparando un tablero con llegadas y salidas de vuelos para Ushuaia y Río Grande,
        con información clara y actualizada.
      </p>
    </section>
  );
}

