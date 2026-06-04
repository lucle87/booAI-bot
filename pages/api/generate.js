// pages/api/generate.js
// Tích hợp Replicate API cho Text→Image, Text→Video, Image→Video

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  if (!process.env.REPLICATE_API_KEY) {
    return res.status(500).json({ error: 'Replicate API key not configured.' })
  }

  try {
    let output = null

    if (taskType === 'TEXT_TO_IMAGE') {
      output = await runReplicate('stability-ai/sdxl', {
        prompt: params.description || params.prompt,
        negative_prompt: 'blurry, bad quality',
        width: 1024,
        height: 1024,
        num_outputs: 1,
      })
      return res.status(200).json({
        type: 'image',
        url: Array.isArray(output) ? output[0] : output,
        prompt: params.description,
      })
    }

    if (taskType === 'TEXT_TO_VIDEO') {
      output = await runReplicate('anotherjesse/zeroscope-v2-xl', {
        prompt: params.description || params.prompt,
        num_frames: params.duration === '5s' ? 24 : params.duration === '10s' ? 48 : 72,
        fps: 8,
        width: 1024,
        height: 576,
      })
      return res.status(200).json({
        type: 'video',
        url: Array.isArray(output) ? output[0] : output,
        prompt: params.description,
      })
    }

    if (taskType === 'IMAGE_TO_VIDEO') {
      // Need base64 image
      output = await runReplicate('stability-ai/stable-video-diffusion', {
        input_image: params.imageUrl || params.image,
        video_length: 'short',
        sizing_strategy: 'maintain_aspect_ratio',
        frames_per_second: 6,
        motion_bucket_id: 127,
      })
      return res.status(200).json({
        type: 'video',
        url: Array.isArray(output) ? output[0] : output,
      })
    }

    if (taskType === 'TEXT_TO_MUSIC') {
      output = await runReplicate('meta/musicgen', {
        prompt: `${params.genre} ${params.mood} music`,
        model_version: 'stereo-melody-large',
        duration: parseInt(params.duration) || 10,
      })
      return res.status(200).json({
        type: 'audio',
        url: Array.isArray(output) ? output[0] : output,
      })
    }

    return res.status(400).json({ error: `Unsupported task type: ${taskType}` })

  } catch (error) {
    console.error('Generate error:', error)
    return res.status(500).json({ error: error.message || 'Generation failed' })
  }
}

async function runReplicate(model, input) {
  // Create prediction
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
    },
    body: JSON.stringify({ version: model, input }),
  })

  if (!createRes.ok) {
    const err = await createRes.json()
    throw new Error(err.detail || `Replicate error: ${createRes.status}`)
  }

  const prediction = await createRes.json()
  const predictionId = prediction.id

  // Poll for result (max 60s)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` },
    })

    const result = await pollRes.json()

    if (result.status === 'succeeded') return result.output
    if (result.status === 'failed') throw new Error(result.error || 'Generation failed')
  }

  throw new Error('Generation timeout. Please try again.')
}