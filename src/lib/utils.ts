import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function diffForHumans(date: Date | string) {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "hace un momento";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays} d`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 4) return `hace ${diffWeeks} sem`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `hace ${diffMonths} mes`;
  const diffYears = Math.round(diffDays / 365);
  return `hace ${diffYears} a`;
}

export function getWhatsAppUrl(
  telefono: string | null | undefined
): string | null {
  if (!telefono || !telefono.trim()) return null;
  let digits = telefono.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("15") && digits.length >= 12)
    digits = "54" + digits.slice(2);
  else if (digits.length === 10) digits = "549" + digits;
  else if (digits.length === 11 && digits.startsWith("9"))
    digits = "54" + digits;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}`;
}

export const wrapURLs = (text, new_window) => {
  var url_pattern =
    /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/gi;
  var target = new_window === true || new_window == null ? "_blank" : "";

  return text.replace(url_pattern, function (url) {
    var protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
    var href = protocol_pattern.test(url) ? url : "http://" + url;
    if (href.length > 24) {
      return '<a href="' + href + '" target="' + target + '">' + url + "</a>";
    } else {
      return url;
    }
  });
};

export const slugify = (text) => {
  return text
    .toString() // Cast to string (optional)
    .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// Truncate slug to safe length for filesystem compatibility
export const truncateSlug = (slug: string, maxLength: number = 100): string => {
  if (slug.length <= maxLength) return slug;

  // Try to truncate at word boundaries first
  const truncated = slug.substring(0, maxLength);
  const lastDashIndex = truncated.lastIndexOf("-");

  if (lastDashIndex > maxLength * 0.8) {
    // If we can find a dash in the last 20% of the string
    return truncated.substring(0, lastDashIndex);
  }

  return truncated;
};

// Convierte un slug en su forma original
export function unslugify(slug: string): string {
  const lowercase = slug.toLowerCase(); // Convierte todo a minúsculas
  return lowercase.replace(/-/g, " "); // Reemplaza los guiones con espacios
}

export function getInitials(value: string): string {
  return (
    value
      .match(/(\b\S)?/g)
      ?.join("")
      .toUpperCase() || ""
  );
}

export const linkify = (inputText: string): string => {
  //URLs starting with http://, https://, or ftp://
  var replacePattern1 =
    /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  var replacedText = inputText.replace(
    replacePattern1,
    '<a class="internal-link" href="$1" target="_blank">$1</a>'
  );

  //URLs starting with www. (without // before it, or it'd re-link the ones done above)
  var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  var replacedText = replacedText.replace(
    replacePattern2,
    '$1<a class="internal-link" href="https://$2" target="_blank">$2</a>'
  );

  //Change email addresses to mailto:: links
  var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  var replacedText = replacedText.replace(
    replacePattern3,
    '<a class="internal-link" href="mailto:$1">$1</a>'
  );

  return replacedText;
};

export function randomTimeGenerator(): string {
  // Genera una hora aleatoria dentro de las últimas 24 horas
  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const timestamp =
    past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(timestamp).toISOString();
}

export const estimateReadingTime = (
  text: string,
  variant = "default"
): string => {
  const wordsCount = text.split(" ");
  const formats = {
    default: `Tiempo de lectura: ${Math.round(
      wordsCount.length / 185
    )} minutos (${wordsCount.length} palabras)`,
    compact: `${Math.round(wordsCount.length / 185)} minutos de lectura`,
  };

  return formats[variant];
};

const URL_REGEX = /(https?:\/\/[^\s<>"]+)/g;

/**
 * Limpia y enriquece el HTML del cuerpo de una noticia:
 * - Elimina espacios y saltos de línea al inicio y al final
 * - Colapsa líneas en blanco repetidas (máximo una línea en blanco entre párrafos)
 * - Normaliza líneas que solo tienen espacios como líneas en blanco
 * - Quita espacios y saltos de línea entre etiquetas (ej. entre </p> y <p>)
 * - Marca párrafos que empiezan con comillas (") o « como cita (class="article-quote")
 * - Envuelve URLs sueltas en texto con <a href="..." target="_blank" rel="noopener noreferrer">
 */
export function cleanArticleHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== "string") return "";
  let s = html
    .replace(/\r\n?/g, "\n") // normalizar saltos de línea
    .replace(/\n[\t ]+\n/g, "\n\n") // línea solo con espacios/tabs → en blanco
    .trim(); // espacios/saltos al inicio y final
  // colapsar 3+ saltos (2+ líneas en blanco) en solo 2 saltos (1 línea en blanco)
  s = s.replace(/\n{3,}/g, "\n\n");
  // quitar todo espacio/salto entre etiquetas (elimina líneas en blanco entre </p> y <p>, etc.)
  s = s.replace(/>\s+</g, "><");
  // párrafos que empiezan con " o « → marcar como cita para estilos tipo blockquote
  s = s.replace(/<p>\x22/g, '<p class="article-quote">"');
  s = s.replace(/<p>«/g, '<p class="article-quote">«');
  // envolver URLs sueltas en texto (entre etiquetas) con <a>
  s = s.replace(/>([^<]+)</g, (_, text: string) => {
    const linked = text.replace(
      URL_REGEX,
      (url: string) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="article-link">${url}</a>`
    );
    return `>${linked}<`;
  });
  return s;
}
