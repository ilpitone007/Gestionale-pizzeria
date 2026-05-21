#!/bin/bash

# Directory dove verranno salvati i backup
BACKUP_DIR="./backups"
# Nome del volume docker che contiene il database o percorso relativo se locale
DB_CONTAINER_NAME="pizzaorder-backend-1"
DB_PATH="/app/prisma/data/dev.db"

# Data nel formato YYYY-MM-DD_HH-MM-SS
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="db_backup_${TIMESTAMP}.db"

# Crea la directory di backup se non esiste
mkdir -p "$BACKUP_DIR"

echo "Avvio backup del database SQLite..."

# Controlla se il container Docker è in esecuzione
if docker ps | grep -q "$DB_CONTAINER_NAME"; then
    echo "Eseguo copia dal container $DB_CONTAINER_NAME..."
    docker cp "${DB_CONTAINER_NAME}:${DB_PATH}" "${BACKUP_DIR}/${BACKUP_FILE}"

    if [ $? -eq 0 ]; then
        echo "✅ Backup completato con successo: ${BACKUP_DIR}/${BACKUP_FILE}"
    else
        echo "❌ Errore durante la copia del file dal container."
        exit 1
    fi
else
    # Prova a cercare il file localmente nella cartella del volume (se montato localmente e configurato)
    # Nel nostro docker-compose.yml usiamo un named volume `sqlite-data`
    echo "⚠️ Container $DB_CONTAINER_NAME non trovato o non in esecuzione."
    echo "Provo a eseguire il backup tramite docker run temporaneo dal volume..."

    docker run --rm -v sqlite-data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine cp /data/dev.db /backup/${BACKUP_FILE}

    if [ $? -eq 0 ]; then
        echo "✅ Backup completato con successo (dal volume): ${BACKUP_DIR}/${BACKUP_FILE}"
    else
        echo "❌ Errore durante la copia del volume."
        exit 1
    fi
fi

# Elimina i backup più vecchi di 30 giorni
echo "Pulizia dei backup più vecchi di 30 giorni..."
find "$BACKUP_DIR" -type f -name "db_backup_*.db" -mtime +30 -exec rm {} \;
echo "Pulizia completata."
