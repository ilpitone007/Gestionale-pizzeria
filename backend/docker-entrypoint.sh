#!/bin/sh
set -e

# Crea la directory dati se non esiste
mkdir -p /app/prisma/data

# Controlla se il DB esiste, altrimenti lancia migrate e seed
if [ ! -f "/app/prisma/data/dev.db" ]; then
  echo "Database non trovato. Eseguo migrazione e seed..."
  npx prisma migrate deploy || npx prisma migrate dev --name init
  npx ts-node -O '{"module":"CommonJS"}' seed.ts
else
  echo "Database trovato. Applica migrazioni pendenti..."
  npx prisma migrate deploy || echo "Migrazione completata/saltata."
fi

exec "$@"