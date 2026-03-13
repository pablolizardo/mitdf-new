import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchClimaWttrWithFallback,
  type ClimaWttr,
} from "@/services/clima-wttr";
import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getWeatherIcon(code: number, text: string): LucideIcon {
  const t = text.toLowerCase();
  if (code === 1000 || t.includes("despejado") || t.includes("clear"))
    return Sun;
  if (code === 1003 || t.includes("parcial") || t.includes("partly"))
    return Cloud;
  if (
    code === 1006 ||
    code === 1009 ||
    t.includes("nublado") ||
    t.includes("cloudy") ||
    t.includes("overcast")
  )
    return Cloud;
  if (
    code === 1063 ||
    code === 1150 ||
    code === 1180 ||
    code === 1183 ||
    t.includes("lluvia") ||
    t.includes("rain") ||
    t.includes("drizzle")
  )
    return CloudRain;
  if (
    code === 1066 ||
    code === 1219 ||
    code === 1222 ||
    code === 1225 ||
    t.includes("nieve") ||
    t.includes("snow")
  )
    return CloudSnow;
  if (
    code === 1087 ||
    code === 1273 ||
    code === 1276 ||
    t.includes("tormenta") ||
    t.includes("thunder") ||
    t.includes("storm")
  )
    return CloudLightning;
  if (
    code === 1030 ||
    code === 1135 ||
    t.includes("niebla") ||
    t.includes("fog") ||
    t.includes("mist") ||
    t.includes("neblina")
  )
    return CloudFog;
  return Cloud;
}

const WEATHER_ES: Record<string, string> = {
  clear: "Despejado",
  sunny: "Soleado",
  "partly cloudy": "Parcialmente nublado",
  "partly cloud": "Parcialmente nublado",
  cloudy: "Nublado",
  overcast: "Cubierto",
  mist: "Neblina",
  fog: "Niebla",
  foggy: "Con niebla",
  "patchy rain": "Lluvia aislada",
  "patchy rain possible": "Posible lluvia aislada",
  "light rain": "Lluvia leve",
  "moderate rain": "Lluvia moderada",
  "heavy rain": "Lluvia fuerte",
  "light drizzle": "Llovizna",
  drizzle: "Llovizna",
  "freezing drizzle": "Llovizna helada",
  "patchy snow": "Nieve aislada",
  "light snow": "Nieve leve",
  "moderate snow": "Nieve moderada",
  "heavy snow": "Nieve fuerte",
  blizzard: "Ventisca",
  "patchy sleet": "Aguanieve aislada",
  "thundery outbreaks": "Tormentas aisladas",
  thunderstorm: "Tormenta",
  thunderstorms: "Tormentas",
  storm: "Tormenta",
  "blowing snow": "Nieve con viento",
  "ice pellets": "Granizo",
  visibility: "Visibilidad reducida",
};

function translateWeatherToSpanish(text: string): string {
  if (!text || typeof text !== "string") return "—";
  const key = text.toLowerCase().trim();
  if (WEATHER_ES[key]) return WEATHER_ES[key];
  for (const [en, es] of Object.entries(WEATHER_ES)) {
    if (key.includes(en)) return es;
  }
  return text;
}

const LOCATIONS = [
  "ushuaia, tierra del fuego",
  "rio grande, tierra del fuego",
  "tolhuin, tierra del fuego",
  "antartida",
  "islas malvinas argentinas, tierra del fuego",
] as const;

type LocationKey = (typeof LOCATIONS)[number];

type WeatherSummary = {
  key: LocationKey;
  label: string;
  data: ClimaWttr | null;
};

const LABELS: Record<LocationKey, string> = {
  "ushuaia, tierra del fuego": "Ushuaia",
  "rio grande, tierra del fuego": "Río Grande",
  "tolhuin, tierra del fuego": "Tolhuin",
  antartida: "Antártida",
  "islas malvinas argentinas, tierra del fuego": "Islas Malvinas",
};

async function getWeathers(): Promise<WeatherSummary[]> {
  const results = await Promise.all(
    LOCATIONS.map(async (key) => {
      const data = await fetchClimaWttrWithFallback(key);
      return {
        key,
        label: LABELS[key],
        data,
      };
    })
  );

  return results;
}

export async function WeatherCard() {
  const weathers = await getWeathers();

  const hasAny = weathers.some((w) => w.data);
  if (!hasAny) {
    return null;
  }

  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Cloud className="size-3.5" aria-hidden />
          Clima en la provincia
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 pt-0 ">
        {weathers.map(({ key, label, data }) => {
          if (!data) {
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3" aria-hidden />
                  {label}
                </span>
                <span className="text-[11px]">Sin datos</span>
              </div>
            );
          }

          const temp = Math.round(data.current.temp_c);
          const feels = Math.round(data.current.feelslike_c);
          const wind = Math.round(data.current.wind_kph);
          const descRaw = data.current.condition.text;
          const desc = translateWeatherToSpanish(descRaw);
          const ConditionIcon = getWeatherIcon(
            data.current.condition.code,
            descRaw
          );

          return (
            <div
              key={key}
              className="flex flex-col gap-1.5 border-b border-dashed pb-2 last:border-b-0 last:pb-0 text-xs relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3" aria-hidden />
                  {label}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Thermometer className="size-3" aria-hidden />
                  <span className="font-semibold text-foreground">
                    {temp}°C
                  </span>
                  <span className="opacity-70">sensación {feels}°C</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wind className="size-3" aria-hidden />
                  {wind} km/h
                </span>
                <span className="truncate">
                  Humedad {data.current.humidity}%
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 mt-0.5 absolute bottom-0 right-0 top-0 inset-y-0">
                <ConditionIcon className="size-8 shrink-0" aria-hidden />
                <span className="text-[11px] text-muted-foreground">
                  {" "}
                  {desc}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
