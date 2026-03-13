import Link from "next/link";
import SearchBar from "./search-bar";
import Logo from "./Logo";
import { NewspaperIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";
import { SunIcon } from "lucide-react";
import { ShipIcon } from "lucide-react";
const navItems = [
  { href: "/", label: "Noticias", icon: <NewspaperIcon /> },
  {
    href: "/#ultimas-noticias",
    label: "Últimas noticias",
    icon: <ClockIcon />,
  },
  // Clima: en mobile scroll a #clima-mobile, en desktop a #clima-desktop
  {
    href: "/#clima-mobile",
    label: "Clima",
    className: "md:hidden",
    icon: <SunIcon />,
  },
  {
    href: "/#clima-desktop",
    label: "Clima",
    className: "hidden md:flex",
    icon: <SunIcon />,
  },
  {
    href: "/#barcaza-mobile",
    label: "Barcaza",
    className: "md:hidden",
    icon: <ShipIcon />,
  },
  {
    href: "/#barcaza-desktop",
    label: "Barcaza",
    className: "hidden md:flex",
    icon: <ShipIcon />,
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 bg-background/90 backdrop-blur-sm  z-50">
      <div className="mx-auto flex  max-w-6xl items-center justify-between gap-2 md:gap-4 px-4 py-3 md:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-5 w-auto md:h-10">
              <Logo className="h-full w-auto" />
            </div>
            {/* <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              noticias · servicios · comunidad
            </span> */}
          </Link>
        </div>
        <SearchBar />
        <nav className="flex items-center md:gap-1 text-xs font-medium text-muted-foreground">
          {navItems.map((item) => {
            const isHash = item.href.includes("#");
            const className =
              `rounded-lg flex items-center gap-1 shrink-0 px-2 md:px-4 py-2 md:text-md transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4  ${
                item.className ?? ""
              }`.trim();
            if (isHash) {
              return (
                <Link
                  key={`${item.href}-${item.className ?? ""}`}
                  href={item.href}
                  className={className}
                >
                  {item.icon}
                  <span className="hidden md:inline"> {item.label}</span>
                </Link>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={className}>
                {item.icon}
                <span className="hidden md:inline"> {item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* <div className="border-t bg-muted/40 px-4 py-2 md:hidden">
        <div className="mx-auto max-w-6xl lg:max-w-7xl">
          <SearchBar />
        </div>
      </div> */}
    </header>
  );
}
