import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/services/faq";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Preguntas frecuentes sobre miTDF y los servicios de Tierra del Fuego.",
  openGraph: {
    title: "Preguntas frecuentes | miTDF",
    description: "Respuestas a las preguntas más frecuentes sobre miTDF.",
    url: "https://mitdf.com.ar/faq",
  },
  alternates: { canonical: "https://mitdf.com.ar/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif font-semibold tracking-tight md:text-3xl">
          Preguntas frecuentes
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Respuestas a las consultas más habituales sobre miTDF y los servicios
          de la provincia.
        </p>
      </header>

      {faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Por el momento no hay preguntas frecuentes publicadas.
        </p>
      ) : (
        <section
          className="space-y-2"
          aria-label="Listado de preguntas frecuentes"
        >
          {faqs.map((faq) => (
            <details
              key={faq.id}
              id={faq.id}
              className="group rounded-lg border bg-card px-4 py-3 text-card-foreground shadow-sm"
            >
              <summary className="cursor-pointer list-none font-medium marker:contents [&::-webkit-details-marker]:hidden">
                {faq.pregunta}
              </summary>
              <div className="mt-3 border-t pt-3 text-sm text-muted-foreground [&_a]:underline [&_a]:hover:text-foreground">
                <div
                  className="prose prose-sm max-w-none prose-p:my-2"
                  dangerouslySetInnerHTML={{
                    __html: faq.respuesta.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            </details>
          ))}
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          Volver al inicio
        </Link>
        {" · "}
        <Link href="/contacto" className="underline hover:text-foreground">
          Contacto
        </Link>
        {" · "}
        <Link href="/auspiciar" className="underline hover:text-foreground">
          Auspiciar
        </Link>
      </p>
    </article>
  );
}
