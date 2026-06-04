// pages/api/generate.js — Pollinations AI (free, instant, no API key)
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  try {

    // ===== TEXT TO IMAGE =====
    if (taskType === 'TEXT_TO_IMAGE' || taskType === 'GENERATE_NFT_ART') {
      const prompt = params.description || params.prompt || 'a beautiful artwork'
      const style = params.style || ''
      const fullPrompt = style ? `${prompt}, ${style} style, high quality` : `${prompt}, high quality`
      const seed = Math.floor(Math.random() * 999999)
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`

      return res.status(200).json({
        type: 'image',
        url,
        prompt: fullPrompt,
      })
    }

    // ===== IMAGE TO VIDEO (animated style) =====
    if (taskType === 'IMAGE_TO_VIDEO') {
      const desc = params.imageDescription || 'an image'
      const style = params.style || 'anime'
      const fullPrompt = `${desc}, ${style} style, dynamic motion, animated, cinematic, high quality`
      const seed = Math.floor(Math.random() * 999999)
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=576&seed=${seed}&nologo=true&enhance=true`

      return res.status(200).json({
        type: 'image',
        url,
        prompt: fullPrompt,
        note: '🎬 Animated style preview — Full video coming soon!',
      })
    }

    // ===== TEXT TO VIDEO =====
    if (taskType === 'TEXT_TO_VIDEO') {
      const prompt = params.description || params.prompt || 'a cinematic scene'
      const style = params.style || 'cinematic'
      const fullPrompt = `${prompt}, ${style}, movie still, dramatic lighting, high quality`
      const seed = Math.floor(Math.random() * 999999)
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&seed=${seed}&nologo=true&enhance=true`

      return res.status(200).json({
        type: 'image',
        url,
        prompt: fullPrompt,
        note: '🎬 Video storyboard preview — Full video coming soon!',
      })
    }

    // ===== TEXT TO MUSIC =====
    if (taskType === 'TEXT_TO_MUSIC') {
      if (!process.env.HUGGINGFACE_API_KEY) {
        return res.status(200).json({
          type: 'text',
          message: `🎵 Music task recorded!\n\nGenre: ${params.genre || 'electronic'}\nMood: ${params.mood || 'upbeat'}\n\nMusic generation API coming soon!`,
        })
      }

      const prompt = `${params.genre || 'electronic'} ${params.mood || 'upbeat'} music, high quality`
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