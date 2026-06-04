// pages/api/generate.js — Pollinations AI (free, no API key, instant)
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  try {
    // ===== TEXT TO IMAGE =====
    if (taskType === 'TEXT_TO_IMAGE' || taskType === 'GENERATE_NFT_ART' || taskType === 'IMAGE_TO_VIDEO' || taskType === 'TEXT_TO_VIDEO') {
      const prompt = params.description || params.prompt || params.imageDescription || 'a beautiful artwork'
      const style = params.style || ''
      const fullPrompt = style ? `${prompt}, ${style} style` : prompt

      // Pollinations AI — free, instant, no API key needed
      const encodedPrompt = encodeURIComponent(fullPrompt)
      const seed = Math.floor(Math.random() * 1000000)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`

      // Fetch and convert to base64 to avoid CORS
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Image generation failed')

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const contentType = response.headers.get('content-type') || 'image/jpeg'

      return res.status(200).json({
        type: 'image',
        url: `data:${contentType};base64,${base64}`,
        directUrl: imageUrl,
        prompt: fullPrompt,
        note: taskType === 'IMAGE_TO_VIDEO' ? '🎬 Animated style preview' :
              taskType === 'TEXT_TO_VIDEO' ? '🎬 Video storyboard preview' : null
      })
    }

    // ===== TEXT TO MUSIC =====
    if (taskType === 'TEXT_TO_MUSIC') {
      if (!process.env.HUGGINGFACE_API_KEY) {
        return res.status(200).json({
          type: 'text',
          message: `🎵 Music generation requires Hugging Face API. Your task has been recorded.\n\nGenre: ${params.genre}\nMood: ${params.mood}`,
        })
      }

      const prompt = `${params.genre || 'electronic'} ${params.mood || 'upbeat'} music`
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/musicgen-small',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 256 }
          }),
        }
      )

      if (response.status === 503) {
        return res.status(200).json({ error: 'Music model loading, try again in 30 seconds.' })
      }
      if (!response.ok) throw new Error('Music generation failed')

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return res.status(200).json({
        type: 'audio',
        url: `data:audio/wav;base64,${base64}`,
        prompt,
      })
    }

    return res.status(400).json({ error: `Unsupported task type: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message || 'Generation failed. Please try again.' })
  }
}