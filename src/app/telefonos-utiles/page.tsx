import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teléfonos útiles",
  description:
    "Próximamente: teléfonos útiles y de emergencia de Tierra del Fuego, organizados por ciudad y tipo de servicio.",
};

export default function TelefonosUtilesPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-serif font-semibold tracking-tight">Teléfonos útiles</h1>
      <p className="text-sm text-muted-foreground">
        Muy pronto vas a encontrar acá teléfonos de emergencia, servicios públicos, guardias y
        contactos importantes para Tierra del Fuego.
      </p>
    </section>
  );
}

