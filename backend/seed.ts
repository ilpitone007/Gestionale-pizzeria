import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Ingredienti
  const ingredienti = await Promise.all([
    prisma.ingrediente.create({ data: { nome: 'pomodoro' } }),
    prisma.ingrediente.create({ data: { nome: 'mozzarella' } }),
    prisma.ingrediente.create({ data: { nome: 'basilico' } }),
    prisma.ingrediente.create({ data: { nome: 'origano' } }),
    prisma.ingrediente.create({ data: { nome: 'prosciutto cotto' } }),
    prisma.ingrediente.create({ data: { nome: 'funghi' } }),
    prisma.ingrediente.create({ data: { nome: 'salame piccante' } }),
    prisma.ingrediente.create({ data: { nome: 'gorgonzola' } }),
    prisma.ingrediente.create({ data: { nome: 'rucola' } }),
    prisma.ingrediente.create({ data: { nome: 'bresaola' } }),
    prisma.ingrediente.create({ data: { nome: 'olive' } }),
  ]);

  // Categorie Pizza
  const catClassiche = await prisma.categoriaPizza.create({ data: { nome: 'Classiche', ordine: 1 } });
  const catSpeciali = await prisma.categoriaPizza.create({ data: { nome: 'Speciali', ordine: 2 } });
  const catBianche = await prisma.categoriaPizza.create({ data: { nome: 'Bianche', ordine: 3 } });
  const catCalzoni = await prisma.categoriaPizza.create({ data: { nome: 'Calzoni', ordine: 4 } });

  // Pizze
  const p1 = await prisma.pizza.create({
    data: {
      nome: 'Margherita',
      descrizione: 'Pomodoro, mozzarella, basilico',
      prezzoBase: 7.0,
      categoriaId: catClassiche.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[0].id },
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[2].id },
        ],
      },
    },
  });

  const p2 = await prisma.pizza.create({
    data: {
      nome: 'Marinara',
      descrizione: 'Pomodoro, aglio, origano',
      prezzoBase: 6.0,
      categoriaId: catClassiche.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[0].id },
          { ingredienteId: ingredienti[3].id },
        ],
      },
    },
  });

  const p3 = await prisma.pizza.create({
    data: {
      nome: 'Diavola',
      descrizione: 'Pomodoro, mozzarella, salame piccante',
      prezzoBase: 8.5,
      categoriaId: catClassiche.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[0].id },
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[6].id },
        ],
      },
    },
  });

  const p4 = await prisma.pizza.create({
    data: {
      nome: 'Prosciutto',
      descrizione: 'Pomodoro, mozzarella, prosciutto cotto',
      prezzoBase: 8.5,
      categoriaId: catClassiche.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[0].id },
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[4].id },
        ],
      },
    },
  });

  const p5 = await prisma.pizza.create({
    data: {
      nome: 'Quattro Stagioni',
      descrizione: 'Pomodoro, mozzarella, funghi, olive, prosciutto',
      prezzoBase: 9.5,
      categoriaId: catSpeciali.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[0].id },
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[4].id },
          { ingredienteId: ingredienti[5].id },
          { ingredienteId: ingredienti[10].id },
        ],
      },
    },
  });

  const p6 = await prisma.pizza.create({
    data: {
      nome: 'Gorgonzola',
      descrizione: 'Mozzarella, gorgonzola',
      prezzoBase: 9.0,
      categoriaId: catBianche.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[7].id },
        ],
      },
    },
  });

  const p7 = await prisma.pizza.create({
    data: {
      nome: 'Bresaola',
      descrizione: 'Mozzarella, bresaola, rucola, grana',
      prezzoBase: 10.5,
      categoriaId: catSpeciali.id,
      ingredienti: {
        create: [
          { ingredienteId: ingredienti[1].id },
          { ingredienteId: ingredienti[9].id },
          { ingredienteId: ingredienti[8].id },
        ],
      },
    },
  });


  // Categorie Aggiunte
  const catFormaggi = await prisma.categoriaAggiunta.create({ data: { nome: 'Formaggi' } });
  const catSalumi = await prisma.categoriaAggiunta.create({ data: { nome: 'Salumi' } });
  const catVerdure = await prisma.categoriaAggiunta.create({ data: { nome: 'Verdure' } });
  const catExtra = await prisma.categoriaAggiunta.create({ data: { nome: 'Extra' } });

  // Aggiunte
  await prisma.aggiunta.create({ data: { nome: 'Mozzarella extra', prezzo: 1.0, categoriaId: catFormaggi.id } });
  await prisma.aggiunta.create({ data: { nome: 'Gorgonzola (aggiunta)', prezzo: 1.5, categoriaId: catFormaggi.id } });
  await prisma.aggiunta.create({ data: { nome: 'Prosciutto cotto (aggiunta)', prezzo: 1.5, categoriaId: catSalumi.id } });
  await prisma.aggiunta.create({ data: { nome: 'Speck', prezzo: 1.5, categoriaId: catSalumi.id } });
  await prisma.aggiunta.create({ data: { nome: 'Funghi (aggiunta)', prezzo: 1.0, categoriaId: catVerdure.id } });
  await prisma.aggiunta.create({ data: { nome: 'Olive (aggiunta)', prezzo: 0.8, categoriaId: catVerdure.id } });
  await prisma.aggiunta.create({ data: { nome: 'Rucola (aggiunta)', prezzo: 0.8, categoriaId: catVerdure.id } });
  await prisma.aggiunta.create({ data: { nome: 'Doppio impasto', prezzo: 1.0, categoriaId: catExtra.id } });
  await prisma.aggiunta.create({ data: { nome: 'Bordo ripieno', prezzo: 1.5, categoriaId: catExtra.id } });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
