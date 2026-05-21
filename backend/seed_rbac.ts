import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Avvio seed per RBAC e Sconti...');

  // 1. Utenti
  const passwordHashAdmin = await bcrypt.hash('1234', 10);
  const passwordHashOperatore = await bcrypt.hash('0000', 10);

  await prisma.utente.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      pin: passwordHashAdmin,
      ruolo: 'admin',
    },
  });

  await prisma.utente.upsert({
    where: { username: 'cassa1' },
    update: {},
    create: {
      username: 'cassa1',
      pin: passwordHashOperatore,
      ruolo: 'operatore',
    },
  });

  // 2. Impostazioni (Limite pizze/ordini per fascia oraria di 15 min)
  await prisma.impostazione.upsert({
    where: { id: 'limite_ordini_fascia' },
    update: {},
    create: {
      id: 'limite_ordini_fascia',
      valore: '10', // 10 ordini massimi ogni 15 minuti di default
    },
  });

  console.log('Seed RBAC completato.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
