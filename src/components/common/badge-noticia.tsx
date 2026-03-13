import { Badge } from "@/components/ui/badge";

type Props = {
  badge: string | null | undefined;
  absolute?: boolean;
};

const LABELS: Record<string, string> = {
  URGENTE: "Urgente",
  EN_VIVO: "En vivo",
  ULTIMA_HORA: "Última hora",
  EXCLUSIVO: "Exclusivo",
  DESARROLLANDO: "En desarrollo",
  ACTUALIZADO: "Actualizado",
  VERIFICADO: "Verificado",
  INVESTIGACION: "Investigación",
  ARCHIVO: "Archivo",
  PREMIUM: "Premium",
};

export default function BadgeNoticia({ badge, absolute = true }: Props) {
  if (!badge) return null;

  const label = LABELS[badge] ?? badge;

  const base = <Badge variant="default">{label}</Badge>;

  if (!absolute) return base;

  return (
    <div className="pointer-events-none absolute left-2 bottom-2 z-10">
      {base}
    </div>
  );
}
