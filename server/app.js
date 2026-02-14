import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { parseAnkiCardTxt } from './utils/anki-parser.js'
import { logError } from './utils/logger.js'
import requestLogger from './middleware/request-logger.js'
import rateLimit from './middleware/rate-limit.js'
import { legacyRouter } from './routes/index.js'

const PORT = 3000;
const app = express()

app.use(cors())
app.use(requestLogger)
app.use(rateLimit())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.static('public'))

// File upload
const store = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: store })

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const cards = parseAnkiCardTxt(req.file.path)
    res.json({ total: cards.length, cards })
})

// List available decks in uploads/
app.get('/decks', (req, res) => {
    const files = fs.readdirSync('uploads/').filter(f => f.endsWith('.txt'))
    const decks = files.map(f => ({
        filename: f,
        name: path.parse(f).name,
    }))
    res.json({ decks })
})

// Get parsed cards from a specific deck
app.get('/decks/:filename', (req, res) => {
    const filePath = path.join('uploads', req.params.filename)
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Deck not found' })
    }
    const cards = parseAnkiCardTxt(filePath)
    res.json({ name: path.parse(req.params.filename).name, total: cards.length, cards })
})

// Aboudi's routes (chat, cards, decks CRUD, health)
app.use(legacyRouter)

// Error handler
app.use((err, req, res, next) => {
    logError({
        event: 'request.error',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        message: err.message,
    })
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large' })
    }
    if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Uploaded file exceeds size limit' })
    }
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
