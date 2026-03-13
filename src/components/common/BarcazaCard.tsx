import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchBarcaza } from "@/services/barcaza";
import type { BarcazaCruce, BarcazaEstadoSimple } from "@/services/types";
import { Clock, MapPin, Ship } from "lucide-react";

function getHora(cruce: BarcazaCruce): string {
  // usar hora de presentación como referencia principal
  if (cruce.presentacion) {
    return cruce.presentacion.split(" ")[1]?.slice(0, 5) ?? cruce.presentacion;
  }
  if (cruce.zarpeOriginal) {
    return cruce.zarpeOriginal.split(" ")[1]?.slice(0, 5) ?? cruce.zarpeOriginal;
  }
  return "—";
}

function getEstadoDetalle(cruce: BarcazaCruce): string {
  if (cruce.estado_detalle && typeof cruce.estado_detalle === "string") {
    return cruce.estado_detalle;
  }
  if (cruce.estado && typeof cruce.estado === "string") {
    if (cruce.estado === "8") return "Normal";
    if (cruce.estado === "9") return "Suspendido";
  }
  return "Sin información";
}

function getSentido(cruce: BarcazaCruce): string | null {
  const origen = cruce.origen;
  const destino = cruce.destino;
  const embarcadero = cruce.nombre_embarcadero;

  if (origen && destino) return `${origen} → ${destino}`;
  if (embarcadero) return embarcadero as string;
  return null;
}

function getEstadoVariant(estado: string): "default" | "secondary" | "outline" {
  const s = estado.toLowerCase();
  if (s.includes("normal") || s.includes("operativo")) return "secondary";
  if (s.includes("suspend") || s.includes("cerrad") || s.includes("no opera"))
    return "outline";
  return "default";
}

function getResumenEstadoCruce(estado?: BarcazaEstadoSimple[]): string | null {
  if (!estado || estado.length === 0) return null;
  const e = estado[0];
  if (e.estado === "8") return "Operativo";
  if (e.estado === "9") return "Suspendido";
  return null;
}

export async function BarcazaCard() {
  const data = await fetchBarcaza();

  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            Cruce en barcaza
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          No pudimos obtener el estado actual del cruce. Probá nuevamente en unos minutos.
        </CardContent>
      </Card>
    );
  }

  const estadoPrimera = getResumenEstadoCruce(data.primera_angostura);
  const proximos = data.data
    // priorizar cruces Porvenir–Punta Arenas
    .filter((c) => {
      const origen = (c.origen || "") as string;
      const destino = (c.destino || "") as string;
      return (
        origen.toLowerCase().includes("porvenir") ||
        destino.toLowerCase().includes("porvenir") ||
        origen.toLowerCase().includes("punta arenas") ||
        destino.toLowerCase().includes("punta arenas")
      );
    })
    .slice(0, 4);

  if (proximos.length === 0) {
    proximos.push(...data.data.slice(0, 4));
  }

  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Ship className="size-3.5" aria-hidden />
          Cruces de barcaza
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0 text-xs">
        {estadoPrimera && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Primera Angostura</span>
            <Badge
              variant={getEstadoVariant(estadoPrimera)}
              className="text-[11px] font-medium"
            >
              {estadoPrimera}
            </Badge>
          </div>
        )}
        <div className="space-y-1.5">
          {proximos.map((cruce, index) => {
            const hora = getHora(cruce);
            const estado = getEstadoDetalle(cruce);
            const sentido = getSentido(cruce);

            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="size-3" aria-hidden />
                    <span className="font-medium text-foreground">{hora}</span>
                  </div>
                  {sentido && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {sentido}
                    </p>
                  )}
                </div>
                <Badge
                  variant={getEstadoVariant(estado)}
                  className="shrink-0 text-[11px] font-medium"
                >
                  {estado}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

