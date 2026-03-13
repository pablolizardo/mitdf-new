import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colectivos y recorridos",
  description:
    "Próximamente: recorridos y horarios de colectivos urbanos en Ushuaia y Río Grande.",
};

export default function ColectivosPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-serif font-semibold tracking-tight">
        Colectivos y recorridos
      </h1>
      <p className="text-sm text-muted-foreground">
        En breve vas a poder consultar acá los recorridos, horarios y frecuencias de los colectivos
        urbanos en las principales ciudades de Tierra del Fuego.
      </p>
    </section>
  );
}

