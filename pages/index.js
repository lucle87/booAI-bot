import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()
  const [faqOpen, setFaqOpen] = useState(null)
  const [inputVal, setInputVal] = useState('')

  const handleChat = () => router.push('/app')

  const capabilities = [
    { icon: '🤖', title: 'Deploy ERC20 Token', desc: 'Launch your own token with custom name, symbol, supply on ARC Testnet.' },
    { icon: '🖼️', title: 'Deploy NFT Collection', desc: 'Create ERC721 collections with metadata, max supply, and mint price.' },
    { icon: '📝', title: 'AI Contract Audit', desc: 'Detect reentrancy, overflow, and access control issues automatically.' },
    { icon: '🎨', title: 'Text to Image', desc: 'Generate stunning AI artwork from any text description.' },
    { icon: '🎬', title: 'Text to Video', desc: 'Turn your text prompt into a short video clip with AI.' },
    { icon: '🔄', title: 'Image to Video', desc: 'Animate any static image into a smooth video sequence.' },
    { icon: '🎵', title: 'Text to Music', desc: 'Generate background music and audio from a simple description.' },
    { icon: '🌐', title: 'Deploy to IPFS', desc: 'Generate and deploy a simple website directly to IPFS.' },
    { icon: '🪙', title: 'Create Memecoin', desc: 'Launch your memecoin with tokenomics, logo, and full ERC20 setup.' },
    { icon: '🔒', title: 'Custom Contract', desc: 'Upload ABI + Bytecode or paste raw Solidity for full control.' },
    { icon: '📊', title: 'Generate Dashboard', desc: 'AI builds an analytics dashboard from your data requirements.' },
    { icon: '🤝', title: 'DAO Token Setup', desc: 'Deploy governance tokens with voting and proposal mechanisms.' },
  ]

  const faqs = [
    {
      q: 'What can booAI_bot do?',
      a: 'booAI_bot is an AI agent that can deploy smart contracts (ERC20, ERC721), generate images and videos from text, mint NFT collections, audit Solidity code, deploy websites to IPFS, and much more — all through a simple chat interface on ARC Testnet.'
    },
    {
      q: 'How does the 0.1 USDC payment work?',
      a: 'Connect your MetaMask or OKX wallet, fund it with testnet USDC on ARC Testnet. Each task costs exactly 0.1 USDC, approved via your wallet before execution. No subscriptions, no hidden fees — pay only for what you use.'
    },
    {
      q: 'Do I need to know Solidity or coding?',
      a: 'Not at all. Just describe what you want in plain English — booAI_bot handles all the technical details. The AI asks for the information it needs and generates everything automatically.'
    },
  ]

  const chips = ['🤖 Deploy ERC20', '🎨 Generate NFT', '🎬 Text to Video', '📝 Audit Contract', '🌐 Deploy to IPFS', '🪙 Create Memecoin']

  return (
    <>
      <Head>
        <title>booAI_bot — AI Agent on ARC Testnet</title>
        <meta name="description" content="Deploy contracts, generate media, mint NFTs — all in one AI chat. 0.1 USDC per task on ARC Testnet." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060f; color: #eeeef5; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        h1,h2,h3,h4 { font-family: 'Space Grotesk', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }

        /* TICKER */
        .ticker-wrap { background: #08081a; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); overflow: hidden; padding: 8px 0; }
        .ticker-track { display: flex; width: max-content; animation: ticker 35s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-item { font-family: 'Space Mono', monospace; font-size: 11px; color: #52526a; white-space: nowrap; padding: 0 40px; }
        .ticker-item span { color: #8b6fff; margin-right: 8px; }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(6,6,15,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 48px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .nav-logo img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .nav-logo span { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: #eeeef5; }
        .nav-btn { background: #8b6fff; color: #fff; font-size: 13px; font-weight: 500; padding: 8px 20px; border-radius: 20px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .nav-btn:hover { opacity: 0.85; }

        /* BADGES */
        .badges { display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap; margin-bottom: 20px; }
        .badge { font-family: 'Space Mono', monospace; font-size: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #52526a; padding: 4px 12px; border-radius: 4px; }
        .badge.live { border-color: rgba(0,212,170,0.3); color: #00d4aa; background: rgba(0,212,170,0.05); }

        /* HERO */
        .hero { min-height: 100vh; padding: 120px 48px 80px; display: grid; grid-template-columns: 55% 45%; gap: 40px; align-items: center; max-width: 1280px; margin: 0 auto; }
        .hero-tag { font-family: 'Space Mono', monospace; font-size: 11px; color: #52526a; margin-bottom: 20px; }
        .hero-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(40px, 5vw, 68px); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 20px; }
        .hero-title .accent { color: #8b6fff; }
        .hero-sub { font-size: 16px; color: #52526a; line-height: 1.7; margin-bottom: 28px; max-width: 480px; }
        .chat-input-bar { display: flex; align-items: center; gap: 10px; background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 10px 10px 10px 20px; margin-bottom: 16px; max-width: 500px; }
        .chat-input-bar input { flex: 1; background: transparent; border: none; outline: none; color: #eeeef5; font-size: 14px; font-family: 'Inter', sans-serif; }
        .chat-input-bar input::placeholder { color: #52526a; }
        .chat-send { width: 36px; height: 36px; border-radius: 50%; background: #8b6fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }
        .chat-send:hover { opacity: 0.85; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; max-width: 500px; }
        .chip { font-size: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #52526a; padding: 5px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .chip:hover { border-color: #8b6fff; color: #8b6fff; background: rgba(139,111,255,0.08); }
        .hero-note { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a3a52; }

        /* MOCK CHAT CARD */
        .chat-preview { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; }
        .chat-preview-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .chat-preview-dot { width: 8px; height: 8px; border-radius: 50%; }
        .chat-preview-title { font-size: 12px; color: #52526a; font-family: 'Space Mono', monospace; }
        .msg { display: flex; gap: 8px; align-items: flex-start; }
        .msg.user { flex-direction: row-reverse; }
        .msg-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .msg-avatar.ai { background: #8b6fff; }
        .msg-avatar.user { background: rgba(255,255,255,0.08); }
        .msg-bubble { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; max-width: 80%; }
        .msg-bubble.ai { background: rgba(255,255,255,0.05); color: #eeeef5; border-radius: 4px 12px 12px 12px; }
        .msg-bubble.user { background: #8b6fff; color: #fff; border-radius: 12px 4px 12px 12px; }
        .chat-status-badges { display: flex; gap: 6px; margin-top: 4px; }
        .status-badge { font-size: 10px; padding: 3px 10px; border-radius: 20px; font-family: 'Space Mono', monospace; }
        .status-badge.green { background: rgba(0,212,170,0.1); color: #00d4aa; border: 1px solid rgba(0,212,170,0.2); }
        .status-badge.purple { background: rgba(139,111,255,0.1); color: #8b6fff; border: 1px solid rgba(139,111,255,0.2); }

        /* SECTIONS */
        .section { padding: 80px 48px; max-width: 1280px; margin: 0 auto; }
        .section-tag { font-family: 'Space Mono', monospace; font-size: 11px; color: #00d4aa; letter-spacing: 0.1em; margin-bottom: 12px; }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 3vw, 40px); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 12px; }
        .section-sub { font-size: 15px; color: #52526a; margin-bottom: 48px; }

        /* CAPABILITIES GRID */
        .cap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        .cap-card { background: #0d0d1a; padding: 24px 20px; transition: background 0.2s; cursor: default; }
        .cap-card:hover { background: rgba(139,111,255,0.06); }
        .cap-icon { font-size: 22px; margin-bottom: 12px; }
        .cap-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 6px; color: #eeeef5; }
        .cap-desc { font-size: 12px; color: #52526a; line-height: 1.6; }

        /* HOW IT WORKS */
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .step { display: flex; flex-direction: column; gap: 12px; }
        .step-num { font-family: 'Space Mono', monospace; font-size: 48px; font-weight: 400; color: rgba(139,111,255,0.15); line-height: 1; }
        .step-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; }
        .step-desc { font-size: 14px; color: #52526a; line-height: 1.7; }
        .step-tag { display: inline-block; font-family: 'Space Mono', monospace; font-size: 10px; background: rgba(139,111,255,0.1); color: #8b6fff; padding: 4px 10px; border-radius: 4px; }

        /* INFRA */
        .infra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .infra-card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 32px; }
        .infra-label { font-family: 'Space Mono', monospace; font-size: 10px; color: #52526a; margin-bottom: 12px; }
        .infra-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .infra-desc { font-size: 14px; color: #52526a; line-height: 1.7; margin-bottom: 16px; }
        .infra-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .infra-tag { font-size: 11px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #52526a; padding: 3px 10px; border-radius: 4px; }

        /* TESTIMONIALS */
        .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
        .testi-card { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px; }
        .testi-text { font-size: 14px; color: #eeeef5; line-height: 1.7; margin-bottom: 16px; font-style: italic; }
        .testi-author { font-family: 'Space Mono', monospace; font-size: 11px; color: #52526a; }
        .testi-role { font-size: 11px; color: #3a3a52; margin-top: 2px; }

        /* EMAIL WALLET */
        .email-wallet-section {
          background: linear-gradient(135deg, rgba(139,111,255,0.08), rgba(0,212,170,0.06));
          border: 1px solid rgba(139,111,255,0.2);
          border-radius: 20px;
          padding: 56px 48px;
          text-align: center;
        }
        .email-wallet-steps {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
          flex-wrap: wrap;
        }
        .ew-step { text-align: center; min-width: 100px; }
        .ew-step-icon { font-size: 32px; margin-bottom: 8px; }
        .ew-step-title { font-size: 13px; font-weight: 600; color: #eeeef5; margin-bottom: 4px; font-family: 'Space Grotesk', sans-serif; }
        .ew-step-sub { font-size: 12px; color: #52526a; }
        .ew-arrow { color: #3a3a52; font-size: 20px; flex-shrink: 0; }
        .ew-btn {
          background: #8b6fff;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px 40px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: opacity 0.2s;
          display: inline-block;
          margin-bottom: 12px;
        }
        .ew-btn:hover { opacity: 0.85; }
        .ew-hint { font-size: 12px; color: #3a3a52; font-family: 'Space Mono', monospace; }

        /* FAQ */
        .faq-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 64px; }
        .faq-item { border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; }
        .faq-q { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: background 0.2s; }
        .faq-q:hover { background: rgba(255,255,255,0.02); }
        .faq-q-text { font-size: 14px; font-weight: 500; color: #eeeef5; }
        .faq-icon { font-size: 18px; color: #52526a; transition: transform 0.2s; }
        .faq-icon.open { transform: rotate(45deg); color: #8b6fff; }
        .faq-a { font-size: 14px; color: #52526a; line-height: 1.7; padding: 0 20px 16px; }

        /* FOOTER */
        footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 48px; }
        .footer-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-logo img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .footer-logo span { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; color: #eeeef5; }
        .footer-icons { display: flex; gap: 20px; }
        .footer-icon { color: #52526a; font-size: 18px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .footer-icon:hover { color: #8b6fff; }
        .footer-mono { font-family: 'Space Mono', monospace; font-size: 11px; color: #3a3a52; }
        .footer-bottom { text-align: center; font-family: 'Space Mono', monospace; font-size: 10px; color: #2a2a3a; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.04); }

        /* DIVIDER */
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 48px; }

        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .hero { grid-template-columns: 1fr; padding: 100px 20px 60px; }
          .cap-grid { grid-template-columns: repeat(2,1fr); }
          .steps, .infra-grid, .testi-grid { grid-template-columns: 1fr; }
          .section { padding: 60px 20px; }
          .email-wallet-section { padding: 40px 24px; }
          footer { padding: 24px 20px; }
          .footer-bar { flex-direction: column; gap: 16px; text-align: center; }
          .divider { margin: 0 20px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <div className="nav-logo" onClick={() => router.push('/')}>
          <img src="/logo.png" alt="booAI_bot" />
          <span>booAI_bot</span>
        </div>
        <button className="nav-btn" onClick={handleChat}>Launch App →</button>
      </nav>

      {/* TICKER */}
      <div style={{ paddingTop: '60px' }}>
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: 'flex' }}>
                {['DEPLOY ERC20 · ARC TESTNET', 'AI SECURITY AUDIT', 'TEXT TO VIDEO', 'MINT NFT COLLECTION', '0.1 USDC PER TASK', 'POWERED BY CLAUDE AI', 'IMAGE TO VIDEO', 'DEPLOY WEBSITE TO IPFS', 'CREATE MEMECOIN', 'AUDIT SMART CONTRACT'].map(t => (
                  <span key={t} className="ticker-item"><span>◆</span>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        {/* LEFT */}
        <div>
          <div className="badges">
            <span className="badge">AI AGENT</span>
            <span className="badge">ARC TESTNET</span>
            <span className="badge">USDC NATIVE</span>
            <span className="badge live">● LIVE</span>
          </div>
          <div className="hero-tag">// AI AGENT · ARC TESTNET · POWERED BY CLAUDE</div>
          <h1 className="hero-title">
            One AI.<br />
            Infinite<br />
            <span className="accent">Possibilities.</span>
          </h1>
          <p className="hero-sub">
            Deploy contracts, generate media, mint NFTs — all in one chat.
            Pay only 0.1 USDC per task on ARC Testnet.
          </p>
          <div className="chat-input-bar">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder='Try: "Deploy a token named MOON with 1M supply..."'
            />
            <button className="chat-send" onClick={handleChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <div className="chips">
            {chips.map(c => (
              <button key={c} className="chip" onClick={handleChat}>{c}</button>
            ))}
          </div>
          <div className="hero-note">0.1 USDC per task · No subscription · ARC Testnet</div>
        </div>

        {/* RIGHT: Mock chat */}
        <div className="chat-preview">
          <div className="chat-preview-bar">
            <div className="chat-preview-dot" style={{ background: '#ff5f56' }} />
            <div className="chat-preview-dot" style={{ background: '#ffbd2e' }} />
            <div className="chat-preview-dot" style={{ background: '#27c93f' }} />
            <span className="chat-preview-title" style={{ marginLeft: 8 }}>booAI_bot · ARC Testnet</span>
          </div>
          <div className="msg">
            <div className="msg-avatar ai">🤖</div>
            <div className="msg-bubble ai">Hi! I'm booAI_bot. What would you like to build today?</div>
          </div>
          <div className="msg user">
            <div className="msg-avatar user">👤</div>
            <div className="msg-bubble user">Deploy a token called MOON 🌙</div>
          </div>
          <div className="msg">
            <div className="msg-avatar ai">🤖</div>
            <div className="msg-bubble ai">Great! What is the total supply for MOON? (e.g. 1,000,000)</div>
          </div>
          <div className="msg user">
            <div className="msg-avatar user">👤</div>
            <div className="msg-bubble user">1,000,000</div>
          </div>
          <div className="msg">
            <div className="msg-avatar ai">🤖</div>
            <div className="msg-bubble ai">Contract generated! Ready to deploy for 0.1 USDC.</div>
          </div>
          <div className="chat-status-badges">
            <span className="status-badge green">● Deployed</span>
            <span className="status-badge purple">0.1 USDC paid</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* CAPABILITIES */}
      <div className="section">
        <div className="section-tag">// CAPABILITIES</div>
        <h2 className="section-title">Everything your AI can do</h2>
        <p className="section-sub">12 powerful capabilities. One chat interface. 0.1 USDC each.</p>
        <div className="cap-grid">
          {capabilities.map(c => (
            <div key={c.title} className="cap-card">
              <div className="cap-icon">{c.icon}</div>
              <div className="cap-title">{c.title}</div>
              <div className="cap-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <div className="section">
        <div className="section-tag">// HOW IT WORKS</div>
        <h2 className="section-title">Three steps to launch anything</h2>
        <p className="section-sub">No coding required. No subscriptions. Just chat and build.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-title">Connect Wallet</div>
            <div className="step-desc">Link your MetaMask or OKX wallet. Auto-switches to ARC Testnet. Get free testnet USDC from the faucet if needed.</div>
            <span className="step-tag">metamask · okx wallet</span>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-title">Chat with AI</div>
            <div className="step-desc">Describe what you want in plain English. The AI asks for details one step at a time and generates everything automatically.</div>
            <span className="step-tag">powered by claude ai</span>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-title">Pay & Execute</div>
            <div className="step-desc">Approve 0.1 USDC in your wallet. The AI executes the task, returns results, contract addresses, and transaction hashes.</div>
            <span className="step-tag">0.1 usdc · arc testnet</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* INFRASTRUCTURE */}
      <div className="section">
        <div className="section-tag">// INFRASTRUCTURE</div>
        <h2 className="section-title">Built on proven tech</h2>
        <div className="infra-grid">
          <div className="infra-card">
            <div className="infra-label">// PURPOSE-BUILT L1 FOR FINANCIAL APPS</div>
            <div className="infra-title">ARC NETWORK</div>
            <div className="infra-desc">ARC Testnet is purpose-built for smart contract deployment and financial applications. Native USDC, fast finality, and full EVM compatibility.</div>
            <div className="infra-tags">
              {['Native USDC', 'EVM Compatible', 'Fast Finality', 'L1 Blockchain', 'Testnet'].map(t => (
                <span key={t} className="infra-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="infra-card">
            <div className="infra-label">// AI ENGINE · ANTHROPIC</div>
            <div className="infra-title">CLAUDE AI</div>
            <div className="infra-desc">Powered by Claude Sonnet — Anthropic's most capable model. Understands natural language, generates Solidity, reviews security, and executes complex multi-step tasks.</div>
            <div className="infra-tags">
              {['Claude Sonnet', 'Code Generation', 'Security Audit', 'Natural Language', 'Multi-step'].map(t => (
                <span key={t} className="infra-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* TESTIMONIALS */}
      <div className="section">
        <div className="section-tag">// WHAT BUILDERS SAY</div>
        <h2 className="section-title">Loved by Web3 builders</h2>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="testi-text">"Deployed my ERC20 in 30 seconds. Didn't write a single line of code. Absolutely insane speed."</div>
            <div className="testi-author">@crypto_dev</div>
            <div className="testi-role">ARC Builder · Smart Contract Dev</div>
          </div>
          <div className="testi-card">
            <div className="testi-text">"Just described my NFT collection and it generated the full contract, metadata structure, everything. Mind blown."</div>
            <div className="testi-author">@nft_creator</div>
            <div className="testi-role">Digital Artist · NFT Creator</div>
          </div>
          <div className="testi-card">
            <div className="testi-text">"0.1 USDC per task is the smartest pricing I've seen in Web3. Pay for what you use, nothing else."</div>
            <div className="testi-author">@web3_founder</div>
            <div className="testi-role">Web3 Founder · DeFi Builder</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* EMAIL WALLET — chỉ 1 lần, đặt đúng chỗ giữa Testimonials và FAQ */}
      <div className="section">
        <div className="section-tag">// EMAIL WALLET · NEW FEATURE</div>
        <h2 className="section-title">Send USDC with just an email</h2>
        <p className="section-sub">
          No MetaMask needed on the receiving end. Create a wallet from your email address and send USDC to anyone on ARC Testnet — just like sending a message.
        </p>

        <div className="email-wallet-section">
          <div className="email-wallet-steps">
            <div className="ew-step">
              <div className="ew-step-icon">💌</div>
              <div className="ew-step-title">Email Address</div>
              <div className="ew-step-sub">Your identity & wallet</div>
            </div>
            <div className="ew-arrow">→</div>
            <div className="ew-step">
              <div className="ew-step-icon">💸</div>
              <div className="ew-step-title">Send USDC</div>
              <div className="ew-step-sub">Instant on ARC Testnet</div>
            </div>
            <div className="ew-arrow">→</div>
            <div className="ew-step">
              <div className="ew-step-icon">✅</div>
              <div className="ew-step-title">Received</div>
              <div className="ew-step-sub">No extension needed</div>
            </div>
          </div>

          <button
            className="ew-btn"
            onClick={handleChat}
          >
            💌 Open Email Wallet →
          </button>
          <div className="ew-hint">Open app → click "💌 Email Wallet" in sidebar</div>
        </div>
      </div>

      <hr className="divider" />

      {/* FAQ */}
      <div className="section">
        <div className="section-tag">// FAQ</div>
        <h2 className="section-title" style={{ marginBottom: 24 }}>Common questions</h2>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span className="faq-q-text">{f.q}</span>
                <span className={`faq-icon ${faqOpen === i ? 'open' : ''}`}>+</span>
              </div>
              {faqOpen === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-bar">
          <div className="footer-logo">
            <img src="/logo.png" alt="booAI_bot" />
            <span>booAI_bot</span>
          </div>
          <div className="footer-icons">
            <a href="https://github.com/lucle87/booAI-bot" target="_blank" rel="noreferrer" className="footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            </a>
            <a href="#" className="footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
            </a>
            <a href="#" className="footer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
          <span className="footer-mono">// ARC Testnet · Claude AI · 2025</span>
        </div>
        <div className="footer-bottom">
          Built with Claude AI · Deployed on ARC Testnet · Powered by USDC
        </div>
      </footer>
    </>
  )
}