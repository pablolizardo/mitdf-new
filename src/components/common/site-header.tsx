import Link from "next/link";
import LogoSmall from "./LogoSmall";
import SearchBar from "./search-bar";
import Logo from "./Logo";

const navItems = [
  { href: "/", label: "Noticias" },
  // { href: "/clima", label: "Clima" },
  // { href: "/colectivos", label: "Colectivos" },
  // { href: "/vuelos", label: "Vuelos" },
  // { href: "/telefonos-utiles", label: "Teléfonos útiles" },
  // { href: "/eventos", label: "Eventos" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background/90 backdrop-blur-sm relative z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-auto md:h-10">
              <Logo className="h-full w-auto" />
            </div>
            {/* <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              noticias · servicios · comunidad
            </span> */}
          </Link>
        </div>
        {/* <div className="hidden flex-1 items-center justify-center md:flex"> */}
        {/* <div className="w-full max-w-xl"> */}
        <SearchBar />
        {/* </div> */}
        {/* </div> */}
        <nav className="hidden _md:_flex items-center gap-4 text-xs font-medium text-muted-foreground ">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t bg-muted/40 px-4 py-2 md:hidden">
        <div className="mx-auto max-w-6xl lg:max-w-7xl">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
