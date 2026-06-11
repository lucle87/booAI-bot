// pages/api/agent.js
const MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'llama3-8b-8192',
]

// ============================================================
// ARC KNOWLEDGE BASE (tích hợp trực tiếp, không cần API ngoài)
// ============================================================
const ARC_KB = {
  overview: `ARC Network là Layer-1 blockchain mã nguồn mở do Circle (công ty tạo ra USDC) xây dựng.
- Mục tiêu: "Economic OS" cho internet — hạ tầng tài chính lập trình được
- Native gas token: USDC (phí gas tính bằng đô, không volatile)
- Chain ID: 5042002 (hex: 0x4cef52)
- Consensus: Malachite engine — finality dưới 1 giây
- EVM Compatible: Có — dùng Solidity, Hardhat, Foundry, ethers.js
- Trạng thái: Public Testnet (ra mắt 28/10/2025), Mainnet dự kiến 2026
- Launch partners: 100+ tổ chức gồm BlackRock, Visa, HSBC`,

  network: `THÔNG TIN MẠNG ARC TESTNET:
- RPC URL: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Symbol: USDC
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com (1 USDC/ngày)
- Block time: < 1 giây`,

  features: `TÍNH NĂNG NỔI BẬT:
1. Dollar fees: Gas phí bằng USDC — predictable, không volatile
2. Sub-second finality: Confirm dưới 1 giây, deterministic
3. Opt-in Privacy: Tùy chọn privacy cho enterprise
4. StableFX: Built-in FX engine cho stablecoin settlement 24/7
5. CCTP: Circle Cross-Chain Transfer Protocol
6. AI-native: Tích hợp Anthropic Claude Agent SDK
7. EVM: Tương thích hoàn toàn với Ethereum tooling`,

  build: `HƯỚNG DẪN BUILD TRÊN ARC:

Bước 1 - Thêm mạng vào ví:
  RPC: https://rpc.testnet.arc.network | Chain ID: 5042002 | Symbol: USDC

Bước 2 - Lấy testnet USDC:
  Faucet: https://faucet.circle.com (chọn ARC Testnet)

Bước 3 - Deploy contract với ethers.js:
  const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
  const wallet = new ethers.Wallet(privateKey, provider)

Bước 4 - Công cụ dev hỗ trợ:
  Hardhat, Foundry, Thirdweb SDK, Alchemy RPC, The Graph

Tài liệu: https://docs.arc.network
Explorer: https://testnet.arcscan.app`,

  ecosystem: `HỆ SINH THÁI ARC:
💼 Wallets: MetaMask, Ledger, Fireblocks, Exodus, Rainbow, Privy, Turnkey
🛠️ Dev Tools: Alchemy, Chainlink, Thirdweb, ZeroDev, Pimlico, The Graph, Crossmint, LayerZero, Fun.xyz
🌉 Crosschain: Across, Stargate, Wormhole
🤖 AI: Anthropic Claude Agent SDK
🏦 Enterprise: BlackRock, Visa, HSBC, Circle
📊 Indexing: The Graph (https://thegraph.com/docs/en/supported-networks/arc-testnet/)`,

  usecases: `USE CASES TRÊN ARC:
- Cross-border payments (thanh toán xuyên biên giới tức thì)
- Capital markets (thị trường vốn on-chain)
- Stablecoin FX (ngoại hối stablecoin real-time 24/7)
- AI Agent payments (AI agents tự động thanh toán)
- eCommerce checkout (USDC native)
- Treasury management
- DeFi: AMM, lending, stableswap
- NFT collections (ERC721)
- Token launches (ERC20, memecoin)`,

  news: `TIN TỨC & ROADMAP ARC:
- 28/10/2025: Arc Public Testnet ra mắt với 100+ launch partners
- Q4/2025: Tích hợp Alchemy, Chainlink, Thirdweb, LayerZero
- Q1/2026: StableFX beta, crosschain bridges (Across, Wormhole, Stargate)
- Q2/2026: Continued testnet development, community builder program
- 2026: Mainnet ra mắt (Circle chưa công bố ngày cụ thể)
- Circle đang xem xét native Arc token cho governance (đề cập trong Q3/2025 earnings)
- booAI_bot là AI agent đầu tiên của cộng đồng build trên Arc Testnet!`,

  community: `CỘNG ĐỒNG & TÀI NGUYÊN ARC:
🌐 Website: https://arc.io
📚 Docs: https://docs.arc.network
🔍 Explorer: https://testnet.arcscan.app
💧 Faucet: https://faucet.circle.com
🐙 GitHub examples: https://github.com/topics/arc-network
📊 The Graph: https://thegraph.com/docs/en/supported-networks/arc-testnet/
⚡ Alchemy: https://www.alchemy.com/rpc/arc-testnet
🛠️ Thirdweb: https://thirdweb.com/arc-testnet
📰 Blog: https://arc.io/blog`,

  projects: `DỰ ÁN CỘNG ĐỒNG TRÊN ARC (từ GitHub):
- Decentralized Voting dApp (Solidity + ethers.js)
- StableSwap AMM (Curve-inspired, React frontend)
- Stripe + Arc USDC payout integration
- Circle ENS + USDC projects
Xem thêm: https://github.com/topics/arc-network`,
}

// Detect xem câu hỏi có liên quan đến ARC knowledge không
function isArcKnowledgeQuestion(text) {
  const t = text.toLowerCase()
  const arcKeywords = [
    'arc là gì', 'arc network', 'arc testnet', 'arc mainnet',
    'hệ sinh thái arc', 'ecosystem arc', 'arc ecosystem',
    'tin tức arc', 'arc news', 'arc update', 'arc mới',
    'build on arc', 'xây dựng trên arc', 'deploy on arc',
    'arc rpc', 'arc chain', 'arc faucet',
    'arc partner', 'arc launch', 'arc roadmap',
    'arc community', 'cộng đồng arc',
    'arc docs', 'tài liệu arc', 'hướng dẫn arc',
    'arc token', 'arc governance',
    'stablefx', 'malachite', 'circle blockchain',
    'arc use case', 'arc ứng dụng',
    'arc project', 'dự án arc',
    'arc thirdweb', 'arc alchemy', 'arc chainlink',
    'arc là', 'what is arc', 'tell me about arc',
    'arc có gì', 'arc như thế nào',
  ]
  return arcKeywords.some(k => t.includes(k))
}

// Build context từ KB dựa theo câu hỏi
function buildArcContext(text) {
  const t = text.toLowerCase()
  let ctx = ''

  if (t.includes('overview') || t.includes('là gì') || t.includes('what is') || t.includes('giới thiệu') || t.includes('tell me about')) {
    ctx += ARC_KB.overview + '\n\n'
  }
  if (t.includes('rpc') || t.includes('chain id') || t.includes('faucet') || t.includes('thêm mạng') || t.includes('network info') || t.includes('testnet info')) {
    ctx += ARC_KB.network + '\n\n'
  }
  if (t.includes('tính năng') || t.includes('feature') || t.includes('stablefx') || t.includes('finality') || t.includes('privacy') || t.includes('usdc gas')) {
    ctx += ARC_KB.features + '\n\n'
  }
  if (t.includes('build') || t.includes('xây') || t.includes('deploy') || t.includes('hướng dẫn') || t.includes('bắt đầu') || t.includes('get started') || t.includes('develop')) {
    ctx += ARC_KB.build + '\n\n'
  }
  if (t.includes('ecosystem') || t.includes('hệ sinh thái') || t.includes('partner') || t.includes('alchemy') || t.includes('thirdweb') || t.includes('chainlink') || t.includes('tool')) {
    ctx += ARC_KB.ecosystem + '\n\n'
  }
  if (t.includes('use case') || t.includes('ứng dụng') || t.includes('dùng để') || t.includes('payment') || t.includes('defi') || t.includes('usecase')) {
    ctx += ARC_KB.usecases + '\n\n'
  }
  if (t.includes('news') || t.includes('tin tức') || t.includes('mới') || t.includes('update') || t.includes('mainnet') || t.includes('roadmap') || t.includes('launch')) {
    ctx += ARC_KB.news + '\n\n'
  }
  if (t.includes('community') || t.includes('cộng đồng') || t.includes('discord') || t.includes('docs') || t.includes('tài liệu') || t.includes('link') || t.includes('resource')) {
    ctx += ARC_KB.community + '\n\n'
  }
  if (t.includes('project') || t.includes('dự án') || t.includes('github') || t.includes('open source') || t.includes('mã nguồn')) {
    ctx += ARC_KB.projects + '\n\n'
  }

  // Nếu không match cụ thể → trả overview + ecosystem
  if (!ctx) {
    ctx = ARC_KB.overview + '\n\n' + ARC_KB.ecosystem + '\n\n' + ARC_KB.news
  }

  return ctx.trim()
}

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

  // Lấy câu hỏi cuối của user
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  // ============================================================
  // ROUTE: ARC KNOWLEDGE QUESTIONS → trả lời từ KB
  // ============================================================
  if (isArcKnowledgeQuestion(lastUserMsg)) {
    const arcContext = buildArcContext(lastUserMsg)

    const arcSystemPrompt = `Bạn là booAI_bot — AI agent chuyên về ARC Network (blockchain của Circle).
Trả lời câu hỏi dựa trên knowledge base được cung cấp.
Trả lời bằng ngôn ngữ của user (tiếng Việt nếu hỏi tiếng Việt, English nếu hỏi English).
Dùng markdown: **bold**, bullet points, code blocks khi cần.
Thêm emoji cho dễ đọc. Thêm links khi phù hợp.
Cuối câu trả lời luôn hỏi: "Bạn có muốn tôi giúp gì thêm về ARC không? 🚀"

KNOWLEDGE BASE:
${arcContext}`

    let arcAnswer = null
    for (const model of MODELS) {
      try {
        arcAnswer = await callGroq(process.env.GROQ_API_KEY, model, messages, arcSystemPrompt)
        break
      } catch (err) {
        if (err.message === 'RATE_LIMIT') continue
        break
      }
    }

    return res.status(200).json({
      reply: arcAnswer || arcContext,
      ready: false,
      type: 'arc_knowledge',
    })
  }

  // ============================================================
  // ROUTE: TASK EXECUTION (deploy contract, generate media, etc.)
  // ============================================================
  const taskSystemPrompt = `You are booAI_bot, an AI agent on ARC Testnet. Help users deploy contracts and generate media.

LANGUAGE: Always respond in the same language the user writes in.

CRITICAL RULES:
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
- When ALL params collected → output ONLY raw JSON (no other text)

OUTPUT JSON FORMAT:
{"ready":true,"taskType":"TEXT_TO_IMAGE","taskName":"Generate Image: Cat","params":{"description":"a cute cat wearing sunglasses","style":"anime"},"summary":"I will generate an anime style image of a cute cat wearing sunglasses for 0.1 USDC."}`

  let rawText = null

  for (const model of MODELS) {
    try {
      rawText = await callGroq(process.env.GROQ_API_KEY, model, messages, taskSystemPrompt)
      break
    } catch (err) {
      if (err.message === 'RATE_LIMIT') continue
      break
    }
  }

  if (!rawText) {
    return res.status(429).json({ error: 'All models rate limited. Try again in a few minutes.' })
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

  return res.status(200).json({ reply: rawText, ready: false })
}
