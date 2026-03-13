import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Próximamente: agenda de eventos culturales, deportivos y comunitarios en Tierra del Fuego.",
};

export default function EventosPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-serif font-semibold tracking-tight">Eventos en Tierra del Fuego</h1>
      <p className="text-sm text-muted-foreground">
        En esta sección pronto vas a poder ver la agenda de eventos culturales, deportivos y
        comunitarios de toda la provincia, con información clara y actualizada.
      </p>
    </section>
  );
}

