FROM node:20-alpine

WORKDIR /app

# Copia i file dei pacchetti e Prisma
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Installa le dipendenze
RUN npm install

# Genera il client di Prisma
RUN npx prisma generate

# Copia il codice sorgente
COPY . .

# Compila il codice TypeScript (opzionale, ma raccomandato)
# Dato che il progetto backend usa ts-node direttamente, non c'è build script.
# Useremo ts-node o compileremo in JS.
RUN npx tsc || true # per assicurare che non fallisca se non configurato
# o semplicemente installeremo ts-node globalmente se necessario

# Script di startup custom che lancia le migrazioni / seed prima di startare
# Dato che usiamo sqlite, il database sarà in /app/prisma/data/dev.db
# Creiamo uno script di avvio
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
