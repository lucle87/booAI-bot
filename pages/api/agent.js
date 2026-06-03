// pages/api/agent.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Groq API key is not configured.' })
  }

  const systemPrompt = `You are booAI_bot, a smart AI agent on ARC Testnet.

LANGUAGE RULE: Always respond in the SAME language the user writes in.
- Vietnamese → Vietnamese. English → English. Any language → same language.

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
- When you have ALL required parameters, output ONLY the JSON below (NO other text, NO markdown, NO backticks)

WHEN READY output ONLY this (raw JSON, no markdown):
{"ready":true,"taskType":"DEPLOY_ERC20","taskName":"Deploy ERC20: MOON","params":{"name":"Moon","symbol":"MOON","totalSupply":"1000000","decimals":18},"summary":"I will deploy MOON token with 1M supply for 0.1 USDC","solidityCode":"// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.20;\\ncontract Moon { string public name='Moon'; string public symbol='MOON'; uint256 public totalSupply=1000000*10**18; mapping(address=>uint256) public balanceOf; constructor(){balanceOf[msg.sender]=totalSupply;} }"}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error?.message || `Groq error ${response.status}`)
    }

    const data = await response.json()
    const rawText = (data.choices?.[0]?.message?.content || '').trim()

    // Try multiple JSON extraction methods
    let parsed = null

    // Method 1: Direct parse
    try {
      parsed = JSON.parse(rawText)
    } catch { parsed = null }

    // Method 2: Strip markdown backticks
    if (!parsed) {
      try {
        const stripped = rawText.replace(/```json\n?|```\n?/g, '').trim()
        parsed = JSON.parse(stripped)
      } catch { parsed = null }
    }

    // Method 3: Regex extract JSON object
    if (!parsed) {
      try {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
      } catch { parsed = null }
    }

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

  } catch (error) {
    console.error('Agent error:', error.message)
    return res.status(500).json({
      error: error.message || 'AI agent failed. Please try again.',
    })
  }
}