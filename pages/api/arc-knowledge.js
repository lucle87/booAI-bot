// pages/api/arc-knowledge.js
// ARC Ecosystem Knowledge Base + Web Search for latest news

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { question } = req.body
  if (!question) return res.status(400).json({ error: 'Missing question' })

  // Static knowledge base về ARC
  const ARC_KNOWLEDGE = {
    overview: `
ARC Network là một Layer-1 blockchain mã nguồn mở được xây dựng bởi Circle (công ty đứng sau USDC).
- **Mục tiêu**: "Economic OS" cho internet — hạ tầng tài chính lập trình được toàn cầu
- **Native gas token**: USDC (không phải ETH hay token riêng)
- **Chain ID**: 5042002 (0x4cef52)
- **Consensus**: Circle's Malachite engine — sub-second finality (dưới 1 giây)
- **EVM Compatible**: Có — dùng được Solidity, Hardhat, Foundry, ethers.js
- **Trạng thái**: Public Testnet (ra mắt 28/10/2025), Mainnet dự kiến 2026
- **Launch partners**: 100+ tổ chức gồm BlackRock, Visa, HSBC
`,
    network: `
**Thông tin mạng ARC Testnet:**
- RPC URL: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Symbol: USDC
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com (1 USDC/ngày)
- Block time: < 1 giây
- Finality: Deterministic (instant)
`,
    features: `
**Tính năng nổi bật của ARC:**
1. **Dollar-denominated fees**: Gas phí tính bằng USDC — predictable, không bị volatile
2. **Sub-second finality**: Giao dịch confirm dưới 1 giây
3. **Opt-in Privacy**: Tùy chọn privacy cho enterprise compliance
4. **StableFX**: Built-in FX engine cho stablecoin settlement 24/7
5. **CCTP Integration**: Circle Cross-Chain Transfer Protocol
6. **AI-native**: Tích hợp sẵn với Anthropic Claude Agent SDK
`,
    ecosystem: `
**Hệ sinh thái ARC (Testnet Launch Partners):**

💼 **Digital Wallets**: MetaMask, Ledger, Fireblocks, Exodus, Rainbow, Privy, Turnkey

🛠️ **Developer Tools**: 
- Alchemy (RPC & APIs)
- Chainlink (Oracles)
- Thirdweb (SDK, deploy, bridge)
- ZeroDev (Account Abstraction)
- Pimlico (Paymaster)
- The Graph (Indexing)
- Crossmint (NFT tools)

🌉 **Crosschain**: Across, Stargate, Wormhole

🤖 **AI**: Anthropic Claude Agent SDK (booAI_bot dùng cái này!)

🏦 **Enterprise**: BlackRock, Visa, HSBC, Circle
`,
    build: `
**Hướng dẫn bắt đầu build trên ARC:**

1. **Thêm mạng vào ví:**
   - RPC: https://rpc.testnet.arc.network
   - Chain ID: 5042002
   - Symbol: USDC

2. **Lấy testnet USDC:**
   - Faucet: https://faucet.circle.com
   - Thirdweb Bridge: bridge từ chain khác

3. **Deploy smart contract:**
   \`\`\`js
   // Dùng ethers.js
   const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
   const wallet = new ethers.Wallet(privateKey, provider)
   \`\`\`

4. **Công cụ dev:**
   - Hardhat / Foundry (EVM standard)
   - Thirdweb SDK
   - Alchemy RPC
   - The Graph (indexing dữ liệu)

5. **Tài liệu chính thức:**
   - Docs: https://docs.arc.network
   - Explorer: https://testnet.arcscan.app
   - GitHub examples: https://github.com/topics/arc-network
`,
    usecases: `
**Use cases trên ARC:**
- 💸 Cross-border payments (thanh toán xuyên biên giới)
- 🏦 Capital markets (thị trường vốn on-chain)
- 🔄 Stablecoin FX (ngoại hối stablecoin real-time)
- 🤖 AI Agent payments (AI agents thanh toán tự động)
- 🛒 eCommerce checkout (checkout thương mại điện tử)
- 📊 Treasury management (quản lý ngân quỹ)
- 🎨 NFT collections (ERC721)
- 🪙 Token launches (ERC20)
`,
    news: `
**Tin tức mới nhất về ARC:**
- **28/10/2025**: Arc Public Testnet ra mắt với 100+ launch partners
- **2025 Q4**: Tích hợp Alchemy, Chainlink, Thirdweb, LayerZero
- **2026 Q1**: StableFX beta, crosschain bridges (Across, Wormhole, Stargate)
- **2026**: Mainnet dự kiến ra mắt (Circle chưa công bố ngày cụ thể)
- **Circle đang explore** native Arc token cho governance
- **booAI_bot** là một trong các dự án AI đầu tiên build trên Arc Testnet!
`,
    community: `
**Cộng đồng & Tài nguyên ARC:**
- 🌐 Website: https://arc.io
- 📚 Docs: https://docs.arc.network
- 🐦 Twitter/X: @arcblockchain
- 💬 Discord: discord.arc.network
- 🔍 Explorer: https://testnet.arcscan.app
- 💧 Faucet: https://faucet.circle.com
- 🐙 GitHub examples: https://github.com/topics/arc-network
- 📊 The Graph: https://thegraph.com/docs/en/supported-networks/arc-testnet/
- ⚡ Alchemy: https://www.alchemy.com/rpc/arc-testnet
- 🛠️ Thirdweb: https://thirdweb.com/arc-testnet
`,
  }

  // Detect loại câu hỏi
  const q = question.toLowerCase()
  let context = ''

  if (q.includes('network') || q.includes('rpc') || q.includes('chain id') || q.includes('faucet') || q.includes('testnet') || q.includes('thêm mạng')) {
    context += ARC_KNOWLEDGE.network
  }
  if (q.includes('tính năng') || q.includes('feature') || q.includes('usdc') || q.includes('finality') || q.includes('privacy') || q.includes('stablefx')) {
    context += ARC_KNOWLEDGE.features
  }
  if (q.includes('build') || q.includes('deploy') || q.includes('xây') || q.includes('bắt đầu') || q.includes('hardhat') || q.includes('solidity') || q.includes('hướng dẫn')) {
    context += ARC_KNOWLEDGE.build
  }
  if (q.includes('ecosystem') || q.includes('hệ sinh thái') || q.includes('partner') || q.includes('tool') || q.includes('alchemy') || q.includes('thirdweb') || q.includes('chainlink')) {
    context += ARC_KNOWLEDGE.ecosystem
  }
  if (q.includes('use case') || q.includes('dùng') || q.includes('ứng dụng') || q.includes('payment') || q.includes('nft') || q.includes('token')) {
    context += ARC_KNOWLEDGE.usecases
  }
  if (q.includes('news') || q.includes('tin tức') || q.includes('mới') || q.includes('update') || q.includes('mainnet') || q.includes('launch')) {
    context += ARC_KNOWLEDGE.news
  }
  if (q.includes('community') || q.includes('cộng đồng') || q.includes('discord') || q.includes('twitter') || q.includes('docs') || q.includes('tài liệu') || q.includes('link')) {
    context += ARC_KNOWLEDGE.community
  }

  // Default: overview + tất cả nếu câu hỏi chung
  if (!context || q.includes('arc là gì') || q.includes('what is arc') || q.includes('giới thiệu') || q.includes('overview')) {
    context = ARC_KNOWLEDGE.overview + ARC_KNOWLEDGE.features + ARC_KNOWLEDGE.ecosystem
  }

  // Gọi Groq AI để trả lời dựa trên knowledge base
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `Bạn là chuyên gia về ARC Network — blockchain Layer-1 của Circle. 
Trả lời câu hỏi dựa trên knowledge base được cung cấp.
Trả lời bằng ngôn ngữ của người dùng (tiếng Việt hoặc tiếng Anh).
Dùng markdown formatting: **bold**, bullet points, code blocks.
Nếu không biết, nói thẳng và suggest tìm tại docs.arc.network.
Luôn thêm link hữu ích khi phù hợp.

KNOWLEDGE BASE:
${context}`
          },
          { role: 'user', content: question }
        ],
      }),
    })

    const data = await groqRes.json()
    const answer = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.'
    res.json({ answer, type: 'arc_knowledge' })
  } catch (err) {
    // Fallback: trả thẳng knowledge base nếu Groq lỗi
    res.json({ answer: context, type: 'arc_knowledge' })
  }
}
