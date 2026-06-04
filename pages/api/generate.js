// pages/api/generate.js — Stable Horde (free, community GPU)
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  try {
    if (taskType === 'TEXT_TO_IMAGE' || taskType === 'GENERATE_NFT_ART' || taskType === 'IMAGE_TO_VIDEO' || taskType === 'TEXT_TO_VIDEO') {
      const prompt = params.description || params.prompt || params.imageDescription || 'a beautiful artwork'
      const style = params.style || ''
      const fullPrompt = style ? `${prompt}, ${style} style, high quality, detailed` : `${prompt}, high quality, detailed`

      // Stable Horde - free community GPU, no rate limit
      const createRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0000000000', // anonymous key
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          params: {
            sampler_name: 'k_euler',
            cfg_scale: 7,
            steps: 20,
            width: 512,
            height: 512,
            n: 1,
          },
          nsfw: false,
          censor_nsfw: true,
          models: ['stable_diffusion'],
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.text()
        throw new Error(`Horde error: ${err}`)
      }

      const { id } = await createRes.json()

      // Poll for result
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000))

        const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`, {
          headers: { 'apikey': '0000000000' }
        })
        const check = await checkRes.json()

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
              note: taskType === 'IMAGE_TO_VIDEO' ? '🎬 Animated style preview' :
                    taskType === 'TEXT_TO_VIDEO' ? '🎬 Video storyboard' : null
            })
          }
        }

        if (check.faulted) throw new Error('Generation failed on Horde')
      }

      throw new Error('Generation timeout. Please try again.')
    }

    // TEXT TO MUSIC
    if (taskType === 'TEXT_TO_MUSIC') {
      return res.status(200).json({
        type: 'text',
        message: `🎵 Music task recorded!\nGenre: ${params.genre || 'electronic'}\nMood: ${params.mood || 'upbeat'}\n\nMusic API coming soon!`,
      })
    }

    return res.status(400).json({ error: `Unsupported: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}