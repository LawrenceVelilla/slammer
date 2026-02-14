import Deck from '../models/Deck.js';
import Card from '../models/Card.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/query.js';
import { logAudit } from '../utils/logger.js';

async function listDecks({ page = 1, limit = 100, q, sortBy = 'createdAt', sortOrder = -1 } = {}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (q) {
    const safe = escapeRegex(q);
    filter.$or = [{ name: { $regex: safe, $options: 'i' } }, { description: { $regex: safe, $options: 'i' } }];
  }
  const sort = { [sortBy]: sortOrder };
  const [decks, total] = await Promise.all([
    Deck.find(filter).sort(sort).skip(skip).limit(limit),
    Deck.countDocuments(filter),
  ]);

  return { decks, meta: buildPaginationMeta({ total, page, limit }) };
}

async function createDeck({ name, description = '' }, context = {}) {
  if (!name || !name.trim()) {
    const error = new Error('Deck name is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const existingDeck = await Deck.findOne({ name: normalizedName });
  if (existingDeck) return { deck: existingDeck, created: false };

  const deck = await Deck.create({ name: normalizedName, description: description.trim() });
  logAudit('deck.created', { requestId: context.requestId, deckId: deck._id.toString(), name: deck.name });
  return { deck, created: true };
}

async function deleteDeckById(deckId, context = {}) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    const error = new Error('Deck not found');
    error.statusCode = 404;
    throw error;
  }

  const deleteCardsResult = await Card.deleteMany({ deckId });
  await Deck.deleteOne({ _id: deckId });
  logAudit('deck.deleted', {
    requestId: context.requestId,
    deckId,
    deletedCards: deleteCardsResult.deletedCount || 0,
  });

  return {
    deletedDeckId: deckId,
    deletedCards: deleteCardsResult.deletedCount || 0,
  };
}

export { listDecks, createDeck, deleteDeckById };
