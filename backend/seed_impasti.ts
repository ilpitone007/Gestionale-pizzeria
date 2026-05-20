import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Impasti...');

  await prisma.impasto.upsert({
    where: { nome: 'Classico' },
    update: {},
    create: { nome: 'Classico', sovrapprezzo: 0 }
  });

  await prisma.impasto.upsert({
    where: { nome: 'Integrale' },
    update: {},
    create: { nome: 'Integrale', sovrapprezzo: 1.5 }
  });

  await prisma.impasto.upsert({
    where: { nome: 'Senza Glutine' },
    update: {},
    create: { nome: 'Senza Glutine', sovrapprezzo: 2.5 }
  });

  await prisma.impasto.upsert({
    where: { nome: 'Pinsa Romana' },
    update: {},
    create: { nome: 'Pinsa Romana', sovrapprezzo: 2.0 }
  });

  console.log('Impasti seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
