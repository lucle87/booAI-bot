import Head from 'next/head';
import { useRouter } from 'next/router';

const features = [
  {
    title: 'AI agent workflows',
    description: 'Audit, summarize, and optimize contracts for ARC Testnet with Claude-powered intelligence.',
  },
  {
    title: 'Wallet-safe browser flow',
    description: 'Connect MetaMask or OKX Wallet only after the page mounts and keep sensitive operations client-side.',
  },
  {
    title: 'ARC Testnet-first',
    description: 'Designed specifically for ARC Testnet deployment, network switching, and contract readiness.',
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>booAI_bot — ARC Testnet AI Agent</title>
        <meta
          name="description"
          content="booAI_bot is an AI Agent platform for ARC Testnet smart contracts, audit review and wallet-safe workflows."
        />
      </Head>

      <main>
        <header className="header">
          <div>
            <p className="brand">booAI_bot</p>
            <p className="subtitle">AI Agent platform for ARC Testnet contract review, generation, and deployment guidance.</p>
          </div>
          <button type="button" className="button" onClick={() => router.push('/app')}>Enter the ARC Agent</button>
        </header>

        <section>
          <h1 className="section-title">Build contracts with an AI-first ARC Testnet workflow.</h1>
          <p className="section-text">booAI_bot brings contract review, smart generation, and wallet-aware action into a unified browser experience for very fast developer flow.</p>
        </section>

        <section className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem' }}>
          {features.map((feature) => (
            <article key={feature.title} className="card">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="card" style={{ padding: '2rem' }}>
          <h2 className="section-title">Why ARC Testnet?</h2>
          <div className="list-card">
            <div>
              <p className="label">Purpose-built testnet</p>
              <p>Fast, low-cost ARC Testnet deployment with simplified network setup and immediate wallet feedback.</p>
            </div>
            <div>
              <p className="label">Claude-powered analysis</p>
              <p>Securely review contracts and receive developer-focused recommendations from Anthropic Claude.</p>
            </div>
            <div>
              <p className="label">Browser-first safety</p>
              <p>No wallet access until the page mounts — safe for Next.js and avoids SSR browser assumptions.</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>booAI_bot — ARC Testnet AI Agent Platform</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="tag">ARC Testnet</span>
            <span className="tag">MetaMask & OKX</span>
            <span className="tag">Anthropic Claude</span>
          </div>
        </footer>
      </main>
    </>
  );
}
