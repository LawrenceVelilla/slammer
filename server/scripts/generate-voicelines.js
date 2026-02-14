import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import quotes from './quotes.json' with { type: 'json' }

const VOICE_ID = 'WMKg7TxPpPWCryaXE42r'
const API_KEY = process.env.ELEVEN_LABS_API_KEY
const OUT_DIR = path.resolve('public/voicelines')

if (!API_KEY) {
  console.error('Missing ELEVEN_LABS_API_KEY in .env')
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })

async function generateVoiceline(text, index) {
  const filename = `quote-${String(index).padStart(2, '0')}.mp3`
  const outPath = path.join(OUT_DIR, filename)

  // Skipping already ev
  if (fs.existsSync(outPath)) {
    console.log(`  Skipping ${filename} (already exists)`)
    return filename
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  Failed ${filename}: ${res.status} ${err}`)
    return null
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outPath, buffer)
  console.log(`  Generated ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`)
  return filename
}

console.log(`Generating ${quotes.length} voicelines...\n`)

for (let i = 0; i < quotes.length; i++) {
  const q = quotes[i]
  console.log(`[${i + 1}/${quotes.length}] "${q.text.slice(0, 50)}..." — ${q.author}`)
  await generateVoiceline(q.text, i)
}
