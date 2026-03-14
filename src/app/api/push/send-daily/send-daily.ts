import { getFarmaciasTurnoHoy } from "@/services/farmacias-turno";
import { extractFarmaciaInfo } from "@/services/farmacias-turno";
import { fetchBarcaza } from "@/services/barcaza";
import { sendPushToAllSubscriptions } from "@/lib/push";

const BASE_URL = "https://mitdf.com.ar";

export async function sendFarmaciasNotification() {
  const eventos = await getFarmaciasTurnoHoy();
  const lines = eventos.slice(0, 3).map((e) => {
    const { nombre } = extractFarmaciaInfo(e.summary);
    return `${e.ciudad}: ${nombre || e.summary}`;
  });
  const body =
    lines.length > 0
      ? lines.join(". ")
      : "Farmacia de turno hoy: sin datos actualizados.";
  return sendPushToAllSubscriptions(
    {
      title: "Farmacia de turno hoy",
      body,
      url: `${BASE_URL}/farmacias`,
      tag: "mitdf-farmacias",
    },
    { farmacias: true }
  );
}

export async function sendBarcazaNotification() {
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
  return sendPushToAllSubscriptions(
    {
      title: "Estado barcaza",
      body,
      url: `${BASE_URL}/barcaza`,
      tag: "mitdf-barcaza",
    },
    { barcaza: true }
  );
}
