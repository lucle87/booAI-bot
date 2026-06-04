// pages/api/agent.js
const MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'llama3-8b-8192',
]

async function callGroq(apiKey, model, messages, systemPrompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    const msg = err.error?.message || `Groq error ${response.status}`
    if (response.status === 429 || msg.includes('rate') || msg.includes('limit')) {
      throw new Error('RATE_LIMIT')
    }
    throw new Error(msg)
  }

  const data = await response.json()
  return (data.choices?.[0]?.message?.content || '').trim()
}

function parseJSON(rawText) {
  let parsed = null
  try { parsed = JSON.parse(rawText) } catch {}
  if (!parsed) {
    try {
      const stripped = rawText.replace(/```json\n?|```\n?/g, '').trim()
      parsed = JSON.parse(stripped)
    } catch {}
  }
  if (!parsed) {
    try {
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    } catch {}
  }
  return parsed
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages required' })
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key not configured.' })

  const systemPrompt = `You are booAI_bot, an AI agent on ARC Testnet. Help users deploy contracts and generate media.

LANGUAGE: Always respond in the same language the user writes in.

CRITICAL RULES - NEVER BREAK:
- NEVER fake, simulate, or pretend to generate images/videos/music
- NEVER show JSON data to the user in chat
- NEVER say "image is ready" or show fake results
- NEVER ask more than ONE question at a time
- When ready, output ONLY the JSON below, nothing else

FAUCET INFO (when user asks):
- Get USDC: https://faucet.circle.com → Select ARC Testnet → USDC
- Add network: Name=ARC Testnet, ChainID=5042002, RPC=https://rpc.testnet.arc.network, Symbol=USDC

CAPABILITIES & REQUIRED PARAMS:
1. DEPLOY_ERC20: name, symbol, totalSupply (decimals=18 default)
2. DEPLOY_NFT: name, symbol, maxSupply, mintPrice
3. CREATE_MEMECOIN: name, symbol, totalSupply, concept
4. AUDIT_CONTRACT: solidityCode
5. TEXT_TO_IMAGE: description(already have), style → ASK ONLY: style
6. TEXT_TO_VIDEO: description(already have), duration → ASK ONLY: duration (5s/10s/15s)
7. IMAGE_TO_VIDEO: imageDescription, duration, style → ASK: duration then style
8. TEXT_TO_MUSIC: genre, mood → ASK: genre then mood
9. DEPLOY_WEBSITE: siteName, description
10. DAO_TOKEN: name, symbol, supply

FLOW:
- Ask ONE param at a time
- For TEXT_TO_IMAGE: user gives description → ask style → output JSON
- For IMAGE_TO_VIDEO: user attaches image → ask duration → ask style → output JSON
- When ALL params collected → output ONLY raw JSON (no other text)

OUTPUT JSON FORMAT (output this ONLY, no other text):
{"ready":true,"taskType":"TEXT_TO_IMAGE","taskName":"Generate Image: Cat","params":{"description":"a cute cat wearing sunglasses","style":"anime"},"summary":"I will generate an anime style image of a cute cat wearing sunglasses for 0.1 USDC."}`

  let rawText = null
  let lastError = null

  for (const model of MODELS) {
    try {
      rawText = await callGroq(process.env.GROQ_API_KEY, model, messages, systemPrompt)
      break
    } catch (err) {
      lastError = err.message
      if (err.message === 'RATE_LIMIT') continue
      break
    }
  }

  if (!rawText) {
    return res.status(429).json({
      error: `All models rate limited. Try again in a few minutes.`,
    })
  }

  const parsed = parseJSON(rawText)

  if (parsed?.ready === true) {
    return res.status(200).json({
      reply: parsed.summary || 'Ready to execute!',
      ready: true,
      taskType: parsed.taskType,
      taskName: parsed.taskName,
      params: parsed.params,
      summary: parsed.summary,
      solidityCode: parsed.solidityCode || null,
    })
  }

  return res.status(200).json({
    reply: rawText,
    ready: false,
  })
}