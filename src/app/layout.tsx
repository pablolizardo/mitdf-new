import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import { SiteFooter } from "../components/common/site-footer";
import { SiteHeader } from "../components/common/site-header";
import Script from "next/script";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "miTDF";
const siteDescription =
  "Portal de noticias y servicios locales de Tierra del Fuego: actualidad, clima, colectivos, teléfonos útiles, vuelos y más.";
const siteUrl = new URL("https://mitdf.com.ar");
const baseUrl = "https://mitdf.com.ar";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: baseUrl,
  logo: `${baseUrl}/icon-512.png`,
  description: siteDescription,
  sameAs: ["https://twitter.com/mitdf"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: baseUrl,
  description: siteDescription,
  publisher: { "@id": `${baseUrl}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/buscar/{search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  title: {
    template: `${siteName} · %s`,
    default: `${siteName} · Noticias y servicios de Tierra del Fuego`,
  },
  description: siteDescription,
  metadataBase: siteUrl,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    siteName,
    type: "website",
    url: siteUrl,
    title: `${siteName} · Noticias y servicios de Tierra del Fuego`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} · Noticias y servicios de Tierra del Fuego`,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={cn("scroll-smooth font-serif", robotoSlab.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ ...organizationSchema, "@id": `${baseUrl}/#organization` }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SY9K6WPFVK"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: ` window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-SY9K6WPFVK');`,
          }}
        />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 mx-auto max-w-6xl px-4  md:px-6 py-2 lg:max-w-7xl lg:px-8">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
