/**
 * Advanced News Classifier - deterministic, no AI APIs.
 * Target: 90-95% accuracy for local media classification.
 */

import { prisma } from "@/lib/db";

// --- Types ---

export type NoticiaLike = {
  titulo?: string | null;
  bajada?: string | null;
  longtext?: string | null;
};

export type ClassifyResult = {
  categoria?: string;
  ciudad?: string;
  tags?: string[];
};

// --- 1. Text normalization ---

const ACCENT_MAP: Record<string, string> = {
  á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n",
  Á: "a", É: "e", Í: "i", Ó: "o", Ú: "u", Ñ: "n",
};

const PUNCTUATION_REGEX = /[^\p{L}\p{N}\s]/gu;

export function normalizeText(text: string): string {
  if (!text || typeof text !== "string") return "";
  let s = text.toLowerCase();
  s = s.replace(/[áéíóúñ]/g, (c) => ACCENT_MAP[c] ?? c);
  s = s.replace(PUNCTUATION_REGEX, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// --- 2. Tokenization & N-grams ---

export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(" ").filter(Boolean) : [];
}

export function generateNgrams(tokens: string[], n: number): string[] {
  if (tokens.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}

// --- 3. Category dictionary (keywords normalized) ---

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Regionales: [
    "ushuaia", "rio grande", "tolhuin", "fueguino", "tierra del fuego",
    "concejo deliberante", "municipalidad", "local",
  ],
  Provinciales: [
    "gobernador", "provincia", "provincial", "legislatura", "gobierno provincial",
    "ministerio", "secretaria provincial",
  ],
  Actualidad: [
    "ultima hora", "actualidad", "ahora", "hoy", "informacion",
  ],
  Politica: [
    "gobernador", "intendente", "concejo deliberante", "legislatura",
    "senador", "diputado", "proyecto de ley", "campana", "politica",
    "elecciones", "votacion", "partido", "oposicion", "oficialismo",
  ],
  Deportes: [
    "gol", "partido", "liga", "campeonato", "torneo", "futbol",
    "club", "deporte", "atleta", "entrenador", "cancha",
  ],
  Educacion: [
    "escuela", "universidad", "alumno", "docente", "educacion",
    "colegio", "estudiantes", "clases", "inscripcion",
  ],
  Salud: [
    "hospital", "salud", "medico", "paciente", "enfermedad",
    "vacuna", "ministerio de salud", "epidemia",
  ],
  Cultura: [
    "cultura", "teatro", "musica", "arte", "exposicion",
    "festival", "biblioteca", "museo",
  ],
  Turismo: [
    "turismo", "turista", "hotel", "viaje", "destino",
    "temporada", "crucero", "aventura",
  ],
  Policiales: [
    "accidente", "robo", "detenido", "choque", "incendio",
    "allanamiento", "policia", "delito", "investigacion",
    "homicidio", "secuestro", "denuncia",
  ],
  Economia: [
    "economia", "precio", "dolar", "inflacion", "empleo",
    "comercio", "empresa", "inversion", "mercado",
  ],
  Tecnologia: [
    "tecnologia", "internet", "digital", "software", "app",
    "redes", "innovacion", "robot",
  ],
  Industria: [
    "industria", "fabrica", "produccion", "petroleo", "hidrocarburos",
    "yacimiento", "empresa industrial",
  ],
  Elecciones: [
    "elecciones", "votacion", "urna", "candidato", "campana electoral",
    "padron", "mesa", "escrutinio",
  ],
};

// --- 5. Local actor detection (politica) ---

const LOCAL_POLITICS = [
  "melella",
  "walter vuoto",
  "martin perez",
  "legislatura fueguina",
  "gustavo melella",
  "vuoto",
  "concejo deliberante",
];

// --- 6. Sports team detection ---

const LOCAL_TEAMS = [
  "camioneros",
  "boxing club",
  "petrolero",
  "camioneros de rio grande",
  "club atletico",
];

// --- 7. City detection ---

const CITY_KEYWORDS: Record<string, string[]> = {
  Ushuaia: ["ushuaia"],
  "Rio Grande": ["rio grande"],
  Tolhuin: ["tolhuin"],
  "Buenos Aires": ["buenos aires"],
  "Rio Gallegos": ["rio gallegos"],
  "Punta Arenas": ["punta arenas"],
  "San Sebastian": ["san sebastian"],
  Antartida: ["antartida", "base marambio"],
};

// Precompiled for headline heuristics (e.g. "Ushuaia:", "Rio Grande:")
const CITY_PREFIX_REGEX = /^(ushuaia|rio grande|tolhuin|buenos aires|rio gallegos|punta arenas|san sebastian|antartida)\s*[:\-]/i;

// --- Scoring weights ---

const TITLE_WEIGHT = 5;
const BAJADA_WEIGHT = 3;
const BODY_WEIGHT = 1;
const BIGRAM_WEIGHT = 4;
const TRIGRAM_WEIGHT = 6;
const LOCAL_POLITICS_WEIGHT = 10;
const LOCAL_TEAMS_WEIGHT = 8;
const REGIONAL_MIN_SCORE = 5;

// --- 4. Weighted scoring + 5, 6, 7, 8 ---

function scoreCategory(
  catKey: string,
  titleNorm: string,
  bajadaNorm: string,
  bodyNorm: string,
  titleTokens: string[],
  bajadaTokens: string[],
  bodyTokens: string[],
  titleBigrams: string[],
  titleTrigrams: string[],
  bajadaBigrams: string[],
  bajadaTrigrams: string[],
  bodyBigrams: string[],
  bodyTrigrams: string[]
): number {
  const keywords = CATEGORY_KEYWORDS[catKey];
  if (!keywords) return 0;

  let score = 0;

  for (const kw of keywords) {
    const inTitle = titleNorm.includes(kw);
    const inBajada = bajadaNorm.includes(kw);
    const inBody = bodyNorm.includes(kw);

    if (inTitle) score += TITLE_WEIGHT + (kw.length > 12 ? 1 : 0);
    if (inBajada) score += BAJADA_WEIGHT + (kw.length > 12 ? 1 : 0);
    if (inBody) score += BODY_WEIGHT + (kw.length > 12 ? 1 : 0);

    const kwTokens = kw.split(" ");
    if (kwTokens.length === 2) {
      const bigrams = [...titleBigrams, ...bajadaBigrams, ...bodyBigrams];
      if (bigrams.includes(kw)) score += BIGRAM_WEIGHT;
    } else if (kwTokens.length >= 3) {
      const trigrams = [...titleTrigrams, ...bajadaTrigrams, ...bodyTrigrams];
      if (trigrams.includes(kw)) score += TRIGRAM_WEIGHT;
    }
  }

  if (catKey === "Politica") {
    const fullText = `${titleNorm} ${bajadaNorm} ${bodyNorm}`;
    for (const actor of LOCAL_POLITICS) {
      if (fullText.includes(actor)) {
        score += LOCAL_POLITICS_WEIGHT;
        break;
      }
    }
  }

  if (catKey === "Deportes") {
    const fullText = `${titleNorm} ${bajadaNorm} ${bodyNorm}`;
    for (const team of LOCAL_TEAMS) {
      if (fullText.includes(team)) {
        score += LOCAL_TEAMS_WEIGHT;
        break;
      }
    }
  }

  return score;
}

function detectCity(titleNorm: string, bajadaNorm: string, bodyNorm: string): string | undefined {
  const full = `${titleNorm} ${bajadaNorm} ${bodyNorm}`;
  for (const [city, kws] of Object.entries(CITY_KEYWORDS)) {
    for (const kw of kws) {
      if (full.includes(kw)) return city;
    }
  }
  return undefined;
}

function detectCityFromHeadline(titulo: string): string | undefined {
  if (!titulo) return undefined;
  const normalized = normalizeText(titulo);
  const match = normalized.match(CITY_PREFIX_REGEX);
  if (match) {
    const prefix = match[1].toLowerCase();
    for (const [city, kws] of Object.entries(CITY_KEYWORDS)) {
      if (kws.some((kw) => kw === prefix || kw.replace(/\s/g, "") === prefix.replace(/\s/g, ""))) {
        return city;
      }
    }
    const map: Record<string, string> = {
      ushuaia: "Ushuaia",
      "rio grande": "Rio Grande",
      tolhuin: "Tolhuin",
      "buenos aires": "Buenos Aires",
      "rio gallegos": "Rio Gallegos",
      "punta arenas": "Punta Arenas",
      "san sebastian": "San Sebastian",
      antartida: "Antartida",
    };
    return map[prefix] ?? undefined;
  }
  return undefined;
}

// --- 8. Regional override ---

const REGIONAL_CITIES = new Set(["Ushuaia", "Rio Grande", "Tolhuin"]);

// --- 9. Tag extraction ---

const MAX_TAGS = 6;

function extractTags(
  categoryScores: Record<string, number>,
  winningCategory: string | undefined,
  ciudad: string | undefined,
  titleNorm: string,
  bajadaNorm: string,
  bodyNorm: string
): string[] {
  const set = new Set<string>();

  if (winningCategory) set.add(winningCategory.toLowerCase());
  if (ciudad) set.add(ciudad.toLowerCase().replace(/\s+/g, "-"));

  const full = `${titleNorm} ${bajadaNorm} ${bodyNorm}`;
  for (const actor of LOCAL_POLITICS) {
    if (full.includes(actor)) {
      set.add(actor.replace(/\s+/g, "-"));
      if (set.size >= MAX_TAGS) break;
    }
  }
  for (const team of LOCAL_TEAMS) {
    if (full.includes(team)) {
      set.add(team.replace(/\s+/g, "-"));
      if (set.size >= MAX_TAGS) break;
    }
  }

  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (set.size >= MAX_TAGS) break;
    if (categoryScores[cat] > 0) {
      for (const kw of kws) {
        if (full.includes(kw) && kw.length > 4) {
          set.add(kw.replace(/\s+/g, "-"));
          if (set.size >= MAX_TAGS) break;
        }
      }
    }
  }

  return Array.from(set).slice(0, MAX_TAGS);
}

// --- 10. Classifier function ---

export function classifyNews(noticia: NoticiaLike): ClassifyResult {
  const titulo = noticia.titulo ?? "";
  const bajada = noticia.bajada ?? "";
  const longtext = noticia.longtext ?? "";

  const titleNorm = normalizeText(titulo);
  const bajadaNorm = normalizeText(bajada);
  const bodyNorm = normalizeText(longtext);

  const titleTokens = tokenize(titulo);
  const bajadaTokens = tokenize(bajada);
  const bodyTokens = tokenize(longtext);

  const titleBigrams = generateNgrams(titleTokens, 2);
  const titleTrigrams = generateNgrams(titleTokens, 3);
  const bajadaBigrams = generateNgrams(bajadaTokens, 2);
  const bajadaTrigrams = generateNgrams(bajadaTokens, 3);
  const bodyBigrams = generateNgrams(bodyTokens, 2);
  const bodyTrigrams = generateNgrams(bodyTokens, 3);

  const categoryKeys = Object.keys(CATEGORY_KEYWORDS);
  const scores: Record<string, number> = {};
  for (const cat of categoryKeys) {
    scores[cat] = scoreCategory(
      cat,
      titleNorm,
      bajadaNorm,
      bodyNorm,
      titleTokens,
      bajadaTokens,
      bodyTokens,
      titleBigrams,
      titleTrigrams,
      bajadaBigrams,
      bajadaTrigrams,
      bodyBigrams,
      bodyTrigrams
    );
  }

  let bestCat: string | undefined;
  let bestScore = 0;
  for (const [cat, sc] of Object.entries(scores)) {
    if (sc > bestScore) {
      bestScore = sc;
      bestCat = cat;
    }
  }

  const ciudad =
    detectCityFromHeadline(titulo) ??
    detectCity(titleNorm, bajadaNorm, bodyNorm);

  if (ciudad && REGIONAL_CITIES.has(ciudad) && (bestScore < REGIONAL_MIN_SCORE || !bestCat)) {
    bestCat = "Regionales";
  }

  const tags = extractTags(scores, bestCat, ciudad, titleNorm, bajadaNorm, bodyNorm);

  return {
    categoria: bestCat,
    ciudad,
    tags: tags.length ? tags : undefined,
  };
}

// --- 11. Batch processor ---

export async function autocategorizeNews(): Promise<{ updated: number; errors: number }> {
  const noticias = await prisma.noticia.findMany({
    where: {
      OR: [{ categoria: null }, { categoria: "" }, { ciudad: null }, { ciudad: "" }],
    },
    select: {
      id: true,
      titulo: true,
      bajada: true,
      longtext: true,
    },
  });

  let updated = 0;
  let errors = 0;

  for (const n of noticias) {
    try {
      const result = classifyNews(n);
      await prisma.noticia.update({
        where: { id: n.id },
        data: {
          ...(result.categoria && { categoria: result.categoria }),
          ...(result.ciudad && { ciudad: result.ciudad }),
          ...(result.tags && result.tags.length > 0 && { tags: result.tags.join(", ") }),
        },
      });
      updated++;
    } catch {
      errors++;
    }
  }

  return { updated, errors };
}
