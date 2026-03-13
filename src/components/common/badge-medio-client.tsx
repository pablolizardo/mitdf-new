import { Badge } from "@/components/ui/badge";

type Props = {
  medio: string | null | undefined;
  absolute?: boolean;
};

export default function BadgeMedio({ medio, absolute = true }: Props) {
  if (!medio) return null;

  const base = <Badge variant="outline">{medio}</Badge>;

  if (!absolute) return base;

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10">
      {base}
    </div>
  );
}
