import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchClimaWttrWithFallback,
  type ClimaWttr,
} from "@/services/clima-wttr";
import { Cloud, MapPin, Thermometer, Wind } from "lucide-react";

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
          const desc = data.current.condition.text;

          return (
            <div
              key={key}
              className="flex flex-col gap-1.5 border-b border-dashed pb-2 last:border-b-0 last:pb-0 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3" aria-hidden />
                  {label}
                </span>
                <Badge variant="outline" className="text-[11px] font-medium">
                  {desc}
                </Badge>
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
