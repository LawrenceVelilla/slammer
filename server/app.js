import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { parseAnkiCardTxt } from './utils/anki-parser.js'

const PORT = 3000;
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})