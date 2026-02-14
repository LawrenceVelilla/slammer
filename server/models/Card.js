import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    frontHtml: { type: String, default: '' },
    backHtml: { type: String, default: '' },
    sourceFile: { type: String, required: true },
    deckName: { type: String, default: 'Imported Deck' },
  },
  { timestamps: true }
);

const Card = mongoose.model('Card', cardSchema);

export default Card;
