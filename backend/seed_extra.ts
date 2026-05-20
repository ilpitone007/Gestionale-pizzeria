import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding extra categories (Fritti, Bevande)...');

  // Fritti
  let catFritti = await prisma.categoriaPizza.findUnique({ where: { nome: 'Fritti' } });
  if (!catFritti) {
    catFritti = await prisma.categoriaPizza.create({ data: { nome: 'Fritti', ordine: 4 } });
  }

  await prisma.pizza.upsert({
    where: { nome: 'Patatine Piccole' },
    update: {},
    create: { nome: 'Patatine Piccole', descrizione: 'Porzione piccola (150g)', categoriaId: catFritti.id, prezzoBase: 2.50 }
  });

  await prisma.pizza.upsert({
    where: { nome: 'Patatine Medie' },
    update: {},
    create: { nome: 'Patatine Medie', descrizione: 'Porzione media (250g)', categoriaId: catFritti.id, prezzoBase: 3.50 }
  });

  await prisma.pizza.upsert({
    where: { nome: 'Patatine Grandi' },
    update: {},
    create: { nome: 'Patatine Grandi', descrizione: 'Porzione grande (400g)', categoriaId: catFritti.id, prezzoBase: 5.00 }
  });

  // Bevande
  let catBevande = await prisma.categoriaPizza.findUnique({ where: { nome: 'Bevande' } });
  if (!catBevande) {
    catBevande = await prisma.categoriaPizza.create({ data: { nome: 'Bevande', ordine: 5 } });
  }

  await prisma.pizza.upsert({
    where: { nome: 'Acqua Naturale 50cl' },
    update: {},
    create: { nome: 'Acqua Naturale 50cl', categoriaId: catBevande.id, prezzoBase: 1.00 }
  });

  await prisma.pizza.upsert({
    where: { nome: 'Acqua Frizzante 50cl' },
    update: {},
    create: { nome: 'Acqua Frizzante 50cl', categoriaId: catBevande.id, prezzoBase: 1.00 }
  });

  await prisma.pizza.upsert({
    where: { nome: 'Coca Cola Lattina' },
    update: {},
    create: { nome: 'Coca Cola Lattina', categoriaId: catBevande.id, prezzoBase: 2.50 }
  });

  await prisma.pizza.upsert({
    where: { nome: 'Birra Nastro Azzurro 33cl' },
    update: {},
    create: { nome: 'Birra Nastro Azzurro 33cl', categoriaId: catBevande.id, prezzoBase: 3.00 }
  });

  console.log('Extra seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
