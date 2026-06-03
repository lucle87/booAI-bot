import Link from 'next/link';

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
  return (
    <main>
      <header className="header">
        <div className="brand">booAI_bot</div>
        <nav>
          <Link href="/picker" className="button-secondary">Choose style</Link>
        </nav>
      </header>

      <section>
        <div className="grid" style={{ gap: '2.5rem' }}>
          <div>
            <h1 className="title">booAI_bot — AI Smart Contract Deployer</h1>
            <p className="subtitle">
              Create, review, and deploy Solidity contracts with MetaMask and USDC.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.8rem' }}>
              <Link href="/picker" className="button">Get started</Link>
              <Link href="/app/dark" className="button-secondary">Dark Cyber demo</Link>
            </div>
          </div>
          <div className="card card-dark">
            <p className="tag">Smart contract flow</p>
            <h2 className="section-title">Developer workflow</h2>
            <p className="section-text">
              booAI_bot combines wallet connectivity, AI review, and USDC deployment into a polished contract builder experience.
            </p>
          </div>
        </div>
      </section>

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
