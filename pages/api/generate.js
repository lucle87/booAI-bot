// pages/api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  if (!process.env.REPLICATE_API_KEY) {
    return res.status(500).json({ error: 'Replicate API key not configured.' })
  }

  try {
    let output = null

    if (taskType === 'TEXT_TO_IMAGE') {
      // Using stable-diffusion with correct version
      output = await runReplicate(
        'stability-ai/stable-diffusion',
        '27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478',
        {
          prompt: params.description || params.prompt || 'a beautiful artwork',
          negative_prompt: 'blurry, bad quality, ugly',
          width: 768,
          height: 768,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        }
      )
      return res.status(200).json({
        type: 'image',
        url: Array.isArray(output) ? output[0] : output,
        prompt: params.description,
      })
    }

    if (taskType === 'TEXT_TO_VIDEO') {
      output = await runReplicate(
        'anotherjesse/zeroscope-v2-xl',
        '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
        {
          prompt: params.description || params.prompt || 'a beautiful scene',
          num_frames: 24,
          fps: 8,
          width: 576,
          height: 320,
        }
      )
      return res.status(200).json({
        type: 'video',
        url: Array.isArray(output) ? output[0] : output,
      })
    }

    if (taskType === 'IMAGE_TO_VIDEO') {
      output = await runReplicate(
        'stability-ai/stable-video-diffusion',
        '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        {
          input_image: params.imageUrl || params.image || '',
          sizing_strategy: 'maintain_aspect_ratio',
          frames_per_second: 6,
          motion_bucket_id: 127,
        }
      )
      return res.status(200).json({
        type: 'video',
        url: Array.isArray(output) ? output[0] : output,
      })
    }

    if (taskType === 'TEXT_TO_MUSIC' || taskType === 'GENERATE_NFT_ART') {
      // Fallback to image for NFT art
      output = await runReplicate(
        'stability-ai/stable-diffusion',
        '27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478',
        {
          prompt: params.description || params.prompt || 'digital art NFT',
          width: 768,
          height: 768,
          num_outputs: 1,
        }
      )
      return res.status(200).json({
        type: 'image',
        url: Array.isArray(output) ? output[0] : output,
      })
    }

    return res.status(400).json({ error: `Unsupported task type: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error.message)
    return res.status(500).json({ error: error.message || 'Generation failed' })
  }
}

async function runReplicate(model, version, input) {
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
      'Prefer': 'wait=60',
    },
    body: JSON.stringify({ version, input }),
  })

  if (!createRes.ok) {
    const err = await createRes.json()
    throw new Error(err.detail || `Replicate error: ${createRes.status}`)
  }

  const prediction = await createRes.json()

  // If already done (sync mode)
  if (prediction.status === 'succeeded') return prediction.output
  if (prediction.status === 'failed') throw new Error(prediction.error || 'Generation failed')

  const predictionId = prediction.id

  // Poll for result (max 120s)
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000))

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` },
    })

    const result = await pollRes.json()
    if (result.status === 'succeeded') return result.output
    if (result.status === 'failed') throw new Error(result.error || 'Generation failed')
  }

  throw new Error('Generation timeout. Please try again.')
}