import Deck from '../models/Deck.js';
import Card from '../models/Card.js';

const id = '001-backfill-card-deck-id';
const description = 'Backfill card.deckId from card.deckName where missing';

async function up() {
  const cards = await Card.find({
    $or: [{ deckId: { $exists: false } }, { deckId: null }],
  }).select('_id deckName');

  let updated = 0;

  for (const card of cards) {
    const deckName = card.deckName || 'Imported Deck';
    let deck = await Deck.findOne({ name: deckName });
    if (!deck) {
      deck = await Deck.create({ name: deckName });
    }

    await Card.updateOne({ _id: card._id }, { $set: { deckId: deck._id } });
    updated += 1;
  }

  return { scanned: cards.length, updated };
}

export default { id, description, up };
