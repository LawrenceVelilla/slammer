import express from 'express'
import cors from 'cors'
import multer from 'multer'

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

app.post('/upload', upload.single('file'), async (req, res) => {
    const parsed = await parseFile(req.file)

    res.json(parsed)
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})