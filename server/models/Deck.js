import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

deckSchema.index({ createdAt: -1 });
deckSchema.index({ name: 'text', description: 'text' });

const Deck = mongoose.model('Deck', deckSchema);

export default Deck;
