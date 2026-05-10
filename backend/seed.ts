import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ingredienti = [
    'pomodoro', 'mozzarella', 'basilico', 'origano',
    'prosciutto cotto', 'funghi', 'salame piccante',
    'gorgonzola', 'rucola', 'bresaola', 'olive'
  ];

  for (const nome of ingredienti) {
    await prisma.ingrediente.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const categoriePizza = [
    { nome: 'Classiche', ordine: 1 },
    { nome: 'Speciali', ordine: 2 },
    { nome: 'Bianche', ordine: 3 },
    { nome: 'Calzoni', ordine: 4 }
  ];

  for (const cat of categoriePizza) {
    await prisma.categoriaPizza.upsert({
      where: { nome: cat.nome },
      update: { ordine: cat.ordine },
      create: cat,
    });
  }

  const classiche = await prisma.categoriaPizza.findUnique({ where: { nome: 'Classiche' } });
  const speciali = await prisma.categoriaPizza.findUnique({ where: { nome: 'Speciali' } });
  const bianche = await prisma.categoriaPizza.findUnique({ where: { nome: 'Bianche' } });

  const pizze = [
    { nome: 'Margherita', descrizione: 'Pomodoro, mozzarella, basilico', categoriaId: classiche!.id, prezzoBase: 7.00 },
    { nome: 'Marinara', descrizione: 'Pomodoro, aglio, origano', categoriaId: classiche!.id, prezzoBase: 6.00 },
    { nome: 'Diavola', descrizione: 'Pomodoro, mozzarella, salame piccante', categoriaId: classiche!.id, prezzoBase: 8.50 },
    { nome: 'Prosciutto', descrizione: 'Pomodoro, mozzarella, prosciutto cotto', categoriaId: classiche!.id, prezzoBase: 8.50 },
    { nome: 'Quattro Stagioni', descrizione: 'Pomodoro, mozzarella, funghi, olive, prosciutto', categoriaId: speciali!.id, prezzoBase: 9.50 },
    { nome: 'Gorgonzola', descrizione: 'Mozzarella, gorgonzola', categoriaId: bianche!.id, prezzoBase: 9.00 },
    { nome: 'Bresaola', descrizione: 'Mozzarella, bresaola, rucola, grana', categoriaId: speciali!.id, prezzoBase: 10.50 }
  ];

  for (const pizza of pizze) {
    await prisma.pizza.upsert({
      where: { nome: pizza.nome },
      update: {
        prezzoBase: pizza.prezzoBase,
        descrizione: pizza.descrizione,
        categoriaId: pizza.categoriaId
      },
      create: pizza,
    });
  }

  const categorieAggiunta = ['Formaggi', 'Salumi', 'Verdure', 'Extra'];
  for (const nome of categorieAggiunta) {
    await prisma.categoriaAggiunta.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const formaggi = await prisma.categoriaAggiunta.findUnique({ where: { nome: 'Formaggi' } });
  const salumi = await prisma.categoriaAggiunta.findUnique({ where: { nome: 'Salumi' } });
  const verdure = await prisma.categoriaAggiunta.findUnique({ where: { nome: 'Verdure' } });
  const extra = await prisma.categoriaAggiunta.findUnique({ where: { nome: 'Extra' } });

  const aggiunte = [
    { nome: 'Mozzarella extra', prezzo: 1.00, categoriaId: formaggi!.id },
    { nome: 'Gorgonzola', prezzo: 1.50, categoriaId: formaggi!.id },
    { nome: 'Prosciutto cotto', prezzo: 1.50, categoriaId: salumi!.id },
    { nome: 'Speck', prezzo: 1.50, categoriaId: salumi!.id },
    { nome: 'Funghi', prezzo: 1.00, categoriaId: verdure!.id },
    { nome: 'Olive', prezzo: 0.80, categoriaId: verdure!.id },
    { nome: 'Rucola', prezzo: 0.80, categoriaId: verdure!.id },
    { nome: 'Doppio impasto', prezzo: 1.00, categoriaId: extra!.id },
    { nome: 'Bordo ripieno', prezzo: 1.50, categoriaId: extra!.id }
  ];

  for (const agg of aggiunte) {
    await prisma.aggiunta.upsert({
      where: { nome: agg.nome },
      update: { prezzo: agg.prezzo, categoriaId: agg.categoriaId },
      create: agg,
    });
  }

  console.log('Seed database completato!');
}

main()
  .catch((e) => {
    console.error(e);

  })
  .finally(async () => {
    await prisma.$disconnect();
  });
