"use client";
import {
  Loader,
  Search,
  MapPin,
  Clock,
  Plane,
  Phone,
  DollarSign,
  FileText,
  Building2,
  Ship,
  Archive,
  TrendingUp,
  Bus,
  Users,
  Video,
  BarChart3,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { KeyboardEvent, useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
}

const CIUDADES = [
  { value: "ushuaia", label: "Ushuaia", slug: "ushuaia" },
  { value: "rio grande", label: "Río Grande", slug: "rio-grande" },
  { value: "tolhuin", label: "Tolhuin", slug: "tolhuin" },
];

type SuggestionType =
  | "farmacia"
  | "vuelo"
  | "clima"
  | "frontera"
  | "cambio"
  | "telefono"
  | "documentos"
  | "noticia"
  | "directorio"
  | "barcaza"
  | "archivo"
  | "auspiciar"
  | "colectivos"
  | "representantes"
  | "camaras"
  | "encuestas"
  | "informes"
  | "faq";

interface SmartSuggestion {
  text: string;
  url: string;
  icon: React.ReactNode;
  type: SuggestionType;
}

const TYPE_COLORS: Record<SuggestionType, string> = {
  farmacia: "text-red-500",
  vuelo: "text-blue-500",
  clima: "text-cyan-500",
  frontera: "text-orange-500",
  cambio: "text-green-500",
  telefono: "text-purple-500",
  documentos: "text-indigo-500",
  noticia: "text-gray-500",
  directorio: "text-amber-500",
  barcaza: "text-teal-500",
  archivo: "text-slate-500",
  auspiciar: "text-pink-500",
  colectivos: "text-lime-500",
  representantes: "text-violet-500",
  camaras: "text-rose-500",
  encuestas: "text-yellow-500",
  informes: "text-emerald-500",
  faq: "text-sky-500",
};

const ROTATING_PLACEHOLDERS = [
  "Buscar noticias...",
  "Farmacias de turno en...",
  "Vuelo a...",
  "¿Cuál es el clima en...?",
  "Colectivos en...",
  "Directorio de...",
  "Representantes...",
  "Cámaras en vivo...",
  "Estado de la barcaza...",
  "¿A cuánto está el cambio?",
  "Teléfonos útiles en...",
  "Encuestas...",
  "Informes...",
];

const getColoredIcon = (
  IconComponent: React.ComponentType<{ className?: string }>,
  type: SuggestionType
) => {
  return <IconComponent className={`w-4 h-4 ${TYPE_COLORS[type]}`} />;
};

const generateSuggestions = (
  query: string,
  faqs: FAQ[] = []
): SmartSuggestion[] => {
  const normalized = query.toLowerCase().trim();
  const suggestions: SmartSuggestion[] = [];

  if (normalized.length < 2) return suggestions;

  const farmaciaPatterns = [
    "farmacia",
    "farmacias",
    "turno",
    "guardia",
    "medicamento",
    "medicamentos",
    "remedio",
    "remedios",
    "drogueria",
    "droguería",
    "farmaceutico",
    "farmacéutico",
    "farmaceutica",
    "farmacéutica",
    "guardia farmaceutica",
    "guardia farmacéutica",
  ];
  const vueloPatterns = [
    "vuelo",
    "vuelos",
    "llegada",
    "llega",
    "arribo",
    "partida",
    "aeropuerto",
    "volar",
    "aerolineas",
    "aerolíneas",
    "aerolinea",
    "aerolínea",
    "avion",
    "avión",
    "aviones",
    "despegue",
    "aterrizaje",
    "horario vuelo",
    "horarios vuelo",
    "estado vuelo",
    "vuelo salida",
    "vuelo llegada",
    "vuelo arribo",
    "vuelo partida",
  ];
  const climaPatterns = [
    "clima",
    "tiempo",
    "temperatura",
    "pronostico",
    "pronóstico",
    "meteorologia",
    "meteorología",
    "lluvia",
    "lluvias",
    "nieve",
    "viento",
    "soleado",
    "nublado",
    "precipitaciones",
    "humedad",
    "sensacion termica",
    "sensación térmica",
    "condiciones climaticas",
    "condiciones climáticas",
  ];
  const fronteraPatterns = [
    "frontera",
    "chile",
    "paso",
    "abierta",
    "hora",
    "barcaza",
    "cruzar frontera",
    "pasar chile",
    "paso fronterizo",
    "aduana",
    "migraciones",
    "control fronterizo",
    "horario frontera",
    "frontera abierta",
    "frontera cerrada",
  ];
  const cambioPatterns = [
    "cambio",
    "dolar",
    "sale",
    "shopping",
    "dólar",
    "peso",
    "moneda",
    "cotizacion",
    "cotización",
    "cotizar",
    "precio dolar",
    "precio dólar",
    "valor dolar",
    "valor dólar",
    "tipo cambio",
    "cambio moneda",
    "dolar blue",
    "dólar blue",
    "dolar oficial",
    "dólar oficial",
    "euro",
    "real",
    "divisa",
    "divisas",
  ];
  const telefonoPatterns = [
    "telefono",
    "teléfono",
    "telefonos",
    "teléfonos",
    "defensa civil",
    "emergencia",
    "numero",
    "número",
    "contacto",
    "llamar",
    "llamada",
    "comunicarse",
    "comunicacion",
    "comunicación",
    "telefono util",
    "teléfono útil",
    "telefonos utiles",
    "teléfonos útiles",
    "emergencias",
    "urgencia",
    "urgencias",
    "bomberos",
    "policia",
    "policía",
    "hospital",
    "ambulancia",
  ];
  const documentosPatterns = [
    "documento",
    "documentos",
    "pasaporte",
    "dni",
    "chile",
    "necesito",
    "requisitos",
    "requisito",
    "papeles",
    "papel",
    "identidad",
    "cedula",
    "cédula",
    "licencia",
    "permiso",
    "visa",
    "requisitos chile",
    "documentos chile",
    "pasar chile",
    "cruzar chile",
    "viajar chile",
  ];
  const directorioPatterns = [
    "directorio",
    "profesional",
    "servicio",
    "oficio",
    "maestro",
    "plomero",
    "electricista",
    "carpintero",
    "albañil",
    "pintor",
    "gasista",
    "tecnico",
    "técnico",
    "ingeniero",
    "arquitecto",
    "abogado",
    "medico",
    "médico",
    "dentista",
    "veterinario",
    "contador",
    "contadora",
    "buscar profesional",
    "encontrar profesional",
    "servicios",
    "servicio tecnico",
    "servicio técnico",
  ];
  const barcazaPatterns = [
    "barcaza",
    "soapex",
    "seguro",
    "documentacion",
    "ferry",
    "cruzar",
    "cruce",
    "barco",
    "embarcacion",
    "embarcación",
    "transbordador",
    "ferryboat",
    "cruzar barcaza",
    "horario barcaza",
    "estado barcaza",
    "barcaza horario",
    "barcaza estado",
    "cruzar fuego",
    "cruzar tierra del fuego",
  ];
  const archivoPatterns = [
    "archivo",
    "historico",
    "histórico",
    "pasado",
    "antiguo",
    "viejo",
    "noticias viejas",
    "noticias antiguas",
    "noticias pasadas",
    "noticias historicas",
    "noticias históricas",
    "buscar noticias",
    "noticias anteriores",
    "noticias anteriores",
    "fecha",
    "fechas",
    "calendario noticias",
  ];
  const auspiciarPatterns = [
    "auspiciar",
    "publicidad",
    "publicitar",
    "anuncio",
    "ad",
    "sponsor",
    "patrocinio",
    "patrocinar",
    "publicitarse",
    "anunciarse",
    "publicidad sitio",
    "publicidad web",
    "banner",
    "banners",
    "advertising",
    "marketing",
    "promocion",
    "promoción",
    "promocionar",
  ];
  const colectivosPatterns = [
    "colectivo",
    "colectivos",
    "bus",
    "buses",
    "transporte",
    "linea",
    "línea",
    "recorrido",
    "transporte publico",
    "transporte público",
    "micro",
    "micros",
    "omnibus",
    "ómnibus",
    "horario colectivo",
    "horarios colectivo",
    "recorrido colectivo",
    "parada",
    "paradas",
    "colectivo horario",
    "colectivo recorrido",
  ];
  const representantesPatterns = [
    "representante",
    "representantes",
    "concejal",
    "concejales",
    "diputado",
    "diputados",
    "senador",
    "senadores",
    "legislador",
    "legisladores",
    "politico",
    "político",
    "politicos",
    "políticos",
    "funcionario",
    "funcionarios",
    "publico",
    "público",
    "gobierno",
    "autoridad",
    "autoridades",
    "mandatario",
    "mandatarios",
    "elegido",
    "elegidos",
    "cargo publico",
    "cargo público",
  ];
  const camarasPatterns = [
    "camara",
    "cámara",
    "camaras",
    "cámaras",
    "video",
    "vivo",
    "live",
    "stream",
    "transmision",
    "transmisión",
    "en vivo",
    "directo",
    "streaming",
    "webcam",
    "webcams",
    "camara en vivo",
    "cámara en vivo",
    "ver en vivo",
    "ver directo",
    "transmision en vivo",
    "transmisión en vivo",
  ];
  const encuestasPatterns = [
    "encuesta",
    "encuestas",
    "pulso",
    "votar",
    "voto",
    "opinion",
    "opinión",
    "votacion",
    "votación",
    "consulta",
    "consultas",
    "sondeo",
    "sondeos",
    "participar",
    "participacion",
    "participación",
    "pregunta",
    "preguntas",
    "respuesta",
    "respuestas",
    "opinar",
    "votar encuesta",
  ];
  const informesPatterns = [
    "informe",
    "informes",
    "reporte",
    "analisis",
    "análisis",
    "estudio",
    "whitepaper",
    "investigacion",
    "investigación",
    "investigar",
    "datos",
    "estadisticas",
    "estadísticas",
    "estadistica",
    "estadística",
    "reportes",
    "analizar",
    "estudiar",
    "investigacion",
    "investigación",
    "documento",
    "documentos tecnicos",
    "documentos técnicos",
  ];

  const detectCity = (
    text: string
  ): { city: (typeof CIUDADES)[0] | null; remaining: string } => {
    const cityVariations: Record<string, string[]> = {
      ushuaia: ["ushuaia", "ush"],
      "rio grande": ["rio grande", "riogrande", "rio grande", "rg"],
      tolhuin: ["tolhuin", "tol"],
    };

    for (const ciudad of CIUDADES) {
      const variations = cityVariations[ciudad.value] || [ciudad.value];
      for (const variation of variations) {
        if (text.includes(variation)) {
          return {
            city: ciudad,
            remaining: text.replace(variation, "").trim(),
          };
        }
      }
    }
    return { city: null, remaining: text };
  };

  const { city, remaining } = detectCity(normalized);

  const matchesPattern = (patterns: string[], text: string): boolean => {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    return patterns.some((pattern) => {
      const patternLower = pattern.toLowerCase();
      // Coincidencia completa (como antes)
      if (text.includes(patternLower)) return true;
      // Alguna palabra del query comienza con el patrón
      if (
        words.some(
          (word) => word.startsWith(patternLower) && patternLower.length >= 3
        )
      )
        return true;
      // El patrón comienza con alguna palabra del query (mínimo 3 caracteres)
      if (
        words.some((word) => patternLower.startsWith(word) && word.length >= 3)
      )
        return true;
      return false;
    });
  };

  const hasFarmacia = matchesPattern(farmaciaPatterns, normalized);
  const hasVuelo = matchesPattern(vueloPatterns, normalized);
  const hasClima = matchesPattern(climaPatterns, normalized);
  const hasFrontera = matchesPattern(fronteraPatterns, normalized);
  const hasCambio = matchesPattern(cambioPatterns, normalized);
  const hasTelefono = matchesPattern(telefonoPatterns, normalized);
  const hasDocumentos = matchesPattern(documentosPatterns, normalized);
  const hasDirectorio = matchesPattern(directorioPatterns, normalized);
  const hasBarcaza = matchesPattern(barcazaPatterns, normalized);
  const hasArchivo = matchesPattern(archivoPatterns, normalized);
  const hasAuspiciar = matchesPattern(auspiciarPatterns, normalized);
  const hasColectivos = matchesPattern(colectivosPatterns, normalized);
  const hasRepresentantes = matchesPattern(representantesPatterns, normalized);
  const hasCamaras = matchesPattern(camarasPatterns, normalized);
  const hasEncuestas = matchesPattern(encuestasPatterns, normalized);
  const hasInformes = matchesPattern(informesPatterns, normalized);

  if (hasFarmacia) {
    if (city) {
      suggestions.push({
        text: `Farmacias de turno en ${city.label}`,
        url: `/farmacias`,
        icon: getColoredIcon(MapPin, "farmacia"),
        type: "farmacia",
      });
      suggestions.push({
        text: `¿Qué farmacias de turno hay en ${city.label}?`,
        url: `/farmacias`,
        icon: getColoredIcon(MapPin, "farmacia"),
        type: "farmacia",
      });
    } else {
      CIUDADES.forEach((ciudad) => {
        suggestions.push({
          text: `Farmacias de turno en ${ciudad.label}`,
          url: `/farmacias`,
          icon: getColoredIcon(MapPin, "farmacia"),
          type: "farmacia",
        });
      });
    }
  }

  if (hasVuelo) {
    const ciudadesConVuelos = CIUDADES.filter((c) =>
      ["ushuaia", "rio grande"].includes(c.value)
    );
    if (city && ciudadesConVuelos.some((c) => c.value === city.value)) {
      suggestions.push({
        text: `Vuelo a ${city.label}`,
        url: `/vuelos/${city.slug}`,
        icon: getColoredIcon(Plane, "vuelo"),
        type: "vuelo",
      });
      suggestions.push({
        text: `¿A qué hora llega mi vuelo a ${city.label}?`,
        url: `/vuelos/${city.slug}`,
        icon: getColoredIcon(Clock, "vuelo"),
        type: "vuelo",
      });
    } else {
      ciudadesConVuelos.forEach((ciudad) => {
        suggestions.push({
          text: `Vuelo a ${ciudad.label}`,
          url: `/vuelos/${ciudad.slug}`,
          icon: getColoredIcon(Plane, "vuelo"),
          type: "vuelo",
        });
      });
    }
  }

  if (hasClima) {
    if (city) {
      suggestions.push({
        text: `¿Cuál es el clima en ${city.label}?`,
        url: `/clima`,
        icon: getColoredIcon(MapPin, "clima"),
        type: "clima",
      });
    } else {
      CIUDADES.forEach((ciudad) => {
        suggestions.push({
          text: `¿Cuál es el clima en ${ciudad.label}?`,
          url: `/clima`,
          icon: getColoredIcon(MapPin, "clima"),
          type: "clima",
        });
      });
    }
  }

  if (hasFrontera) {
    suggestions.push({
      text: `¿Hasta qué hora está abierta la frontera?`,
      url: `/barcaza`,
      icon: getColoredIcon(Clock, "frontera"),
      type: "frontera",
    });
  }

  if (hasCambio) {
    suggestions.push({
      text: `¿A cuánto está el cambio?`,
      url: `/el-cambio`,
      icon: getColoredIcon(DollarSign, "cambio"),
      type: "cambio",
    });
  }

  if (hasTelefono) {
    if (city) {
      suggestions.push({
        text: `¿Cuál es el teléfono de Defensa Civil en ${city.label}?`,
        url: `/telefonos-utiles/${city.slug}`,
        icon: getColoredIcon(Phone, "telefono"),
        type: "telefono",
      });
    } else {
      CIUDADES.forEach((ciudad) => {
        suggestions.push({
          text: `¿Cuál es el teléfono de Defensa Civil en ${ciudad.label}?`,
          url: `/telefonos-utiles/${ciudad.slug}`,
          icon: getColoredIcon(Phone, "telefono"),
          type: "telefono",
        });
      });
    }
  }

  if (hasDocumentos) {
    suggestions.push({
      text: `¿Qué documentos necesito para pasar por Chile?`,
      url: `/buscar/${encodeURIComponent("documentos chile frontera")}`,
      icon: getColoredIcon(FileText, "documentos"),
      type: "documentos",
    });
  }

  if (hasDirectorio) {
    if (city) {
      const ciudadSlug =
        city.slug === "rio-grande"
          ? "rg"
          : city.slug === "ushuaia"
          ? "ush"
          : "tol";
      suggestions.push({
        text: `Directorio de ${city.label}`,
        url: `/directorio/${ciudadSlug}/maestro-mayor-de-obra`,
        icon: getColoredIcon(Briefcase, "directorio"),
        type: "directorio",
      });
    } else {
      CIUDADES.forEach((ciudad) => {
        const ciudadSlug =
          ciudad.slug === "rio-grande"
            ? "rg"
            : ciudad.slug === "ushuaia"
            ? "ush"
            : "tol";
        suggestions.push({
          text: `Directorio de ${ciudad.label}`,
          url: `/directorio/${ciudadSlug}/maestro-mayor-de-obra`,
          icon: getColoredIcon(Briefcase, "directorio"),
          type: "directorio",
        });
      });
    }
  }

  if (hasBarcaza) {
    suggestions.push({
      text: `Estado de la barcaza`,
      url: `/barcaza`,
      icon: getColoredIcon(Ship, "barcaza"),
      type: "barcaza",
    });
    suggestions.push({
      text: `¿Que documentacion necesito para cruzar la frontera?`,
      url: `/barcaza`,
      icon: getColoredIcon(Ship, "barcaza"),
      type: "barcaza",
    });
    suggestions.push({
      text: `¿Hasta qué hora está abierta la frontera?`,
      url: `/barcaza`,
      icon: getColoredIcon(Clock, "frontera"),
      type: "barcaza",
    });
  }

  if (hasArchivo) {
    const today = new Date();
    const dateStr = today
      .toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    suggestions.push({
      text: `Archivo de noticias`,
      url: `/archivo/${dateStr}`,
      icon: getColoredIcon(Archive, "archivo"),
      type: "archivo",
    });
    suggestions.push({
      text: `Ver archivo histórico`,
      url: `/archivo`,
      icon: getColoredIcon(Archive, "archivo"),
      type: "archivo",
    });
  }

  if (hasAuspiciar) {
    suggestions.push({
      text: `Auspiciar en miTDF`,
      url: `/auspiciar`,
      icon: getColoredIcon(TrendingUp, "auspiciar"),
      type: "auspiciar",
    });
    suggestions.push({
      text: `Publicitar en miTDF`,
      url: `/auspiciar`,
      icon: getColoredIcon(TrendingUp, "auspiciar"),
      type: "auspiciar",
    });
  }

  if (hasColectivos) {
    if (city) {
      suggestions.push({
        text: `Colectivos en ${city.label}`,
        url: `/colectivos/${city.slug}`,
        icon: getColoredIcon(Bus, "colectivos"),
        type: "colectivos",
      });
    } else {
      CIUDADES.filter((c) =>
        ["ushuaia", "rio grande"].includes(c.value)
      ).forEach((ciudad) => {
        suggestions.push({
          text: `Colectivos en ${ciudad.label}`,
          url: `/colectivos/${ciudad.slug}`,
          icon: getColoredIcon(Bus, "colectivos"),
          type: "colectivos",
        });
      });
    }
  }

  if (hasRepresentantes) {
    suggestions.push({
      text: `Representantes de Tierra del Fuego`,
      url: `/representantes`,
      icon: getColoredIcon(Users, "representantes"),
      type: "representantes",
    });
    if (normalized.includes("concejal") || normalized.includes("concejales")) {
      suggestions.push({
        text: `Concejales de Tierra del Fuego`,
        url: `/representantes/concejales`,
        icon: getColoredIcon(Users, "representantes"),
        type: "representantes",
      });
    }
    if (normalized.includes("diputado") || normalized.includes("diputados")) {
      suggestions.push({
        text: `Diputados de Tierra del Fuego`,
        url: `/representantes/diputados`,
        icon: getColoredIcon(Users, "representantes"),
        type: "representantes",
      });
    }
    if (normalized.includes("senador") || normalized.includes("senadores")) {
      suggestions.push({
        text: `Senadores de Tierra del Fuego`,
        url: `/representantes/senadores`,
        icon: getColoredIcon(Users, "representantes"),
        type: "representantes",
      });
    }
    if (
      normalized.includes("legislador") ||
      normalized.includes("legisladores")
    ) {
      suggestions.push({
        text: `Legisladores de Tierra del Fuego`,
        url: `/representantes/legisladores`,
        icon: getColoredIcon(Users, "representantes"),
        type: "representantes",
      });
    }
  }

  if (hasCamaras) {
    if (city) {
      suggestions.push({
        text: `Cámaras en ${city.label}`,
        url: `/camaras/${city.slug}`,
        icon: getColoredIcon(Video, "camaras"),
        type: "camaras",
      });
    } else {
      suggestions.push({
        text: `Cámaras en vivo`,
        url: `/camaras`,
        icon: getColoredIcon(Video, "camaras"),
        type: "camaras",
      });
      CIUDADES.forEach((ciudad) => {
        suggestions.push({
          text: `Cámaras en ${ciudad.label}`,
          url: `/camaras/${ciudad.slug}`,
          icon: getColoredIcon(Video, "camaras"),
          type: "camaras",
        });
      });
    }
  }

  if (hasEncuestas) {
    suggestions.push({
      text: `Encuestas de miTDF`,
      url: `/encuestas`,
      icon: getColoredIcon(BarChart3, "encuestas"),
      type: "encuestas",
    });
    suggestions.push({
      text: `Pulso - Encuestas`,
      url: `/pulso/encuestas`,
      icon: getColoredIcon(BarChart3, "encuestas"),
      type: "encuestas",
    });
  }

  if (hasInformes) {
    suggestions.push({
      text: `Informes de miTDF`,
      url: `/pulso/informes`,
      icon: getColoredIcon(FileText, "informes"),
      type: "informes",
    });
    suggestions.push({
      text: `Análisis y estudios`,
      url: `/pulso/informes`,
      icon: getColoredIcon(FileText, "informes"),
      type: "informes",
    });
  }

  if (faqs.length > 0 && normalized.length >= 2) {
    const matchingFAQs = faqs.filter((faq) => {
      const preguntaLower = faq.pregunta.toLowerCase();
      const respuestaLower = faq.respuesta.toLowerCase();
      const queryWords = normalized.split(/\s+/).filter((w) => w.length >= 2);

      return (
        queryWords.some(
          (word) =>
            preguntaLower.includes(word) || respuestaLower.includes(word)
        ) ||
        preguntaLower.includes(normalized) ||
        respuestaLower.includes(normalized)
      );
    });

    matchingFAQs.slice(0, 3).forEach((faq) => {
      suggestions.push({
        text: faq.pregunta,
        url: `/faq#${faq.id}`,
        icon: getColoredIcon(HelpCircle, "faq"),
        type: "faq",
      });
    });
  }

  if (normalized.length >= 2) {
    suggestions.push({
      text: `Buscar "${query}" en noticias`,
      url: `/buscar/${encodeURIComponent(query)}`,
      icon: getColoredIcon(Search, "noticia"),
      type: "noticia",
    });
  }

  return suggestions.slice(0, 8);
};

const SearchBar = () => {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [newsResults, setNewsResults] = useState<SmartSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const touchStartTimeRef = useRef<number>(0);
  const { push } = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = React.useState<
    "blurred" | "focused" | "idle" | "typing" | "finded" | "navigation"
  >(pathname.includes("/buscar/") ? "focused" : "blurred");

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/faq");
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("application/json")) {
          return;
        }

        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error("Error al cargar FAQs:", error);
      }
    };
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setNewsResults([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/noticias?q=${encodeURIComponent(query)}&limit=8`,
          { signal }
        );

        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.includes("application/json")) {
          return;
        }

        const data: { id: string; slug: string; titulo: string }[] =
          await response.json();

        if (signal.aborted) return;

        const mapped: SmartSuggestion[] = data.map((item) => ({
          text: item.titulo,
          url: `/noticias/${item.slug}`,
          icon: getColoredIcon(FileText, "noticia"),
          type: "noticia",
        }));

        setNewsResults(mapped);
      } catch (error) {
        if (signal.aborted) return;
        console.error("Error al buscar noticias para el buscador:", error);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (query.length >= 2) {
      const baseSuggestions = generateSuggestions(query, faqs);
      const combined = [...newsResults, ...baseSuggestions];
      setSuggestions(combined);
      setShowSuggestions(combined.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, faqs, newsResults]);

  useEffect(() => {
    if (query.length === 0) {
      const interval = setInterval(() => {
        setPlaceholderIndex(
          (prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [query]);

  const handleOnFocus = () => {
    setStatus("focused");
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleOnBlur = (e: React.FocusEvent) => {
    if (isNavigating) return;

    const relatedTarget = e.relatedTarget as Node;
    if (!suggestionsRef.current?.contains(relatedTarget)) {
      setTimeout(() => {
        if (
          !isNavigating &&
          !suggestionsRef.current?.contains(document.activeElement)
        ) {
          setStatus("blurred");
          setShowSuggestions(false);
        }
      }, 300);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setStatus("typing");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        setSearching(true);
        push(`/buscar/${encodeURIComponent(query)}`);
        setSearching(false);
        setShowSuggestions(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectSuggestion = (suggestion: SmartSuggestion) => {
    if (isNavigating) return;

    setIsNavigating(true);
    setShowSuggestions(false);
    setQuery("");
    setSearching(true);

    window.location.href = suggestion.url;
  };

  return (
    <div className="relative flex items-center w-full z-50">
      {!searching ? (
        <Search
          name="search"
          className={`absolute left-3 pointer-events-none z-20 w-4 h-4 transition-colors ${
            status === "focused" || showSuggestions
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        />
      ) : (
        <Loader className="absolute left-3 pointer-events-none z-20 w-4 h-4 animate-spin text-primary" />
      )}
      <Input
        ref={inputRef}
        value={query}
        onChange={handleChange}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        onKeyDown={handleKeyPress}
        className={`
          pl-10 pr-4 h-11
          border-2 transition-all duration-200
          ${
            status === "focused" || showSuggestions
              ? "border-primary/50 bg-background shadow-md shadow-primary/5 ring-2 ring-primary/10"
              : "border-input/50 bg-muted/30 hover:bg-muted/50 hover:border-input"
          }
          placeholder:text-muted-foreground/70
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20
        `}
        placeholder={
          query.length === 0
            ? ROTATING_PLACEHOLDERS[placeholderIndex]
            : "Buscar..."
        }
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-lg shadow-xl shadow-primary/10 z-[9999] max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onTouchStart={(e) => {
                touchStartTimeRef.current = Date.now();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const touchDuration = Date.now() - touchStartTimeRef.current;
                if (touchDuration < 500) {
                  handleSelectSuggestion(suggestion);
                }
              }}
              onClick={(e) => {
                const timeSinceTouch = Date.now() - touchStartTimeRef.current;
                if (timeSinceTouch < 500) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                e.stopPropagation();
                handleSelectSuggestion(suggestion);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted active:bg-muted transition touch-manipulation ${
                selectedIndex === index ? "bg-muted" : ""
              }`}
            >
              <span>{suggestion.icon}</span>
              <span className="flex-1 text-sm">{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
