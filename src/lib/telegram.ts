
const BOT_Token = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_ID = process.env.ADMIN_CHAT_ID

export async function sendTelegramMessage(text: string) {
  if (!BOT_Token || !ADMIN_ID) return console.warn('Telegram creds missing')
  
  try {
    const url = `https://api.telegram.org/bot${BOT_Token}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    })
  } catch (e) {
    console.error('Failed to send TG message', e)
  }
}

export async function sendTelegramPhoto(photoUrl: string, caption: string) {
  if (!BOT_Token || !ADMIN_ID) return console.warn('Telegram creds missing')

  try {
    // If it's a local file path (starts with /), we need to handle it differently 
    // or assume the bot and server are same machine (which they are).
    // For standard TG API, sending local files requires FormData. 
    // For simplicity in this environment, we might just notify about the file
    // or if it's a public URL, send that. 
    // Since we are running local, we will send a text notification that a photo is ready 
    // and let the Admin use the Bot's Menu to "Get Pending KYC" which securely sends the local file.
    
    // However, if we want to be "professional", we should upload it.
    // Given the limitations of simple fetch for multipart, we will rely on text notification 
    // + "Check Bot Menu" prompt, OR try to construct a simple multipart request if needed.
    
    // Strategy: Alert Admin with Text, Admin clicks button in Bot to view.
    // This is more secure than trying to pipe local localhost URLs to Telegram API.
    
    await sendTelegramMessage(caption)
  } catch (e) {
    console.error('Failed to send TG photo', e)
  }
}
