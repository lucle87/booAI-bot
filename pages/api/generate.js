// pages/api/generate.js — Hugging Face Inference API
export const config = {
  maxDuration: 60,
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ error: 'Hugging Face API key not configured.' })
  }

  const HF_KEY = process.env.HUGGINGFACE_API_KEY

  try {
    // ===== TEXT TO IMAGE =====
    if (taskType === 'TEXT_TO_IMAGE' || taskType === 'GENERATE_NFT_ART') {
      const prompt = params.description || params.prompt || 'a beautiful artwork'
      const style = params.style || ''
      const fullPrompt = style ? `${prompt}, ${style} style, high quality` : `${prompt}, high quality`

      const response = await fetch(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              negative_prompt: 'blurry, bad quality, ugly, deformed, watermark',
              num_inference_steps: 25,
              guidance_scale: 7.5,
            }
          }),
        }
      )

      if (response.status === 503) {
        return res.status(200).json({ error: 'Model is loading, please try again in 20 seconds.' })
      }
      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Image generation failed: ${err}`)
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return res.status(200).json({
        type: 'image',
        url: `data:image/jpeg;base64,${base64}`,
        prompt: fullPrompt,
      })
    }

    // ===== IMAGE TO VIDEO (animate image) =====
    if (taskType === 'IMAGE_TO_VIDEO') {
      const style = params.style || 'anime'
      const duration = params.duration || 5
      const imageDesc = params.imageDescription || 'the attached image'

      // Generate animated version using SDXL with motion prompt
      const animPrompt = `${imageDesc}, ${style} style, dynamic motion, animated scene, cinematic, smooth animation, high quality`

      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: animPrompt,
            parameters: {
              negative_prompt: 'static, blurry, bad quality, ugly',
              num_inference_steps: 30,
              guidance_scale: 8,
            }
          }),
        }
      )

      if (response.status === 503) {
        return res.status(200).json({ error: 'Model is loading, please try again in 20 seconds.' })
      }
      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Generation failed: ${err}`)
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return res.status(200).json({
        type: 'image',
        url: `data:image/jpeg;base64,${base64}`,
        note: `🎬 Animated style preview (${duration}s ${style} video) — Full video generation coming soon!`,
        prompt: animPrompt,
      })
    }

    // ===== TEXT TO VIDEO =====
    if (taskType === 'TEXT_TO_VIDEO') {
      const prompt = params.description || params.prompt || 'a beautiful cinematic scene'
      const style = params.style || 'cinematic'
      const fullPrompt = `${prompt}, ${style}, high quality, detailed, dramatic lighting`

      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              negative_prompt: 'blurry, bad quality, static, boring',
              num_inference_steps: 25,
              guidance_scale: 7.5,
            }
          }),
        }
      )

      if (response.status === 503) {
        return res.status(200).json({ error: 'Model is loading, please try again in 20 seconds.' })
      }
      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Generation failed: ${err}`)
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return res.status(200).json({
        type: 'image',
        url: `data:image/jpeg;base64,${base64}`,
        note: '🎬 Video storyboard preview — Full video generation coming soon!',
        prompt: fullPrompt,
      })
    }

    // ===== TEXT TO MUSIC =====
    if (taskType === 'TEXT_TO_MUSIC') {
      const genre = params.genre || 'electronic'
      const mood = params.mood || 'upbeat'
      const prompt = `${genre} ${mood} music, high quality`

      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/musicgen-small',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_KEY}`,
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
      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Music generation failed: ${err}`)
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      return res.status(200).json({
        type: 'audio',
        url: `data:audio/wav;base64,${base64}`,
        prompt,
      })
    }

    // ===== FALLBACK =====
    return res.status(400).json({ error: `Unsupported task type: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message || 'Generation failed. Please try again.' })
  }
}