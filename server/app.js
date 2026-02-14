import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { parseAnkiCardTxt } from './utils/anki-parser.js';
import { connectDB } from './db/config.js';
import Card from './models/Card.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;
const app = express();
const uploadDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: store });

app.get('/health', (req, res) => {
  res.json({ ok: true, dbState: Card.db.readyState });
});

app.get('/cards', async (req, res) => {
  const cards = await Card.find().sort({ createdAt: -1 }).limit(100);
  res.json({ total: cards.length, cards });
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const parsedCards = parseAnkiCardTxt(req.file.path);
  const deckName = req.body.deckName || path.parse(req.file.originalname).name;

  if (parsedCards.length === 0) {
    return res.status(400).json({ error: 'No valid cards found in file' });
  }

  const docsToInsert = parsedCards.map((card) => ({
    front: card.front,
    back: card.back,
    frontHtml: card.frontHtml,
    backHtml: card.backHtml,
    sourceFile: req.file.originalname,
    deckName,
  }));

  const inserted = await Card.insertMany(docsToInsert);

  return res.json({
    totalParsed: parsedCards.length,
    totalSaved: inserted.length,
    deckName,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ error: err.message || 'Internal Server Error' });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
