import 'dotenv/config'

const API_KEY = process.env.ELEVENLABS_API_KEY

async function main() {
  if (!API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY in environment')
    process.exit(1)
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
      },
    })

    if (!res.ok) {
      console.error('Request failed', res.status, res.statusText)
      const text = await res.text()
      console.error(text)
      process.exit(1)
    }

    const data = await res.json()
    const voices = Array.isArray(data?.voices) ? data.voices : []
    console.log('OK: Connected to ElevenLabs, voices found:', voices.length)
  } catch (err: any) {
    console.error('Error connecting to ElevenLabs:', err?.message || err)
    process.exit(1)
  }
}

main()
