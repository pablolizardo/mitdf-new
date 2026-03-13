import { Badge } from "@/components/ui/badge";

type Props = {
  categoria: string | null | undefined;
  absolute?: boolean;
};

export default function BadgeCategoria({ categoria, absolute = true }: Props) {
  if (!categoria) return null;

  const base = <Badge variant="secondary">{categoria}</Badge>;

  if (!absolute) return base;

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-10">{base}</div>
  );
}
