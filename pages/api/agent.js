// pages/api/agent.js
const MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'llama3-8b-8192',
]

// ============================================================
// ARC KNOWLEDGE BASE — cập nhật từ docs.arc.io chính thức
// ============================================================
const ARC_KB = {
  overview: `ARC NETWORK — Layer-1 blockchain mã nguồn mở do Circle (công ty tạo ra USDC) xây dựng.
Nguồn: https://docs.arc.io

Thông tin cơ bản:
- Mục tiêu: "Economic OS" cho internet — hạ tầng tài chính lập trình được toàn cầu
- Native gas token: USDC (phí gas bằng đô, không volatile). EURC và USYC cũng được hỗ trợ native
- Chain ID: 5042002 (hex: 0x4cef52)
- Block time: ~0.48 giây (testnet)
- Consensus: Malachite BFT — sub-second deterministic finality
- Execution: Reth (Rust Ethereum client) — EVM Prague hard fork
- EVM Compatible: Có — Solidity, Hardhat, Foundry, Viem, ethers.js hoạt động không cần sửa
- Validator: Permissioned validators, Developer access: Permissionless
- Trạng thái: Public Testnet (ra mắt 28/10/2025), Mainnet dự kiến 2026
- Launch partners: 100+ tổ chức gồm BlackRock, Visa, HSBC`,

  network: `THÔNG TIN KẾT NỐI ARC TESTNET (từ docs.arc.io):
- RPC URL: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Gas token: USDC (native, 18 decimals cho gas; ERC-20 interface dùng 6 decimals)
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com (chọn ARC Testnet, lấy USDC hoặc EURC)
- Docs: https://docs.arc.io
- MCP Server cho AI: https://docs.arc.io/ai/mcp`,

  contracts: `CONTRACT ADDRESSES TRÊN ARC TESTNET (chính thức từ docs.arc.io):

Stablecoins:
- USDC: 0x3600000000000000000000000000000000000000 (ERC-20, 6 decimals)
- EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a (6 decimals)
- USYC: 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C (yield-bearing, institutional only)

CCTP (Crosschain Transfer Protocol, Domain 26):
- TokenMessengerV2: 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
- MessageTransmitterV2: 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275

Gateway:
- GatewayWallet: 0x0077777d7EBA4688BDeF3E311b846F25870A19B9
- GatewayMinter: 0x0022222ABE238Cc2C7Bb1f21003F0a260052475B

StableFX:
- FxEscrow: 0x867650F5eAe8df91445971f14d89fd84F0C9a9f8

Common EVM:
- CREATE2 Factory: 0x4e59b44847b379578588920cA78FbF26c0B4956C
- Multicall3: 0xcA11bde05977b3631167028862bE2a173976CA11`,

  features: `TÍNH NĂNG NỔI BẬT CỦA ARC (từ docs.arc.io/arc-chain):

1. Stablecoin native model: USDC là gas token. Không cần token riêng volatile. EURC và USYC được hỗ trợ native.
2. Stable fee design: Gas phí tính bằng USDC — predictable, không bị biến động theo thị trường
3. Deterministic finality: Giao dịch final dưới 1 giây, không bao giờ bị reorg
4. EVM compatibility: Deploy Solidity với Hardhat, Foundry, Viem, ethers.js — không cần sửa code
5. Opt-in Privacy: ArcaneVM — chạy Solidity contract bí mật, chỉ reveal cho người được chọn
6. Post-quantum security: SLH-DSA-SHA2-128s wallet signatures bảo vệ khỏi quantum attacks
7. App Kit: SDK cho Bridge, Swap, Send, Unified Balance crosschain
8. AI-native: MCP Server cho AI agents, ERC-8004 onchain identity, ERC-8183 job escrow`,

  build: `HƯỚNG DẪN BUILD TRÊN ARC (từ docs.arc.io/build):

Bước 1 - Kết nối mạng:
  RPC: https://rpc.testnet.arc.network
  Chain ID: 5042002 | Symbol: USDC
  Explorer: https://testnet.arcscan.app

Bước 2 - Lấy testnet USDC:
  https://faucet.circle.com → chọn ARC Testnet → nhận USDC/EURC

Bước 3 - Deploy contract (ethers.js):
  const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
  const wallet = new ethers.Wallet(privateKey, provider)
  // Deploy như Ethereum thông thường

Bước 4 - Hardhat config:
  networks: { arc: { url: 'https://rpc.testnet.arc.network', chainId: 5042002 } }

Bước 5 - Foundry:
  forge create --rpc-url https://rpc.testnet.arc.network --private-key $KEY src/Contract.sol:Contract

Tutorials chính thức:
- Deploy contract: https://docs.arc.io/arc/tutorials/deploy-on-arc
- Interact với contract: https://docs.arc.io/arc/tutorials/interact-with-contracts
- Monitor events: https://docs.arc.io/arc/tutorials/monitor-contract-events
- Register AI Agent: https://docs.arc.io/arc/tutorials/register-your-first-ai-agent
- ERC-8183 Job: https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job`,

  appkit: `APP KIT — SDK CROSSCHAIN CỦA ARC (docs.arc.io/app-kit):

App Kit cung cấp 4 capabilities chính:
1. Bridge: Transfer USDC giữa các chain (EVM, Solana, Circle Wallets) qua CCTP
2. Swap: Đổi token trên cùng chain hoặc crosschain
3. Send: Gửi token wallet-to-wallet
4. Unified Balance: Gộp USDC từ nhiều chain thành 1 balance duy nhất, spend được ngay

Cài đặt:
  npx skills add circlefin/skills (Vercel)
  /plugin install circle-skills@circle (Claude Code)

Adapters: Viem, Ethers, Solana, Circle Wallets
Docs: https://docs.arc.io/app-kit`,

  ai_agents: `AI AGENTS TRÊN ARC (docs.arc.io/build/agentic-economy):

Arc có chuẩn riêng cho AI agents:
- ERC-8004: Onchain identity và reputation cho AI agents
- ERC-8183: Job escrow — AI agent nhận việc, làm xong, nhận tiền tự động
- MCP Server: Connect AI tools (Claude, Cursor...) trực tiếp vào ARC docs

Register AI Agent:
  Tutorial: https://docs.arc.io/arc/tutorials/register-your-first-ai-agent

Tạo Job cho AI Agent:
  Tutorial: https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job

booAI_bot đang dùng Claude AI + ARC Testnet để làm AI agent đầu tiên của cộng đồng!`,

  ecosystem: `HỆ SINH THÁI & TOOLS ARC (từ docs.arc.io/arc/tools):

💼 Wallets: MetaMask, Ledger, Fireblocks, Exodus, Rainbow, Privy, Turnkey, Vultisig

🛠️ Dev Tools:
- Node Providers: Alchemy (https://www.alchemy.com/rpc/arc-testnet), GetBlock
- SDK: Thirdweb (https://thirdweb.com/arc-testnet), ZeroDev, Pimlico
- Oracles: Chainlink price feeds
- Indexing: The Graph (https://thegraph.com/docs/en/supported-networks/arc-testnet/)
- Account Abstraction: ZeroDev, Pimlico (ERC-4337, ERC-7702)
- Compliance: Analytics và screening tools

🌉 Crosschain: Across, Stargate, Wormhole, LayerZero, CCTP v2

🤖 AI: Anthropic Claude Agent SDK, MCP Server

🏦 Enterprise: BlackRock, Visa, HSBC, Crossmint, Dynamic, Fun.xyz`,

  usecases: `USE CASES TRÊN ARC (từ docs.arc.io/build):

1. Peer-to-peer payments: Thanh toán tức thì, phí thấp, settlement deterministic
   Docs: https://docs.arc.io/build/payments

2. eCommerce checkout: Nhận USDC trong store, fast settlement, built-in compliance
   Docs: https://docs.arc.io/build/ecommerce

3. Stablecoin FX: Real-time onchain FX với StableFX, transparent pricing
   Docs: https://docs.arc.io/build/stablecoin-fx

4. Agentic economy: AI agents tự coordinate, contract, settle value real-time
   Docs: https://docs.arc.io/build/agentic-economy

5. Capital markets: Tokenized assets, lending, treasury management

6. DeFi: AMM (StableSwap), yield (USYC), crosschain liquidity`,

  news: `TIN TỨC & ROADMAP ARC:
- 28/10/2025: Arc Public Testnet ra mắt với 100+ launch partners (BlackRock, Visa, HSBC)
- Q4/2025: Tích hợp Alchemy, Chainlink, Thirdweb, LayerZero, ZeroDev
- Q1/2026: StableFX beta, crosschain bridges (Across, Wormhole, Stargate)
- Q2/2026: App Kit (Bridge, Swap, Unified Balance), AI MCP Server
- 2026: Mainnet dự kiến ra mắt
- Circle đang xem xét native Arc token cho governance
- ERC-8004 và ERC-8183 — chuẩn mới cho AI agents on-chain
- booAI_bot là AI agent đầu tiên của cộng đồng build trên Arc!`,

  community: `CỘNG ĐỒNG & TÀI NGUYÊN ARC:
🌐 Website: https://arc.io
📚 Docs chính thức: https://docs.arc.io
📋 Docs index cho AI: https://docs.arc.io/llms.txt
🔍 Explorer: https://testnet.arcscan.app
💧 Faucet: https://faucet.circle.com
🐙 GitHub examples: https://github.com/topics/arc-network
📊 The Graph: https://thegraph.com/docs/en/supported-networks/arc-testnet/
⚡ Alchemy: https://www.alchemy.com/rpc/arc-testnet
🛠️ Thirdweb: https://thirdweb.com/arc-testnet
📰 Blog: https://arc.io/blog
🤖 MCP Server: https://docs.arc.io/ai/mcp`,

  projects: `DỰ ÁN CỘNG ĐỒNG & SAMPLE APPS TRÊN ARC:

Sample apps chính thức (Circle GitHub):
- CCTP demo: Cross-chain USDC transfer
- USDC payment integration
- Sample dApps: https://docs.arc.io/arc/references/sample-applications

Community projects (GitHub topics/arc-network):
- Decentralized Voting dApp (Solidity + ethers.js)
- StableSwap AMM (Curve-inspired, React)
- Stripe + Arc USDC payout playbook
- Circle ENS + USDC projects

Build và share dự án của bạn tại: https://github.com/topics/arc-network`,
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
    'contract address', 'địa chỉ contract', 'usdc address',
    'cctp', 'app kit', 'unified balance', 'bridge usdc',
    'erc-8004', 'erc-8183', 'ai agent arc', 'register agent',
    'arc mcp', 'circle skill', 'arcanevm', 'opt-in privacy',
    'post-quantum', 'malachite bft', 'reth arc',
    'hardhat arc', 'foundry arc', 'deploy solidity arc',
    'arc block time', 'arc finality', 'arc validator',
    'eurc', 'usyc', 'stablecoin arc', 'arc fee',
    'arcscan', 'arc explorer', 'arc sample',
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

  if (t.includes('contract') || t.includes('address') || t.includes('usdc address') || t.includes('cctp') || t.includes('gateway') || t.includes('stablefx address')) {
    ctx += ARC_KB.contracts + '\n\n'
  }
  if (t.includes('app kit') || t.includes('appkit') || t.includes('unified balance') || t.includes('bridge') || t.includes('swap') || t.includes('crosschain')) {
    ctx += ARC_KB.appkit + '\n\n'
  }
  if (t.includes('ai agent') || t.includes('erc-8004') || t.includes('erc-8183') || t.includes('agentic') || t.includes('register agent') || t.includes('job escrow') || t.includes('mcp')) {
    ctx += ARC_KB.ai_agents + '\n\n'
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