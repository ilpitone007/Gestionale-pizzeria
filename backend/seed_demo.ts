import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Avvio popolamento dati demo...');

  const utenteAdmin = await prisma.utente.findUnique({ where: { username: 'admin' } });
  if (!utenteAdmin) {
    console.error("Utente admin non trovato. Eseguire prima il seed RBAC.");
    return;
  }

  // Crea ordini per OGGI
  const oggi = new Date();

  // Ordine In Corso 1
  const d1 = new Date(oggi);
  d1.setHours(d1.getHours() + 1); // Tra un'ora

  await prisma.ordine.create({
    data: {
      numeroOrdine: 101,
      nomeCliente: 'Luigi Bianchi',
      telefonoCliente: '333 1122334',
      orarioConsegna: d1,
      tipoRitiro: 'asporto',
      stato: 'in_corso',
      metodoPagamento: 'contanti',
      totaleOrdine: 15.50,
      operatoreId: utenteAdmin.id,
      voci: {
        create: [
          {
            pizzaId: 1, // Margherita
            nomePizzaSnapshot: 'Margherita',
            prezzoBaseSnapshot: 7.00,
            prezzoTotaleVoce: 7.00,
            posizione: 1
          },
          {
            pizzaId: 3, // Diavola
            nomePizzaSnapshot: 'Diavola',
            prezzoBaseSnapshot: 8.50,
            prezzoTotaleVoce: 8.50,
            posizione: 2
          }
        ]
      }
    }
  });

  // Ordine Pronto 2
  const d2 = new Date(oggi);
  d2.setMinutes(d2.getMinutes() + 15);

  await prisma.ordine.create({
    data: {
      numeroOrdine: 102,
      nomeCliente: 'Francesca Neri',
      telefonoCliente: '333 9988776',
      orarioConsegna: d2,
      tipoRitiro: 'domicilio',
      indirizzoConsegna: 'Via Roma 12',
      stato: 'confermato',
      metodoPagamento: 'carta',
      totaleOrdine: 25.00,
      operatoreId: utenteAdmin.id,
      scontoFisso: 2.00,
      voci: {
        create: [
          {
            pizzaId: 5, // Quattro Stagioni
            nomePizzaSnapshot: 'Quattro Stagioni',
            prezzoBaseSnapshot: 9.50,
            prezzoTotaleVoce: 10.50,
            note: 'Senza olive',
            posizione: 1,
            aggiunteSelezionate: {
              create: [
                {
                  aggiuntaId: 1, // Mozzarella extra
                  nomeAggiuntaSnapshot: 'Mozzarella extra',
                  prezzoAggiuntaSnapshot: 1.00
                }
              ]
            }
          },
          {
             pizzaId: 6, // Gorgonzola
             nomePizzaSnapshot: 'Gorgonzola',
             prezzoBaseSnapshot: 9.00,
             prezzoTotaleVoce: 9.00,
             posizione: 2
          }
        ]
      }
    }
  });

  // Ordine Storico (ritirato) per Statistiche
  const d3 = new Date(oggi);
  d3.setHours(d3.getHours() - 2);

  await prisma.ordine.create({
    data: {
      numeroOrdine: 99,
      nomeCliente: 'Marco Rossi',
      orarioConsegna: d3,
      stato: 'ritirato',
      totaleOrdine: 14.00,
      operatoreId: utenteAdmin.id,
      voci: {
        create: [
          {
             nomePizzaSnapshot: 'Marinara',
             prezzoBaseSnapshot: 6.00,
             prezzoTotaleVoce: 6.00,
             posizione: 1
          },
          {
             nomePizzaSnapshot: 'Diavola',
             prezzoBaseSnapshot: 8.00,
             prezzoTotaleVoce: 8.00,
             posizione: 2
          }
        ]
      }
    }
  });

  // Aggiungi Log Audit
  await prisma.auditLog.create({
    data: {
      utenteId: utenteAdmin.id,
      azione: 'LOGIN',
      dettagli: 'Accesso sistema effettuato'
    }
  });

  await prisma.auditLog.create({
    data: {
      utenteId: utenteAdmin.id,
      azione: 'CREAZIONE',
      entitaId: 101,
      dettagli: 'Creato ordine #101'
    }
  });

  console.log('Seed dati demo completato.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
