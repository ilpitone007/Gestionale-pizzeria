FROM node:20-alpine

# Installazione delle dipendenze di sistema richieste da Prisma su Alpine
RUN apk add --no-cache openssl libc6-compat gcompat

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

# Copia e configura lo script di avvio
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]