import { NextRequest, NextResponse } from "next/server";
import { getFarmaciasTurnoHoy } from "@/services/farmacias-turno";
import { extractFarmaciaInfo } from "@/services/farmacias-turno";
import { fetchBarcaza } from "@/services/barcaza";
import { sendPushToAllSubscriptions } from "@/lib/push";

const BASE_URL = "https://mitdf.com.ar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Cron: call with ?type=farmacias (mañana) or ?type=barcaza (tarde). Protect with Authorization: Bearer <CRON_SECRET>. */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");
  if (type !== "farmacias" && type !== "barcaza") {
    return NextResponse.json(
      { error: "Use ?type=farmacias or ?type=barcaza" },
      { status: 400 }
    );
  }

  if (type === "farmacias") {
    const eventos = await getFarmaciasTurnoHoy();
    const lines = eventos.slice(0, 3).map((e) => {
      const { nombre } = extractFarmaciaInfo(e.summary);
      return `${e.ciudad}: ${nombre || e.summary}`;
    });
    const body =
      lines.length > 0
        ? lines.join(". ")
        : "Farmacia de turno hoy: sin datos actualizados.";
    const result = await sendPushToAllSubscriptions(
      {
        title: "Farmacia de turno hoy",
        body,
        url: `${BASE_URL}/farmacias`,
        tag: "mitdf-farmacias",
      },
      { farmacias: true }
    );
    return NextResponse.json({ ok: true, ...result });
  }

  if (type === "barcaza") {
    const data = await fetchBarcaza();
    let body = "Estado del cruce en barcaza.";
    if (data?.primera_angostura?.[0]) {
      const e = data.primera_angostura[0];
      const estado =
        e.estado === "8"
          ? "Operativo"
          : e.estado === "9"
            ? "Suspendido"
            : e.observaciones || "Sin detalle";
      body = `Barcaza Primera Angostura: ${estado}.`;
    }
    const result = await sendPushToAllSubscriptions(
      {
        title: "Estado barcaza",
        body,
        url: `${BASE_URL}/barcaza`,
        tag: "mitdf-barcaza",
      },
      { barcaza: true }
    );
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
