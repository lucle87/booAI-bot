// pages/api/generate.js — Hugging Face Inference API
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ error: 'Hugging Face API key not configured.' })
  }

  try {
    if (taskType === 'TEXT_TO_IMAGE' || taskType === 'GENERATE_NFT_ART') {
      const prompt = params.description || params.prompt || 'a beautiful artwork'
      const style = params.style || ''
      const fullPrompt = style ? `${prompt}, ${style} style` : prompt

      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              negative_prompt: 'blurry, bad quality, ugly, deformed',
              num_inference_steps: 25,
              guidance_scale: 7.5,
            }
          }),
        }
      )

      if (!response.ok) {
        const err = await response.text()
        // Model loading
        if (response.status === 503) {
          return res.status(200).json({ 
            error: 'Model is loading, please try again in 20 seconds.' 
          })
        }
        throw new Error(err || `HF error: ${response.status}`)
      }

      // Response is image binary
      const imageBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(imageBuffer).toString('base64')
      const imageUrl = `data:image/jpeg;base64,${base64}`

      return res.status(200).json({
        type: 'image',
        url: imageUrl,
        prompt: fullPrompt,
      })
    }

    if (taskType === 'TEXT_TO_VIDEO') {
      // HF doesn't have great free video, use image as fallback
      const prompt = params.description || params.prompt || 'a beautiful scene'
      
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt + ', cinematic, movie still, high quality',
            parameters: { num_inference_steps: 25 }
          }),
        }
      )

      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || `HF error: ${response.status}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(imageBuffer).toString('base64')
      const imageUrl = `data:image/jpeg;base64,${base64}`

      return res.status(200).json({
        type: 'image',
        url: imageUrl,
        note: 'Video generation preview (cinematic image)',
        prompt,
      })
    }

    if (taskType === 'IMAGE_TO_VIDEO') {
      return res.status(200).json({
        type: 'text',
        message: 'Image to video generation coming soon! Your payment has been recorded.',
      })
    }

    if (taskType === 'TEXT_TO_MUSIC') {
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

      if (!response.ok) {
        const err = await response.text()
        if (response.status === 503) {
          return res.status(200).json({ error: 'Music model loading, try again in 30 seconds.' })
        }
        throw new Error(err || `HF error: ${response.status}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(audioBuffer).toString('base64')
      const audioUrl = `data:audio/wav;base64,${base64}`

      return res.status(200).json({
        type: 'audio',
        url: audioUrl,
        prompt,
      })
    }

    return res.status(400).json({ error: `Unsupported task: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message || 'Generation failed' })
  }
}