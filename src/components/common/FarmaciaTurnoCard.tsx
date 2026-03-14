import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFarmaciasTurnoHoy,
  extractFarmaciaInfo,
  limpiarDireccion,
} from "@/services/farmacias-turno";
import { MapPin, Phone, Pill } from "lucide-react";

const CIUDADES_ORDEN: Array<"Río Grande" | "Tolhuin" | "Ushuaia"> = [
  "Río Grande",
  "Tolhuin",
  "Ushuaia",
];

export async function FarmaciaTurnoCard() {
  const eventosHoy = await getFarmaciasTurnoHoy();
  const porCiudad = new Map(eventosHoy.map((e) => [e.ciudad, e]));

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Pill className="size-3.5" aria-hidden />
          Farmacia de turno hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-0 text-xs">
        {CIUDADES_ORDEN.map((ciudad) => {
          const evento = porCiudad.get(ciudad);
          if (!evento) {
            return (
              <div
                key={ciudad}
                className="flex items-center justify-between border-b border-dashed py-2 last:border-b-0 text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3" aria-hidden />
                  {ciudad}
                </span>
                <span className="text-[11px]">Sin datos</span>
              </div>
            );
          }

          const { nombre, telefono } = extractFarmaciaInfo(evento.summary);
          const direccion = evento.location
            ? limpiarDireccion(evento.location)
            : null;

          return (
            <div
              key={ciudad}
              className="flex flex-col gap-1.5 border-b border-dashed py-2 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2 -mb-1">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3" aria-hidden />
                  {ciudad}
                </span>
              </div>
              <p className="text-base font-medium text-foreground pl-5 -mb-1">
                {nombre || evento.summary}
              </p>
              {direccion && (
                <p className="text-[11px] text-muted-foreground pl-5 truncate">
                  {direccion}
                </p>
              )}
              {telefono && (
                <a
                  href={`tel:${telefono.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground pl-5 hover:text-foreground"
                >
                  <Phone className="size-3" aria-hidden />
                  {telefono}
                </a>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
