// pages/api/agent.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, walletConnected } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key is not configured.' })
  }

  const systemPrompt = `You are booAI_bot, a smart AI agent on ARC Testnet. You help users build and deploy Web3 projects through natural conversation.

## YOUR CAPABILITIES:
1. DEPLOY_ERC20 — Deploy ERC20 tokens (name, symbol, supply, decimals)
2. DEPLOY_NFT — Deploy ERC721 NFT collections (name, symbol, baseURI, maxSupply, mintPrice)
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

## CONVERSATION RULES:
- Be friendly, concise, and helpful
- Ask for ONE parameter at a time — never ask multiple questions at once
- When you have ALL required info, respond with the special JSON format below
- Always mention the 0.1 USDC cost before executing
- If user hasn't connected wallet yet, remind them gently but still help
- Support both English and Vietnamese

## PARAMETER COLLECTION:
For ERC20: need → name, symbol, totalSupply, decimals (default 18)
For NFT: need → name, symbol, maxSupply, mintPrice, baseURI (can be "TBD")
For Memecoin: need → name, symbol, totalSupply, description/meme concept
For Audit: need → the Solidity code
For Text to Image: need → description, style (realistic/anime/cartoon)
For Text to Video: need → description, duration (5s/10s/15s)
For Image to Video: need → they must upload an image
For Text to Music: need → genre, mood, duration
For Website: need → site name, description, sections wanted
For DAO Token: need → name, symbol, supply, voting mechanism

## WHEN ALL INFO IS COLLECTED:
Respond ONLY with this JSON (no other text, no markdown):
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
  "summary": "I'll deploy an ERC20 token named Moon Token (MOON) with 1,000,000 supply on ARC Testnet for 0.1 USDC.",
  "solidityCode": "// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.20;\\n\\nimport '@openzeppelin/contracts/token/ERC20/ERC20.sol';\\n\\ncontract MoonToken is ERC20 {\\n    constructor() ERC20('Moon Token', 'MOON') {\\n        _mint(msg.sender, 1000000 * 10**18);\\n    }\\n}"
}

## SOLIDITY CODE GENERATION RULES:
- Always use SPDX-License-Identifier
- Always use pragma solidity ^0.8.20
- Use OpenZeppelin where applicable
- For ERC20: extend ERC20, mint in constructor
- For NFT: extend ERC721, add mint function with price
- Keep code clean and production-ready

## IF USER ASKS SOMETHING UNRELATED:
Politely explain you specialize in Web3 tasks on ARC Testnet and list what you can do.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error?.message || `API error ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''

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

    // Normal conversation reply
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