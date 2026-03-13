import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.senado.gob.ar",
      },
      {
        protocol: "https",
        hostname: "www.diputados.gov.ar",
      },
      {
        protocol: "https",
        hostname: "parlamentaria.hcdn.gob.ar",
      },
      {
        protocol: "https",
        hostname: "concejoriogrande.gob.ar",
      },
      {
        protocol: "https",
        hostname: "www.concejoushuaia.gob.ar",
      },
      {
        protocol: "https",
        hostname: "concejodeliberantetolhuin.gob.ar",
      },
      {
        protocol: "https",
        hostname: "www.legistdf.gob.ar",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
