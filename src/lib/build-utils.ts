// Utilidades simples para detectar si estamos en fase de build

export function isBuildTime(): boolean {
  // En Next.js, esta variable se setea durante el build de producción
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return true;
  }

  // Fallback conservador: en dev y en runtime normal devolvemos false
  return false;
}
