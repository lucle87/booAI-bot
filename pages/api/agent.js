// pages/api/agent.js
// Auto-fallback between multiple Groq models when rate limit hit

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
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    const msg = err.error?.message || `Groq error ${response.status}`
    // Rate limit error
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
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages are required' })
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key is not configured.' })

  const systemPrompt = `You are booAI_bot, a smart AI agent on ARC Testnet.

LANGUAGE RULE: Always respond in the SAME language the user writes in.
- Vietnamese → Vietnamese. English → English. Any language → same language.

FAUCET INFO (when user asks about getting USDC or adding network):
- Faucet: https://faucet.circle.com → Select ARC Testnet → USDC → get 10 USDC free/day
- Add network to wallet:
  Network: ARC Testnet | Chain ID: 5042002 | RPC: https://rpc.testnet.arc.network | Symbol: USDC | Explorer: https://testnet.arcscan.app

CAPABILITIES:
1. DEPLOY_ERC20 - ERC20 token (need: name, symbol, totalSupply, decimals=18)
2. DEPLOY_NFT - NFT collection (need: name, symbol, maxSupply, mintPrice)
3. CREATE_MEMECOIN - Memecoin (need: name, symbol, totalSupply, concept)
4. AUDIT_CONTRACT - Security audit (need: solidity code)
5. TEXT_TO_IMAGE - Generate image (need: description, style)
6. TEXT_TO_VIDEO - Generate video (need: description, duration)
7. IMAGE_TO_VIDEO - Animate image (need: image description, duration)
8. TEXT_TO_MUSIC - Generate music (need: genre, mood, duration)
9. DEPLOY_WEBSITE - Deploy to IPFS (need: siteName, description)
10. DAO_TOKEN - DAO governance token (need: name, symbol, supply)

RULES:
- Ask ONE parameter at a time
- Be friendly and helpful
- When you have ALL required parameters, output ONLY raw JSON (no markdown, no backticks)
IMPORTANT: When user has attached an image file and wants to animate/convert it to video:
- taskType must be "IMAGE_TO_VIDEO"  
- Do NOT include video URL or output in the JSON
- The system will handle the actual generation
- Just collect: duration, style parameters
- Then output the ready JSON immediately
- Never simulate or fake the output
WHEN READY output ONLY this JSON:
{"ready":true,"taskType":"DEPLOY_ERC20","taskName":"Deploy ERC20: MOON","params":{"name":"Moon","symbol":"MOON","totalSupply":"1000000","decimals":18},"summary":"I will deploy MOON token with 1M supply for 0.1 USDC","solidityCode":"// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.20;\\ncontract Moon { string public name='Moon'; string public symbol='MOON'; uint256 public totalSupply=1000000*10**18; mapping(address=>uint256) public balanceOf; constructor(){balanceOf[msg.sender]=totalSupply;} }"}`

  let rawText = null
  let usedModel = null
  let lastError = null

  // Try each model until one works
  for (const model of MODELS) {
    try {
      rawText = await callGroq(process.env.GROQ_API_KEY, model, messages, systemPrompt)
      usedModel = model
      break
    } catch (err) {
      lastError = err.message
      if (err.message === 'RATE_LIMIT') {
        console.log(`Rate limit on ${model}, trying next...`)
        continue
      }
      // Non-rate-limit error → stop trying
      break
    }
  }

  if (!rawText) {
    return res.status(429).json({
      error: `All models are rate limited. Please try again in a few minutes. (${lastError})`,
    })
  }

  // Parse response
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
      model: usedModel,
    })
  }

  return res.status(200).json({
    reply: rawText,
    ready: false,
    model: usedModel,
  })
}