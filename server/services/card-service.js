import path from 'path';
import Card from '../models/Card.js';
import Deck from '../models/Deck.js';
import { parseAnkiCardTxt } from '../utils/anki-parser.js';
import { createDeck } from './deck-service.js';
import { buildPaginationMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/query.js';
import { logAudit } from '../utils/logger.js';

async function getCardsPage({
  page = 1,
  limit = 100,
  deckId,
  q,
  sourceFile,
  sortBy = 'createdAt',
  sortOrder = -1,
}) {
  const filter = {};
  if (deckId) filter.deckId = deckId;
  if (sourceFile) filter.sourceFile = sourceFile;
  if (q) {
    const safe = escapeRegex(q);
    filter.$or = [
      { front: { $regex: safe, $options: 'i' } },
      { back: { $regex: safe, $options: 'i' } },
      { deckName: { $regex: safe, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };
  const [cards, total] = await Promise.all([
    Card.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('deckId', 'name'),
    Card.countDocuments(filter),
  ]);

  return { cards, meta: buildPaginationMeta({ total, page, limit }) };
}

async function getCardsForDeck(deckId, { page = 1, limit = 100, q, sortBy, sortOrder } = {}) {
  const deckExists = await Deck.exists({ _id: deckId });
  if (!deckExists) {
    const error = new Error('Deck not found');
    error.statusCode = 404;
    throw error;
  }

  return getCardsPage({ page, limit, deckId, q, sortBy, sortOrder });
}

async function importCardsFromFile(file, deckNameInput, context = {}) {
  const parsedCards = parseAnkiCardTxt(file.path);
  const deckName = deckNameInput || path.parse(file.originalname).name;

  if (parsedCards.length === 0) {
    const error = new Error('No valid cards found in file');
    error.statusCode = 400;
    throw error;
  }

  const deckResult = await createDeck({ name: deckName }, context);

  const docsToInsert = parsedCards.map((card) => ({
    front: card.front,
    back: card.back,
    frontHtml: card.frontHtml,
    backHtml: card.backHtml,
    sourceFile: file.originalname,
    deckId: deckResult.deck._id,
    deckName,
  }));

  const inserted = await Card.insertMany(docsToInsert);
  logAudit('cards.imported', {
    requestId: context.requestId,
    deckId: deckResult.deck._id.toString(),
    deckName,
    totalSaved: inserted.length,
    sourceFile: file.originalname,
  });

  return {
    totalParsed: parsedCards.length,
    totalSaved: inserted.length,
    deckId: deckResult.deck._id,
    deckName,
  };
}

async function updateCardById(cardId, updates, context = {}) {
  const allowed = ['front', 'back', 'frontHtml', 'backHtml'];
  const sanitized = {};

  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }

  if (Object.keys(sanitized).length === 0) {
    const error = new Error('No valid updatable fields provided');
    error.statusCode = 400;
    throw error;
  }

  const card = await Card.findByIdAndUpdate(cardId, sanitized, { new: true, runValidators: true }).populate('deckId', 'name');
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }
  logAudit('card.updated', { requestId: context.requestId, cardId });

  return card;
}

async function deleteCardById(cardId, context = {}) {
  const deleted = await Card.findByIdAndDelete(cardId);
  if (!deleted) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }
  logAudit('card.deleted', { requestId: context.requestId, cardId });

  return { deletedCardId: cardId };
}

export { getCardsPage, getCardsForDeck, importCardsFromFile, updateCardById, deleteCardById };
