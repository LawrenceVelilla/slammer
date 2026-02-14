import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    frontHtml: { type: String, default: '' },
    backHtml: { type: String, default: '' },
    sourceFile: { type: String, required: true },
    deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    deckName: { type: String, default: 'Imported Deck' },
  },
  { timestamps: true }
);

cardSchema.index({ deckId: 1, createdAt: -1 });
cardSchema.index({ sourceFile: 1, createdAt: -1 });
cardSchema.index({ front: 'text', back: 'text', deckName: 'text' });

const Card = mongoose.model('Card', cardSchema);

export default Card;
