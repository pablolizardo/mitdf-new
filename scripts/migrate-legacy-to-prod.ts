/**
 * Script de migración: LEGACY_DATABASE_URL → PROD_DATABASE_URL
 *
 * Uso:
 *   npm run migrate:legacy-to-prod
 *   # o directamente:
 *   npx tsx scripts/migrate-legacy-to-prod.ts
 *
 * Requiere LEGACY_DATABASE_URL y PROD_DATABASE_URL en .env
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// Cargar .env
const envPath = resolve(__dirname, "..", ".env");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

const LEGACY_URL = process.env.LEGACY_DATABASE_URL;
const PROD_URL = process.env.PROD_DATABASE_URL;

if (!LEGACY_URL || !PROD_URL) {
  console.error(
    "Falta LEGACY_DATABASE_URL o PROD_DATABASE_URL en .env"
  );
  process.exit(1);
}

const legacy = new PrismaClient({
  datasources: { db: { url: LEGACY_URL } },
});

const prod = new PrismaClient({
  datasources: { db: { url: PROD_URL } },
});

/** Quita campos de relación de un registro para create/update */
function stripRelations(
  record: Record<string, unknown>,
  relationKeys: string[]
): Record<string, unknown> {
  const out = { ...record };
  for (const key of relationKeys) {
    delete out[key];
  }
  return out;
}

type MigrateFn = () => Promise<void>;

async function migrateModel<T extends { id: string }>(opts: {
  name: string;
  legacyList: () => Promise<T[]>;
  prodUpsert: (row: T, data: Record<string, unknown>) => Promise<unknown>;
  relationKeys: string[];
}): Promise<void> {
  const { name, legacyList, prodUpsert, relationKeys } = opts;
  const list = await legacyList();
  console.log(`  [${name}] ${list.length} registros`);
  for (const row of list) {
    const data = stripRelations(row as Record<string, unknown>, relationKeys);
    await prodUpsert(row, data);
  }
}

async function run(): Promise<void> {
  console.log("Migración LEGACY_DATABASE_URL → PROD_DATABASE_URL\n");

  const steps: { name: string; run: MigrateFn }[] = [
    {
      name: "Config",
      run: () =>
        migrateModel({
          name: "Config",
          legacyList: () => legacy.config.findMany(),
          prodUpsert: (row, data) =>
            prod.config.upsert({
              where: { id: row.id },
              create: data as Parameters<typeof prod.config.upsert>[0]["create"],
              update: data as Parameters<typeof prod.config.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Diario",
      run: () =>
        migrateModel({
          name: "Diario",
          legacyList: () => legacy.diario.findMany(),
          prodUpsert: (row, data) =>
            prod.diario.upsert({
              where: { id: row.id },
              create: data as Parameters<typeof prod.diario.upsert>[0]["create"],
              update: data as Parameters<typeof prod.diario.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Noticia",
      run: () =>
        migrateModel({
          name: "Noticia",
          legacyList: () => legacy.noticia.findMany(),
          prodUpsert: (row, data) =>
            prod.noticia.upsert({
              where: { id: row.id },
              create: data as Parameters<typeof prod.noticia.upsert>[0]["create"],
              update: data as Parameters<typeof prod.noticia.upsert>[0]["update"],
            }),
          relationKeys: ["comentarios", "reacciones"],
        }),
    },
    {
      name: "Comentario",
      run: () =>
        migrateModel({
          name: "Comentario",
          legacyList: () => legacy.comentario.findMany(),
          prodUpsert: (row, data) =>
            prod.comentario.upsert({
              where: { id: row.id },
              create: data as Parameters<typeof prod.comentario.upsert>[0]["create"],
              update: data as Parameters<typeof prod.comentario.upsert>[0]["update"],
            }),
          relationKeys: ["noticia", "parent", "respuestas"],
        }),
    },
    {
      name: "Reaccion",
      run: () =>
        migrateModel({
          name: "Reaccion",
          legacyList: () => legacy.reaccion.findMany(),
          prodUpsert: (row, data) =>
            prod.reaccion.upsert({
              where: { id: row.id },
              create: data as Parameters<typeof prod.reaccion.upsert>[0]["create"],
              update: data as Parameters<typeof prod.reaccion.upsert>[0]["update"],
            }),
          relationKeys: ["noticia"],
        }),
    },
    {
      name: "Encuesta",
      run: async () => {
        const list = await legacy.encuesta.findMany();
        console.log(`  [Encuesta] ${list.length} registros`);
        for (const row of list) {
          const { opciones, votos, ...data } = row;
          await prod.encuesta.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "OpcionEncuesta",
      run: async () => {
        const list = await legacy.opcionEncuesta.findMany();
        console.log(`  [OpcionEncuesta] ${list.length} registros`);
        for (const row of list) {
          const { encuesta, votos, ...data } = row;
          await prod.opcionEncuesta.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "VotoEncuesta",
      run: async () => {
        const list = await legacy.votoEncuesta.findMany();
        console.log(`  [VotoEncuesta] ${list.length} registros`);
        for (const row of list) {
          const { opcion, encuesta, ...data } = row;
          await prod.votoEncuesta.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "Ad",
      run: () =>
        migrateModel({
          name: "Ad",
          legacyList: () => legacy.ad.findMany(),
          prodUpsert: (data) =>
            prod.ad.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.ad.upsert>[0]["create"],
              update: data as Parameters<typeof prod.ad.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Editorial",
      run: () =>
        migrateModel({
          name: "Editorial",
          legacyList: () => legacy.editorial.findMany(),
          prodUpsert: (data) =>
            prod.editorial.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.editorial.upsert>[0]["create"],
              update: data as Parameters<typeof prod.editorial.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "VotoPartido",
      run: async () => {
        const list = await legacy.votoPartido.findMany();
        console.log(`  [VotoPartido] ${list.length} registros`);
        for (const row of list) {
          await prod.votoPartido.upsert({
            where: { id: row.id },
            create: row,
            update: row,
          });
        }
      },
    },
    {
      name: "FAQ",
      run: () =>
        migrateModel({
          name: "FAQ",
          legacyList: () => legacy.fAQ.findMany(),
          prodUpsert: (data) =>
            prod.fAQ.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.fAQ.upsert>[0]["create"],
              update: data as Parameters<typeof prod.fAQ.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Testimonio",
      run: () =>
        migrateModel({
          name: "Testimonio",
          legacyList: () => legacy.testimonio.findMany(),
          prodUpsert: (data) =>
            prod.testimonio.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.testimonio.upsert>[0]["create"],
              update: data as Parameters<typeof prod.testimonio.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Directorio",
      run: () =>
        migrateModel({
          name: "Directorio",
          legacyList: () => legacy.directorio.findMany(),
          prodUpsert: (data) =>
            prod.directorio.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.directorio.upsert>[0]["create"],
              update: data as Parameters<typeof prod.directorio.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Telefono",
      run: () =>
        migrateModel({
          name: "Telefono",
          legacyList: () => legacy.telefono.findMany(),
          prodUpsert: (data) =>
            prod.telefono.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.telefono.upsert>[0]["create"],
              update: data as Parameters<typeof prod.telefono.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Medio",
      run: () =>
        migrateModel({
          name: "Medio",
          legacyList: () => legacy.medio.findMany(),
          prodUpsert: (data) =>
            prod.medio.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.medio.upsert>[0]["create"],
              update: data as Parameters<typeof prod.medio.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Link",
      run: () =>
        migrateModel({
          name: "Link",
          legacyList: () => legacy.link.findMany(),
          prodUpsert: (data) =>
            prod.link.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.link.upsert>[0]["create"],
              update: data as Parameters<typeof prod.link.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Diputado",
      run: () =>
        migrateModel({
          name: "Diputado",
          legacyList: () => legacy.diputado.findMany(),
          prodUpsert: (data) =>
            prod.diputado.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.diputado.upsert>[0]["create"],
              update: data as Parameters<typeof prod.diputado.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "DiputadoConfig",
      run: () =>
        migrateModel({
          name: "DiputadoConfig",
          legacyList: () => legacy.diputadoConfig.findMany(),
          prodUpsert: (data) =>
            prod.diputadoConfig.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.diputadoConfig.upsert>[0]["create"],
              update: data as Parameters<typeof prod.diputadoConfig.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Senador",
      run: () =>
        migrateModel({
          name: "Senador",
          legacyList: () => legacy.senador.findMany(),
          prodUpsert: (data) =>
            prod.senador.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.senador.upsert>[0]["create"],
              update: data as Parameters<typeof prod.senador.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "SenadorConfig",
      run: () =>
        migrateModel({
          name: "SenadorConfig",
          legacyList: () => legacy.senadorConfig.findMany(),
          prodUpsert: (data) =>
            prod.senadorConfig.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.senadorConfig.upsert>[0]["create"],
              update: data as Parameters<typeof prod.senadorConfig.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Legislador",
      run: () =>
        migrateModel({
          name: "Legislador",
          legacyList: () => legacy.legislador.findMany(),
          prodUpsert: (data) =>
            prod.legislador.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.legislador.upsert>[0]["create"],
              update: data as Parameters<typeof prod.legislador.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "LegisladorConfig",
      run: () =>
        migrateModel({
          name: "LegisladorConfig",
          legacyList: () => legacy.legisladorConfig.findMany(),
          prodUpsert: (data) =>
            prod.legisladorConfig.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.legisladorConfig.upsert>[0]["create"],
              update: data as Parameters<typeof prod.legisladorConfig.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Categoria",
      run: () =>
        migrateModel({
          name: "Categoria",
          legacyList: () => legacy.categoria.findMany(),
          prodUpsert: (data) =>
            prod.categoria.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.categoria.upsert>[0]["create"],
              update: data as Parameters<typeof prod.categoria.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Candidato",
      run: () =>
        migrateModel({
          name: "Candidato",
          legacyList: () => legacy.candidato.findMany(),
          prodUpsert: (data) =>
            prod.candidato.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.candidato.upsert>[0]["create"],
              update: data as Parameters<typeof prod.candidato.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Camara",
      run: () =>
        migrateModel({
          name: "Camara",
          legacyList: () => legacy.camara.findMany(),
          prodUpsert: (data) =>
            prod.camara.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.camara.upsert>[0]["create"],
              update: data as Parameters<typeof prod.camara.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "Concejal",
      run: () =>
        migrateModel({
          name: "Concejal",
          legacyList: () => legacy.concejal.findMany(),
          prodUpsert: (data) =>
            prod.concejal.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.concejal.upsert>[0]["create"],
              update: data as Parameters<typeof prod.concejal.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "PulsoSurvey",
      run: async () => {
        const list = await legacy.pulsoSurvey.findMany();
        console.log(`  [PulsoSurvey] ${list.length} registros`);
        for (const row of list) {
          const { questions, responses, sampleMeta, ...data } = row;
          await prod.pulsoSurvey.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "PulsoQuestion",
      run: async () => {
        const list = await legacy.pulsoQuestion.findMany();
        console.log(`  [PulsoQuestion] ${list.length} registros`);
        for (const row of list) {
          const { survey, responses, ...data } = row;
          await prod.pulsoQuestion.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "PulsoResponse",
      run: async () => {
        const list = await legacy.pulsoResponse.findMany();
        console.log(`  [PulsoResponse] ${list.length} registros`);
        for (const row of list) {
          const { survey, question, ...data } = row;
          await prod.pulsoResponse.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "PulsoSampleMeta",
      run: async () => {
        const list = await legacy.pulsoSampleMeta.findMany();
        console.log(`  [PulsoSampleMeta] ${list.length} registros`);
        for (const row of list) {
          const { survey, ...data } = row;
          await prod.pulsoSampleMeta.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "PulsoReport",
      run: () =>
        migrateModel({
          name: "PulsoReport",
          legacyList: () => legacy.pulsoReport.findMany(),
          prodUpsert: (data) =>
            prod.pulsoReport.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.pulsoReport.upsert>[0]["create"],
              update: data as Parameters<typeof prod.pulsoReport.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "PulsoWhitepaper",
      run: async () => {
        const list = await legacy.pulsoWhitepaper.findMany();
        console.log(`  [PulsoWhitepaper] ${list.length} registros`);
        for (const row of list) {
          const { downloads, ...data } = row;
          await prod.pulsoWhitepaper.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "PulsoInsight",
      run: () =>
        migrateModel({
          name: "PulsoInsight",
          legacyList: () => legacy.pulsoInsight.findMany(),
          prodUpsert: (data) =>
            prod.pulsoInsight.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.pulsoInsight.upsert>[0]["create"],
              update: data as Parameters<typeof prod.pulsoInsight.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "PulsoLead",
      run: () =>
        migrateModel({
          name: "PulsoLead",
          legacyList: () => legacy.pulsoLead.findMany(),
          prodUpsert: (data) =>
            prod.pulsoLead.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.pulsoLead.upsert>[0]["create"],
              update: data as Parameters<typeof prod.pulsoLead.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "PulsoNewsletterSubscriber",
      run: () =>
        migrateModel({
          name: "PulsoNewsletterSubscriber",
          legacyList: () => legacy.pulsoNewsletterSubscriber.findMany(),
          prodUpsert: (data) =>
            prod.pulsoNewsletterSubscriber.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.pulsoNewsletterSubscriber.upsert>[0]["create"],
              update: data as Parameters<typeof prod.pulsoNewsletterSubscriber.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
    {
      name: "PulsoDownloadLog",
      run: async () => {
        const list = await legacy.pulsoDownloadLog.findMany();
        console.log(`  [PulsoDownloadLog] ${list.length} registros`);
        for (const row of list) {
          const { whitepaper, ...data } = row;
          await prod.pulsoDownloadLog.upsert({
            where: { id: row.id },
            create: data,
            update: data,
          });
        }
      },
    },
    {
      name: "AdAnunciante",
      run: () =>
        migrateModel({
          name: "AdAnunciante",
          legacyList: () => legacy.adAnunciante.findMany(),
          prodUpsert: (data) =>
            prod.adAnunciante.upsert({
              where: { id: data.id },
              create: data as Parameters<typeof prod.adAnunciante.upsert>[0]["create"],
              update: data as Parameters<typeof prod.adAnunciante.upsert>[0]["update"],
            }),
          relationKeys: [],
        }),
    },
  ];

  for (const step of steps) {
    console.log(`\n→ ${step.name}`);
    await step.run();
  }

  console.log("\n✅ Migración completada.");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await legacy.$disconnect();
    await prod.$disconnect();
  });
