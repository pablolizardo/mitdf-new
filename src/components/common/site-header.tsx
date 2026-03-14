import Link from "next/link";
import SearchBar from "./search-bar";
import Logo from "./Logo";
import { CloudSun, NewspaperIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";
import { SunIcon } from "lucide-react";
import { ShipIcon } from "lucide-react";
import { Pill } from "lucide-react";
import LogoSmall from "./LogoSmall";
const navItems = [
  { href: "/", label: "Noticias", icon: <NewspaperIcon /> },

  // Clima: en mobile scroll a #clima-mobile, en desktop a #clima-desktop
  {
    href: "/#clima-mobile",
    label: "Clima",
    className: "md:hidden",
    icon: <CloudSun />,
  },
  {
    href: "/#clima-desktop",
    label: "Clima",
    className: "hidden md:flex",
    icon: <SunIcon />,
  },
  { href: "/barcaza", label: "Barcaza", icon: <ShipIcon /> },
  { href: "/farmacias", label: "Farmacias", icon: <Pill /> },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 bg-background/90 backdrop-blur-sm  z-50">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-2 md:gap-4 px-3 py-3 md:px-6 max-w-6xl lg:max-w-7xl lg:px-8">
        <div className="flex order-1 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-5 w-auto md:h-10">
              <Logo className="h-full w-auto hidden sm:block" />
              <LogoSmall className="h-full w-auto block sm:hidden -mt-0.5" />
            </div>
            {/* <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              noticias · servicios · comunidad
            </span> */}
          </Link>
        </div>
        <nav className="order-2 flex items-center md:order-3 gap-1 sm:gap-2 text-xs font-medium text-muted-foreground">
          {navItems.map((item) => {
            const isHash = item.href.includes("#");
            const className =
              `rounded-lg flex items-center  gap-1 md:gap-2.5 shrink-0 px-1 sm:px-2 md:px-4 py-2 md:text-md lg:text-base transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4  ${
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
                  <span className=""> {item.label}</span>
                </Link>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={className}>
                {item.icon}
                <span className=""> {item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="order-3 w-full min-w-full md:order-2 md:min-w-0 md:flex-1">
          <SearchBar />
        </div>
      </div>
      {/* <div className="border-t bg-muted/40 px-4 py-2 md:hidden">
        <div className="mx-auto max-w-6xl lg:max-w-7xl">
          <SearchBar />
        </div>
      </div> */}
    </header>
  );
}
