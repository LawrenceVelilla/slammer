import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { parseAnkiCardTxt } from './utils/anki-parser.js'
import chatRouter from './routes/chat.js'

const PORT = 3000;
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))


const store = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: store })

app.get('/', (req, res) => {
    res.send('')
})

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

app.use('/chat', chatRouter)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})