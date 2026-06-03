import Head from 'next/head';
import { useRouter } from 'next/router';

const tools = [
  {
    icon: '🤖',
    meta: '// AI Assistant · Claude Sonnet · Natural Language',
    title: 'Chat to Deploy',
    description: 'Describe your contract in plain English. AI asks questions and generates Solidity code automatically.',
    tags: ['Claude AI', 'Natural Language', 'Auto-Generate'],
  },
  {
    icon: '⚡',
    meta: '// Solidity · ERC20 · One-Click',
    title: 'Token Launcher',
    description: 'Deploy ERC20 tokens with custom name, symbol, supply in seconds.',
    tags: ['ERC20', 'Custom Supply', 'Instant'],
  },
  {
    icon: '🖼️',
    meta: '// ERC721 · NFT · Metadata',
    title: 'NFT Collection',
    description: 'Launch NFT collections with metadata, max supply, mint price.',
    tags: ['ERC721', 'NFT', 'Coming Soon'],
  },
  {
    icon: '🔒',
    meta: '// Solidity · ABI · Bytecode',
    title: 'Custom Contract',
    description: 'Upload your own ABI + Bytecode or paste raw Solidity. Full control.',
    tags: ['ABI', 'Bytecode', 'Advanced'],
  },
  {
    icon: '🛡️',
    meta: '// Claude AI · Security · Audit',
    title: 'AI Security Audit',
    description: 'Automatic vulnerability detection. Reentrancy, overflow, access control checks.',
    tags: ['Security', 'AI Audit', 'Free'],
  },
  {
    icon: '🌐',
    meta: '// Multi-chain · Coming Soon',
    title: 'Multi-Chain Deploy',
    description: 'Deploy to Ethereum, BNB, Polygon, Arbitrum from one interface.',
    tags: ['Multi-Chain', 'Coming Soon'],
  },
];

const infra = [
  {
    title: 'ARC NETWORK',
    subtitle: 'Purpose-built testnet for smart contract deployment',
  },
  {
    title: 'CLAUDE AI',
    subtitle: "Anthropic's AI for security review and code generation",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>booAI_bot — ARC Testnet Deploy Suite</title>
        <meta name="description" content="Brutalist AI contract deployer for ARC Testnet with MetaMask, OKX Wallet and Claude AI." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="page">
        <nav className="navBar">
          <div className="navBrand">
            <span className="logoCircle">B</span>
            <span className="brandText">BOOAI_BOT</span>
          </div>

          <div className="navTicker" aria-label="web3 ticker">
            <div className="tickerTrack">
              <span>◆ AI CONTRACT DEPLOYER · ARC TESTNET ◆ METAMASK · OKX WALLET ◆ SOLIDITY · ABI + BYTECODE ◆ 0.1 USDC PER DEPLOY ◆ MULTI-CHAIN COMING SOON ◆</span>
              <span>◆ AI CONTRACT DEPLOYER · ARC TESTNET ◆ METAMASK · OKX WALLET ◆ SOLIDITY · ABI + BYTECODE ◆ 0.1 USDC PER DEPLOY ◆ MULTI-CHAIN COMING SOON ◆</span>
            </div>
          </div>

          <button className="navButton" onClick={() => router.push('/app/dark')}>Get Started →</button>
        </nav>

        <div className="topTicker" aria-hidden="true">
          <div className="tickerTrack small">
            <span>◆ DEPLOY ERC20 · ARC TESTNET ◆ SOLIDITY COMPILER ◆ AI SECURITY AUDIT ◆ 0.1 USDC FEE ◆ METAMASK + OKX ◆ MULTI-CHAIN SOON ◆</span>
            <span>◆ DEPLOY ERC20 · ARC TESTNET ◆ SOLIDITY COMPILER ◆ AI SECURITY AUDIT ◆ 0.1 USDC FEE ◆ METAMASK + OKX ◆ MULTI-CHAIN SOON ◆</span>
          </div>
        </div>

        <section className="heroSection">
          <span className="heroLabel">CONTRACT DEPLOYER · ARC TESTNET · AI POWERED</span>
          <h1 className="heroTitle">
            <span>BOOAI_BOT</span>
            <span className="heroAccent">DEPLOY SUITE</span>
          </h1>
          <p className="heroCopy">Every smart contract you need to launch — all in one place. AI review. One-click deploy. Multi-chain ready.</p>

          <div className="statusRow">
            <span className="statusBadge live">CONTRACT LIVE</span>
            <span className="statusBadge">AI ARMED</span>
            <span className="statusBadge">ARC TESTNET</span>
            <span className="statusBadge">USDC NATIVE</span>
          </div>

          <div className="statRow">
            <div className="statItem"><span className="statLabel">Contract Fee</span>0.1 USDC</div>
            <div className="statItem"><span className="statLabel">Network</span>ARC Testnet</div>
            <div className="statItem"><span className="statLabel">AI</span>Claude Sonnet</div>
            <div className="statItem"><span className="statLabel">Chains</span>8+</div>
          </div>
        </section>

        <section className="toolsSection">
          <div className="sectionHeader">
            <span className="sectionLabel">Deploy Tools</span>
          </div>

          <div className="toolsGrid">
            {tools.map((tool) => (
              <article key={tool.title} className="toolCard">
                <p className="toolMeta">{tool.icon} {tool.meta}</p>
                <h2>{tool.title}</h2>
                <p>{tool.description}</p>
                <div className="toolTags">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="toolTag">{tag}</span>
                  ))}
                </div>
                <button className="toolLink" type="button">Explore →</button>
              </article>
            ))}
          </div>
        </section>

        <section className="infraSection">
          {infra.map((item) => (
            <div key={item.title} className="infraCard">
              <p className="infraLabel">{item.title}</p>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>
          ))}
        </section>

        <footer className="footerSection">
          <div className="footerLeft">
            <span className="logoCircle small">B</span>
            <span>BOOAI_BOT</span>
          </div>

          <div className="footerLinks">
            <button type="button">Deploy</button>
            <button type="button">AI Review</button>
            <button type="button">Multi-Chain</button>
            <button type="button">Docs</button>
          </div>

          <div className="footerRight">CONTRACT DEPLOYER · ARC TESTNET · CLAUDE AI</div>
        </footer>

        <div className="footerMeta">// ARC Testnet · USDC Native · AI Powered</div>
      </main>

      <style jsx>{`
        :global(html) {
          background: #05050a;
          color: #f0f0f5;
          font-family: 'Space Grotesk', sans-serif;
        }

        :global(body) {
          margin: 0;
          background: #05050a;
        }

        .page {
          min-height: 100vh;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .navBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 18px 22px;
          background: #0c0c14;
          border-radius: 20px;
        }

        .navBrand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logoCircle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #13131c;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #9b7fff;
        }

        .brandText {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          letter-spacing: -0.05em;
          font-size: 0.95rem;
          color: #f0f0f5;
        }

        .navTicker {
          overflow: hidden;
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          padding: 11px 0;
          border-radius: 16px;
        }

        .tickerTrack {
          display: inline-flex;
          gap: 52px;
          white-space: nowrap;
          animation: scroll 24s linear infinite;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #6b6b85;
          padding-left: 16px;
        }

        .tickerTrack.small {
          font-size: 11px;
          color: #8b8b9f;
          letter-spacing: 0.1em;
        }

        .topTicker {
          overflow: hidden;
          border-radius: 16px;
          background: #0c0c14;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 10px 0;
        }

        .navButton,
        .toolLink,
        .footerLinks button {
          font-family: 'Space Grotesk', sans-serif;
          border: 1px solid rgba(155,127,255,0.35);
          background: transparent;
          color: #f0f0f5;
          padding: 12px 18px;
          border-radius: 14px;
          cursor: pointer;
          transition: border-color 180ms ease, transform 180ms ease;
        }

        .navButton:hover,
        .toolLink:hover,
        .footerLinks button:hover {
          border-color: #9b7fff;
          transform: translateY(-1px);
        }

        .heroSection {
          padding: 34px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #0c0c14;
          border-radius: 24px;
          display: grid;
          gap: 24px;
        }

        .heroLabel,
        .sectionLabel,
        .statLabel,
        .toolMeta,
        .infraLabel,
        .footerMeta {
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 0.7rem;
          color: #6b6b85;
        }

        .heroTitle {
          margin: 0;
          display: grid;
          gap: 10px;
          font-size: clamp(3.6rem, 7vw, 7.6rem);
          line-height: 0.92;
          letter-spacing: -0.08em;
          font-weight: 800;
          font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase;
        }

        .heroTitle span {
          display: block;
        }

        .heroAccent {
          background: linear-gradient(90deg, #9b7fff 0%, #3de8c8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .heroCopy {
          margin: 0;
          max-width: 820px;
          color: #d8d8e8;
          font-size: 1.05rem;
          line-height: 1.9;
        }

        .statusRow {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          border-radius: 999px;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f0f0f5;
        }

        .statusBadge.live {
          border-color: #3de8c8;
          position: relative;
        }

        .statusBadge.live::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3de8c8;
          box-shadow: 0 0 0 0 rgba(61,232,200,0.55);
          animation: pulse 1.8s infinite ease-in-out;
        }

        .statRow {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .statItem {
          min-width: 220px;
          padding: 16px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          font-weight: 700;
          line-height: 1.5;
        }

        .statItem .statLabel {
          display: block;
          color: #6b6b85;
          font-weight: 400;
          margin-bottom: 4px;
        }

        .toolsSection {
          display: grid;
          gap: 22px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .toolsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .toolCard {
          padding: 22px;
          background: #0c0c14;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: border-color 180ms ease, transform 180ms ease;
        }

        .toolCard:hover {
          border-color: #9b7fff;
          transform: translateY(-2px);
        }

        .toolMeta {
          margin: 0;
          color: #6b6b85;
          font-size: 0.78rem;
        }

        .toolCard h2 {
          margin: 0;
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .toolCard p {
          margin: 0;
          color: #d8d8e8;
          line-height: 1.8;
        }

        .toolTags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .toolTag {
          display: inline-flex;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          color: #c8c8e1;
        }

        .infraSection {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .infraCard {
          padding: 26px;
          border-radius: 22px;
          background: #0c0c14;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .infraCard h3 {
          margin: 10px 0 0;
          font-size: 1.9rem;
          letter-spacing: -0.06em;
        }

        .infraCard p {
          margin: 14px 0 0;
          color: #c8c8e1;
          line-height: 1.9;
        }

        .footerSection {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 22px;
          border: 1px solid rgba(255,255,255,0.06);
          background: #0c0c14;
          border-radius: 20px;
        }

        .footerLeft,
        .footerRight {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.02em;
          font-size: 0.95rem;
        }

        .footerLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footerMeta {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: #6b6b85;
          text-align: center;
        }

        @media (max-width: 1200px) {
          .toolsGrid,
          .infraSection {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 860px) {
          .navBar,
          .heroSection,
          .footerSection {
            flex-direction: column;
            align-items: stretch;
          }

          .navTicker {
            min-width: 100%;
          }

          .statRow {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 20px;
          }

          .navBar,
          .topTicker,
          .heroSection,
          .toolCard,
          .infraCard,
          .footerSection {
            padding: 18px;
          }

          .heroTitle {
            font-size: 3.6rem;
          }

          .navButton,
          .toolLink,
          .footerLinks button {
            width: 100%;
          }
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(61,232,200,0.55);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(61,232,200,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(61,232,200,0);
          }
        }
      `}</style>
    </>
  );
}
