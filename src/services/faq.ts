import { prisma } from "@/lib/db";

export async function getFaqs() {
  return prisma.fAQ.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    select: { id: true, pregunta: true, respuesta: true, orden: true },
  });
}
