#!/usr/bin/env bash
#
# Dump completo de LEGACY_DATABASE_URL → PROD_DATABASE_URL
# (clone de la base: mongodump + mongorestore, sin Prisma ni lógica por registro)
#
# Requiere: MongoDB Database Tools (mongodump, mongorestore)
#   macOS: brew install mongodb-database-tools
#
# Uso: ./scripts/dump-legacy-to-prod.sh   o   npm run migrate:legacy-to-prod

set -e
cd "$(dirname "$0")/.."

# Cargar .env (soporta valores con =, p.ej. URIs)
if [ -f .env ]; then
  set -a
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    key="${line%%=*}"
    key="${key// /}"
    value="${line#*=}"
    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"
    export "$key=$value"
  done < .env
  set +a
fi

if [ -z "$LEGACY_DATABASE_URL" ] || [ -z "$PROD_DATABASE_URL" ]; then
  echo "Error: LEGACY_DATABASE_URL y PROD_DATABASE_URL deben estar en .env"
  exit 1
fi

DUMP_DIR="./.dump-migration-$$"
trap 'rm -rf "$DUMP_DIR"' EXIT

echo "→ Dump desde LEGACY..."
mongodump --uri="$LEGACY_DATABASE_URL" --out="$DUMP_DIR"

# mongodump crea una carpeta con el nombre de la DB; puede haber solo una
DB_DIR=$(find "$DUMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)
if [ -z "$DB_DIR" ] || [ ! -d "$DB_DIR" ]; then
  echo "Error: no se encontró carpeta de DB en el dump"
  exit 1
fi

echo "→ Restore a PROD (--drop: reemplaza colecciones existentes)..."
mongorestore --uri="$PROD_DATABASE_URL" --drop "$DB_DIR"

echo "✅ Base clonada: LEGACY → PROD"
