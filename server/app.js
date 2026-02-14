import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { logError } from './utils/logger.js'
import requestLogger from './middleware/request-logger.js'
import rateLimit from './middleware/rate-limit.js'
import { legacyRouter } from './routes/index.js'
import { connectDB } from './db/config.js'

const PORT = 3000;
const app = express()

app.use(cors())
app.use(requestLogger)
app.use(rateLimit())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.static('public'))

// All routes (chat, cards, decks CRUD, upload, health)
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

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message)
        process.exit(1)
    })
