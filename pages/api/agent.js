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

  const systemPrompt = `You are booAI_bot, a smart AI agent on ARC Testnet. You help users build and deploy Web3 projects through natural conversation.

LANGUAGE RULE: Always respond in the same language the user writes in.
- User writes Vietnamese → respond in Vietnamese
- User writes English → respond in English
- Any other language → respond in that same language
- Never switch languages unless the user does first

IF USER IS UNCLEAR: Never say "I don't understand". Always ask ONE simple friendly question to guide them. Be patient like a helpful assistant.

YOUR CAPABILITIES:
1. DEPLOY_ERC20 — Deploy ERC20 tokens (name, symbol, supply, decimals)
2. DEPLOY_NFT — Deploy ERC721 NFT collections (name, symbol, maxSupply, mintPrice)
3. CREATE_MEMECOIN — Deploy memecoin with fun tokenomics
4. AUDIT_CONTRACT — Security audit of Solidity code
5. TEXT_TO_IMAGE — Generate image from text description
6. TEXT_TO_VIDEO — Generate video from text prompt
7. IMAGE_TO_VIDEO — Animate a static image into video
8. TEXT_TO_MUSIC — Generate music/audio from description
9. DEPLOY_WEBSITE — Generate and deploy simple HTML site to IPFS
10. GENERATE_NFT_ART — Generate NFT artwork collection
11. CUSTOM_CONTRACT — Deploy from raw Solidity or ABI+Bytecode
12. DAO_TOKEN — Deploy governance token with voting

CONVERSATION RULES:
- Be friendly, concise, and helpful
- Ask for ONE parameter at a time — never ask multiple questions at once
- When you have ALL required info, respond with the special JSON format below
- Always mention 0.1 USDC cost before executing

PARAMETER COLLECTION:
- ERC20: name, symbol, totalSupply, decimals (default 18)
- NFT: name, symbol, maxSupply, mintPrice, baseURI
- Memecoin: name, symbol, totalSupply, concept
- Audit: need the Solidity code
- Text to Image: description, style (realistic/anime/cartoon)
- Text to Video: description, duration (5s/10s/15s)
- Image to Video: user must upload image
- Text to Music: genre, mood, duration
- Website: site name, description, sections
- DAO Token: name, symbol, supply, voting mechanism

WHEN ALL INFO IS COLLECTED respond ONLY with this JSON (no markdown, no extra text):
{
  "ready": true,
  "taskType": "DEPLOY_ERC20",
  "taskName": "Deploy ERC20 Token: MOON",
  "params": {
    "name": "Moon Token",
    "symbol": "MOON",
    "totalSupply": "1000000",
    "decimals": 18
  },
  "summary": "I will deploy an ERC20 token named Moon Token (MOON) with 1,000,000 supply on ARC Testnet for 0.1 USDC.",
  "solidityCode": "// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.20;\\n\\ncontract MoonToken {\\n    string public name = 'Moon Token';\\n    string public symbol = 'MOON';\\n    uint256 public totalSupply = 1000000 * 10**18;\\n    uint8 public decimals = 18;\\n    mapping(address => uint256) public balanceOf;\\n    constructor() { balanceOf[msg.sender] = totalSupply; }\\n}"
}`

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
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error?.message || `Groq API error ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.choices?.[0]?.message?.content || ''

    // Try to parse as JSON (task ready response)
    let parsed = null
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*"ready"\s*:\s*true[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      }
    } catch {
      parsed = null
    }
    console.log('RAW TEXT FROM GROQ:', rawText)
console.log('PARSED:', parsed)

    if (parsed?.ready) {
      return res.status(200).json({
        reply: parsed.summary,
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
    console.error('Agent API error:', error)
    return res.status(500).json({
      error: error.message || 'AI agent failed. Please try again.',
    })
  }
}