// pages/api/generate.js — Stable Horde (free community GPU)
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  try {
    // IMAGE GENERATION (Text to Image, NFT Art, Image to Video preview, Text to Video preview)
    if (['TEXT_TO_IMAGE', 'GENERATE_NFT_ART', 'IMAGE_TO_VIDEO', 'TEXT_TO_VIDEO'].includes(taskType)) {
      const prompt = params.description || params.prompt || params.imageDescription || 'a beautiful artwork'
      const style = params.style || 'digital art'
      
      let fullPrompt = ''
      if (taskType === 'IMAGE_TO_VIDEO') {
        fullPrompt = `${prompt}, ${style} style, dynamic motion, cinematic, high quality, detailed, sharp`
      } else if (taskType === 'TEXT_TO_VIDEO') {
        fullPrompt = `${prompt}, ${style}, cinematic scene, movie still, dramatic lighting, high quality`
      } else {
        fullPrompt = `${prompt}, ${style} style, high quality, detailed, sharp, professional`
      }

      const negPrompt = 'blurry, bad quality, ugly, deformed, watermark, text, abstract, surreal'

      // Submit to Stable Horde
      const createRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0000000000',
        },
        body: JSON.stringify({
          prompt: `${fullPrompt} ### ${negPrompt}`,
          params: {
            sampler_name: 'k_euler_a',
            cfg_scale: 7.5,
            steps: 20,
            width: 512,
            height: 512,
            n: 1,
          },
          nsfw: false,
          censor_nsfw: true,
          models: ['stable_diffusion'],
          r2: true,
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.text()
        throw new Error(`Horde submit error: ${err}`)
      }

      const { id } = await createRes.json()
      if (!id) throw new Error('No generation ID returned')

      // Poll for result max 55s
      for (let i = 0; i < 18; i++) {
        await new Promise(r => setTimeout(r, 3000))

        const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`, {
          headers: { 'apikey': '0000000000' }
        })
        const check = await checkRes.json()

        if (check.faulted) throw new Error('Generation failed on Horde network')

        if (check.done) {
          const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`, {
            headers: { 'apikey': '0000000000' }
          })
          const status = await statusRes.json()
          const imgUrl = status.generations?.[0]?.img

          if (imgUrl) {
            return res.status(200).json({
              type: 'image',
              url: imgUrl,
              prompt: fullPrompt,
              note: taskType === 'IMAGE_TO_VIDEO' ? '🎬 Animated style preview — Full video coming soon!' :
                    taskType === 'TEXT_TO_VIDEO' ? '🎬 Video storyboard — Full video coming soon!' : null
            })
          }
          throw new Error('No image in response')
        }
      }

      throw new Error('Generation timeout (60s). Please try again.')
    }

    // TEXT TO MUSIC
    if (taskType === 'TEXT_TO_MUSIC') {
      if (!process.env.HUGGINGFACE_API_KEY) {
        return res.status(200).json({
          type: 'text',
          message: `🎵 Music generation coming soon!\n\nYour request has been recorded:\nGenre: ${params.genre || 'electronic'}\nMood: ${params.mood || 'upbeat'}`,
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
          body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 256 } }),
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

    return res.status(400).json({ error: `Unsupported task: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message || 'Generation failed. Please try again.' })
  }
}