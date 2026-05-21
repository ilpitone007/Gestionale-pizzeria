import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper: Crea Audit Log
async function createAuditLog(utenteId: number | undefined, azione: string, entitaId: number, dettagli?: string) {
  try {
    if (!utenteId) return;
    await prisma.auditLog.create({
      data: { utenteId, azione, entitaId, dettagli }
    });
  } catch (error) {
    console.error("Errore salvataggio audit:", error);
  }
}

// API: Crea Ordine
router.post('/', async (req, res) => {
  try {
    const {
      nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci,
      tipoRitiro, indirizzoConsegna, noteCitofono,
      metodoPagamento, scontoFisso, scontoPercentuale, importoRicevuto
    } = req.body;

    const utenteId = req.utente?.id;

    // 0. Controlla il limite di ordini per la fascia oraria di consegna
    const consegnaTime = new Date(orarioConsegna);

    // Troviamo quanti ordini ci sono già in quella fascia (15 min)
    // Es: consegna 20:15 -> fascia 20:00 - 20:15
    const limiteSetting = await prisma.impostazione.findUnique({ where: { id: 'limite_ordini_fascia' }});
    const maxOrdiniPerFascia = parseInt(limiteSetting?.valore || '10');

    // Meno 15 minuti all'orario richiesto fino all'orario esatto
    const fasciaStart = new Date(consegnaTime.getTime() - 15 * 60000);

    const ordiniInFascia = await prisma.ordine.count({
      where: {
        orarioConsegna: {
          gt: fasciaStart,
          lte: consegnaTime
        },
        stato: { not: 'annullato' }
      }
    });

    if (ordiniInFascia >= maxOrdiniPerFascia) {
      return res.status(400).json({
        error: `Fascia oraria satura. Limite massimo di ${maxOrdiniPerFascia} ordini raggiunto per quest'orario.`
      });
    }

    // 1. Get current max order number for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.ordine.aggregate({
      where: {
        dataOrdine: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      _max: {
        numeroOrdine: true,
      }
    });

    const nextNumeroOrdine = (result._max.numeroOrdine || 0) + 1;

    let totaleOrdine = 0;

    // Prepare voci
    const vociCreate = voci.map((voce: any, index: number) => {
      let prezzoTotaleVoce = voce.prezzoBase;
      const aggiunteSelezionate = voce.aggiunte.map((agg: any) => {
        prezzoTotaleVoce += agg.prezzo;
        return {
          aggiuntaId: agg.id,
          nomeAggiuntaSnapshot: agg.nome,
          prezzoAggiuntaSnapshot: agg.prezzo
        };
      });

      if (voce.impasto) {
        prezzoTotaleVoce += voce.impasto.sovrapprezzo;
      }

      totaleOrdine += prezzoTotaleVoce;

      return {
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot: voce.nomePizza,
        prezzoBaseSnapshot: voce.prezzoBase,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId: voce.impasto?.id,
        nomeImpastoSnapshot: voce.impasto?.nome,
        prezzoImpastoSnapshot: voce.impasto?.sovrapprezzo,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      };
    });


    // Calcolo Totale Finale (dopo sconti)
    let scontoVal = scontoFisso || 0;
    if (scontoPercentuale) {
      scontoVal += (totaleOrdine * (scontoPercentuale / 100));
    }
    const totaleScontato = Math.max(0, totaleOrdine - scontoVal);

    // Calcolo Resto
    let resto = null;
    if (metodoPagamento === 'contanti' && importoRicevuto !== undefined) {
      resto = Math.max(0, importoRicevuto - totaleScontato);
    }

    const ordine = await prisma.ordine.create({
      data: {
        numeroOrdine: nextNumeroOrdine,
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna),
        noteGenerali,
        tipoRitiro: tipoRitiro || 'asporto',
        indirizzoConsegna,
        noteCitofono,
        totaleOrdine: totaleScontato,
        metodoPagamento,
        scontoFisso: scontoFisso || 0,
        scontoPercentuale: scontoPercentuale || 0,
        importoRicevuto,
        resto,
        operatoreId: utenteId,
        voci: {
          create: vociCreate
        }
      },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          }
        }
      }
    });

    // Registra nell'audit log
    await createAuditLog(utenteId, "CREAZIONE", ordine.id, `Creato ordine #${ordine.numeroOrdine}`);

    res.status(201).json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la creazione dell\'ordine' });
  }
});

// API: Ordini Attivi
router.get('/attivi', async (req, res) => {
  try {
    const ordini = await prisma.ordine.findMany({
      where: {
        stato: { notIn: ['ritirato', 'annullato'] }
      },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          },
          orderBy: { posizione: 'asc' }
        }
      },
      orderBy: { orarioConsegna: 'asc' }
    });

    // Add missing minutes
    const now = new Date().getTime();
    const formattedOrdini = ordini.map((o: any) => {
      const msDiff = new Date(o.orarioConsegna).getTime() - now;
      const minutiAllaConsegna = Math.round(msDiff / 60000);
      return {
        ...o,
        minutiAllaConsegna
      };
    });

    res.json(formattedOrdini);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero degli ordini' });
  }
});

// API: Recupera Singolo Ordine (per Modifica)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ignoriamo "attivi" come ID per non collidere con la rotta sopra (in caso di chiamate errate)
    if (id === 'attivi') return next();

    const ordine = await prisma.ordine.findUnique({
      where: { id: parseInt(id) },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          },
          orderBy: { posizione: 'asc' }
        }
      }
    });
    if (!ordine) return res.status(404).json({ error: "Ordine non trovato" });
    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore" });
  }
});

// API: Aggiorna stato ordine (es. ritirato)
router.patch('/:id/stato', async (req, res) => {
  try {
    const { id } = req.params;
    const { stato } = req.body;

    const ordine = await prisma.ordine.update({
      where: { id: parseInt(id) },
      data: { stato, modificatoIl: new Date() }
    });

    await createAuditLog(req.utente?.id, "AGGIORNAMENTO_STATO", ordine.id, `Stato modificato in: ${stato}`);

    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'ordine" });
  }
});

// API: Aggiorna Ordine Completo (Modifica)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci,
      tipoRitiro, indirizzoConsegna, noteCitofono,
      metodoPagamento, scontoFisso, scontoPercentuale, importoRicevuto
    } = req.body;

    // 0. Controlla il limite di ordini per la fascia oraria di consegna (solo se l'orario cambia o se l'ordine non è ancora stato calcolato correttamente, ma in generale è meglio verificare sempre)
    const consegnaTime = new Date(orarioConsegna);

    const limiteSetting = await prisma.impostazione.findUnique({ where: { id: 'limite_ordini_fascia' }});
    const maxOrdiniPerFascia = parseInt(limiteSetting?.valore || '10');

    const fasciaStart = new Date(consegnaTime.getTime() - 15 * 60000);

    const ordiniInFascia = await prisma.ordine.count({
      where: {
        id: { not: parseInt(id) }, // Escludi l'ordine che si sta modificando
        orarioConsegna: {
          gt: fasciaStart,
          lte: consegnaTime
        },
        stato: { not: 'annullato' }
      }
    });

    if (ordiniInFascia >= maxOrdiniPerFascia) {
      return res.status(400).json({
        error: `Fascia oraria satura. Limite massimo di ${maxOrdiniPerFascia} ordini raggiunto per quest'orario.`
      });
    }

    // Cancelliamo le vecchie voci e le ricreiamo per semplicità
    await prisma.voceOrdine.deleteMany({
      where: { ordineId: parseInt(id) }
    });

    let totaleOrdine = 0;

    const vociCreate = voci.map((voce: any, index: number) => {
      let prezzoTotaleVoce = voce.prezzoBase;
      const aggiunteSelezionate = voce.aggiunte.map((agg: any) => {
        prezzoTotaleVoce += agg.prezzo;
        return {
          aggiuntaId: agg.id,
          nomeAggiuntaSnapshot: agg.nome,
          prezzoAggiuntaSnapshot: agg.prezzo
        };
      });

      if (voce.impasto) {
        prezzoTotaleVoce += voce.impasto.sovrapprezzo;
      }

      totaleOrdine += prezzoTotaleVoce;

      return {
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot: voce.nomePizza,
        prezzoBaseSnapshot: voce.prezzoBase,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId: voce.impasto?.id,
        nomeImpastoSnapshot: voce.impasto?.nome,
        prezzoImpastoSnapshot: voce.impasto?.sovrapprezzo,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      };
    });

    // Calcolo Totale Finale (dopo sconti)
    let scontoVal = scontoFisso || 0;
    if (scontoPercentuale) {
      scontoVal += (totaleOrdine * (scontoPercentuale / 100));
    }
    const totaleScontato = Math.max(0, totaleOrdine - scontoVal);

    // Calcolo Resto
    let resto = null;
    if (metodoPagamento === 'contanti' && importoRicevuto !== undefined) {
      resto = Math.max(0, importoRicevuto - totaleScontato);
    }

    const ordine = await prisma.ordine.update({
      where: { id: parseInt(id) },
      data: {
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna),
        noteGenerali,
        tipoRitiro: tipoRitiro || 'asporto',
        indirizzoConsegna,
        noteCitofono,
        totaleOrdine: totaleScontato,
        metodoPagamento,
        scontoFisso: scontoFisso || 0,
        scontoPercentuale: scontoPercentuale || 0,
        importoRicevuto,
        resto,
        modificatoIl: new Date(),
        voci: {
          create: vociCreate
        }
      }
    });

    await createAuditLog(req.utente?.id, "MODIFICA", ordine.id, `Ordine modificato`);

    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante la modifica dell'ordine" });
  }
});

// API: Elimina Ordine (Annullamento definitivo)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Invece di eliminarlo completamente, lo passiamo in annullato per tracciarlo
    const ordine = await prisma.ordine.update({
      where: { id: parseInt(id) },
      data: { stato: 'annullato', modificatoIl: new Date() }
    });

    await createAuditLog(req.utente?.id, "CANCELLAZIONE", ordine.id, `Ordine annullato.`);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'ordine" });
  }
});

export default router;
