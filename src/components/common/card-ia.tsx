import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ExternalLink, Library, Search, ShieldCheck, Sparkles, Youtube, Zap } from 'lucide-react';

type SearchLink = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

function buildSearchLinks(name: string): SearchLink[] {
  const q = encodeURIComponent(name);
  return [
    { label: 'Google', icon: <Search className="size-4" />, href: `https://www.google.com/search?q=${q}` },
    { label: 'YouTube', icon: <Youtube className="size-4" />, href: `https://www.youtube.com/results?search_query=${q}` },
    { label: 'Wikipedia', icon: <Library className="size-4" />, href: `https://es.wikipedia.org/w/index.php?search=${q}` },
    { label: 'ChatGPT', icon: <Bot className="size-4" />, href: `https://chatgpt.com/?q=${q}` },
    { label: 'Copilot', icon: <Sparkles className="size-4" />, href: `https://www.bing.com/search?q=${q}&showconv=1` },
    { label: 'Perplexity', icon: <Zap className="size-4" />, href: `https://www.perplexity.ai/search?q=${q}` },
    { label: 'DuckDuckGo', icon: <ShieldCheck className="size-4" />, href: `https://duckduckgo.com/?q=${q}` },
  ];
}

type Props = {
  name: string;
  description?: string;
};

export function SearchWebCard({ name, description }: Props) {
  const links = buildSearchLinks(name);
  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Search className="size-3.5" aria-hidden />
          Buscar más sobre
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-wrap gap-2">
          {links.map(({ label, icon, href }) => (
            <Button key={label} asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {icon}
                {label}
                <ExternalLink className="size-3 opacity-60" />
              </a>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {description ?? `La información en la web puede no ser siempre confiable.`}
        </p>
      </CardContent>
    </Card>
  );
}
