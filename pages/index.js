import Link from 'next/link';
import { useRouter } from 'next/router';

const networks = [
  { id: 'ethereum', icon: '⟠', name: 'Ethereum', status: 'Soon' },
  { id: 'bnb', icon: '🟡', name: 'BNB Chain', status: 'Soon' },
  { id: 'polygon', icon: '🟦', name: 'Polygon', status: 'Soon' },
  { id: 'arbitrum', icon: '🟣', name: 'Arbitrum', status: 'Soon' },
  { id: 'optimism', icon: '🔵', name: 'Optimism', status: 'Soon' },
  { id: 'base', icon: '🟤', name: 'Base', status: 'Soon' },
  { id: 'avalanche', icon: '🟥', name: 'Avalanche', status: 'Soon' },
  { id: 'abstractTestnet', icon: '🧩', name: 'Abstract Testnet', status: 'Live' },
];

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div className="brand" style={{ fontSize: '75%' }}>booAI_bot</div>
        </div>
      </header>

      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative elements */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6d74c8" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Floating orbs */}
          <circle cx="80%" cy="15%" r="40" fill="#a370f0" opacity="0.15" />
          <circle cx="75%" cy="25%" r="25" fill="#00d9ff" opacity="0.12" />
          <circle cx="85%" cy="40%" r="35" fill="#a370f0" opacity="0.1" />
          <circle cx="88%" cy="60%" r="20" fill="#00d9ff" opacity="0.15" />
          
          {/* Floating code snippets */}
          <text x="78%" y="20%" fontSize="14" fill="#6d74c8" opacity="0.2" fontFamily="monospace">pragma solidity</text>
          <text x="80%" y="50%" fontSize="12" fill="#00d9ff" opacity="0.15" fontFamily="monospace">contract</text>
          <text x="75%" y="75%" fontSize="13" fill="#a370f0" opacity="0.18" fontFamily="monospace">deploy()</text>
        </svg>

        <div className="grid" style={{ gap: '2.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 className="title">AI Smart Contract Deployer</h1>
            <p className="subtitle">
              Create, review, and deploy Solidity contracts with MetaMask and USDC.
            </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.8rem' }}>
              <button className="button" onClick={() => router.push('/app/dark')}>Get started</button>
            </div>
          </div>
          
          {/* Anime AI Girl - Desktop only */}
          <div style={{ display: 'none', '@media (min-width: 1024px)': { display: 'flex' } }}>
            <svg viewBox="0 0 300 500" style={{ height: '500px', width: 'auto', opacity: 0.85 }}>
              <defs>
                <linearGradient id="hairGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#a370f0', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#00d9ff', stopOpacity: 0.6 }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Hair with glow */}
              <path d="M 80 60 Q 60 100 65 160 Q 70 220 85 280 Q 90 320 100 360 Q 110 350 115 280 Q 120 200 125 160 L 150 40 L 175 160 Q 180 200 185 280 Q 190 350 200 360 Q 210 320 215 280 Q 230 220 235 160 Q 240 100 220 60 Q 200 40 150 35 Q 100 40 80 60 Z" 
                    fill="url(#hairGlow)" stroke="#00d9ff" strokeWidth="1.5" filter="url(#glow)" opacity="0.9" />
              
              {/* Head */}
              <circle cx="150" cy="120" r="45" fill="#f5e6d3" stroke="#d4a574" strokeWidth="1" />
              
              {/* Eyes with glow */}
              <circle cx="130" cy="110" r="8" fill="#00d9ff" stroke="#a370f0" strokeWidth="1" filter="url(#glow)" />
              <circle cx="170" cy="110" r="8" fill="#00d9ff" stroke="#a370f0" strokeWidth="1" filter="url(#glow)" />
              <circle cx="132" cy="108" r="3" fill="#ffffff" opacity="0.8" />
              <circle cx="172" cy="108" r="3" fill="#ffffff" opacity="0.8" />
              
              {/* Nose */}
              <line x1="150" y1="120" x2="150" y2="135" stroke="#d4a574" strokeWidth="1" />
              
              {/* Mouth */}
              <path d="M 140 145 Q 150 150 160 145" stroke="#d4a574" strokeWidth="1.5" fill="none" />
              
              {/* Neck */}
              <rect x="140" y="165" width="20" height="25" fill="#f5e6d3" stroke="#d4a574" strokeWidth="0.5" />
              
              {/* Tech outfit - torso */}
              <path d="M 120 190 L 110 280 Q 110 300 125 310 L 175 310 Q 190 300 190 280 L 180 190 Z" 
                    fill="#2a2a4a" stroke="#00d9ff" strokeWidth="1.5" opacity="0.9" />
              
              {/* Shoulder tech details */}
              <circle cx="115" cy="195" r="6" fill="#a370f0" opacity="0.7" stroke="#00d9ff" strokeWidth="1" filter="url(#glow)" />
              <circle cx="185" cy="195" r="6" fill="#a370f0" opacity="0.7" stroke="#00d9ff" strokeWidth="1" filter="url(#glow)" />
              
              {/* Arms */}
              <path d="M 120 210 L 80 260" stroke="#f5e6d3" strokeWidth="12" strokeLinecap="round" />
              <path d="M 180 210 L 220 260" stroke="#f5e6d3" strokeWidth="12" strokeLinecap="round" />
              
              {/* Hands */}
              <circle cx="80" cy="265" r="8" fill="#f5e6d3" stroke="#d4a574" strokeWidth="0.5" />
              <circle cx="220" cy="265" r="8" fill="#f5e6d3" stroke="#d4a574" strokeWidth="0.5" />
              
              {/* Holographic code display near hand */}
              <rect x="60" y="245" width="50" height="40" fill="none" stroke="#00d9ff" strokeWidth="1" opacity="0.6" rx="4" />
              <text x="68" y="260" fontSize="8" fill="#00d9ff" opacity="0.7" fontFamily="monospace">contract</text>
              <text x="68" y="272" fontSize="8" fill="#a370f0" opacity="0.7" fontFamily="monospace">deploy()</text>
              
              {/* Legs */}
              <path d="M 135 310 L 130 400" stroke="#2a2a4a" strokeWidth="14" strokeLinecap="round" />
              <path d="M 165 310 L 170 400" stroke="#2a2a4a" strokeWidth="14" strokeLinecap="round" />
              
              {/* Boots */}
              <rect x="120" y="395" width="20" height="25" fill="#a370f0" stroke="#00d9ff" strokeWidth="1" opacity="0.8" rx="3" />
              <rect x="160" y="395" width="20" height="25" fill="#a370f0" stroke="#00d9ff" strokeWidth="1" opacity="0.8" rx="3" />
              
              {/* Floating particles around her */}
              <circle cx="90" cy="150" r="2" fill="#00d9ff" opacity="0.6" />
              <circle cx="210" cy="200" r="2.5" fill="#a370f0" opacity="0.5" />
              <circle cx="100" cy="350" r="1.5" fill="#00d9ff" opacity="0.7" />
              <circle cx="200" cy="320" r="2" fill="#a370f0" opacity="0.6" />
            </svg>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @media (max-width: 1023px) {
          div:has(svg) {
            display: none !important;
          }
        }
      `}</style>

      <section>
        <div className="header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="section-title">Multi-Chain Support</h2>
            <p className="section-text">Start with Abstract Testnet. More chains coming soon.</p>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {networks.map((network) => (
            <div key={network.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{network.icon}</span>
                <div>
                  <h3 style={{ margin: 0 }}>{network.name}</h3>
                  <p style={{ margin: 0, color: '#a9b2d4', fontSize: '0.95rem' }}>{network.id === 'abstractTestnet' ? 'Live deployment support' : 'Coming soon'}</p>
                </div>
              </div>
              <span className="tag" style={{ background: network.status === 'Live' ? '#2bad6f' : 'rgba(255, 255, 255, 0.08)', color: network.status === 'Live' ? '#ecfff3' : '#cbd6ff' }}>
                {network.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="section-title">Features</h2>
            <p className="section-text">A fast platform to prepare, review, and deploy contracts with a smart workflow.</p>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="card">
            <h3>MetaMask connect</h3>
            <p>Easy wallet connection and chain selection before deployment.</p>
          </div>
          <div className="card">
            <h3>AI contract review</h3>
            <p>Send Solidity to Anthropic for security and quality feedback.</p>
          </div>
          <div className="card">
            <h3>USDC payment</h3>
            <p>Pay 0.1 USDC to deploy your contract with confidence.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="section-title">How it works</h2>
            <p className="section-text">Choose a style, select a network, connect your wallet, review code, and deploy quickly.</p>
          </div>
        </div>
        <div className="list-card">
          <div>
            <strong>1.</strong> Pick the interface that fits your workflow.
          </div>
          <div>
            <strong>2.</strong> Select a network and connect MetaMask.
          </div>
          <div>
            <strong>3.</strong> Paste Solidity or ABI + Bytecode, click AI Review, and get feedback.
          </div>
          <div>
            <strong>4.</strong> Pay 0.1 USDC and deploy the contract.
          </div>
        </div>
      </section>

      <section>
        <div className="header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="section-title">Roadmap</h2>
            <p className="section-text">Next goals: open source, multi-chain support, and automated contract testing.</p>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className="card card-dark">
            <h3>Q3</h3>
            <p>Polish AI review experience and support more input formats.</p>
          </div>
          <div className="card card-dark">
            <h3>Q4</h3>
            <p>Deploy to additional chains and add automatic ABI discovery.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>booAI_bot © 2026 — AI Smart Contract Deployer.</p>
        <div>
          <Link href="/picker" className="button-secondary">Choose style</Link>
        </div>
      </footer>
    </main>
  );
}
