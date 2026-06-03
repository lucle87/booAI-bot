import Link from 'next/link';

export default function Picker() {
  return (
    <main>
      <header className="header">
        <div className="brand">booAI_bot</div>
        <Link href="/" className="button-secondary">Home</Link>
      </header>

      <section>
        <h1 className="section-title">Choose your style</h1>
        <p className="section-text">Pick one of three smart contract deployment app experiences.</p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <Link href="/app/dark" className="card card-dark" style={{ minHeight: '240px' }}>
          <h3>Dark Cyber</h3>
          <p>Neon purple interface designed for professional builders.</p>
        </Link>
        <Link href="/app/light" className="card card-light" style={{ minHeight: '240px' }}>
          <h3>Clean Light</h3>
          <p>Modern blue light interface for a clear deployment workflow.</p>
        </Link>
        <Link href="/app/glass" className="card card-glass" style={{ minHeight: '240px' }}>
          <h3>Glassmorphism</h3>
          <p>Soft gradient glass-style interface for developer studio mode.</p>
        </Link>
      </section>

      <footer className="footer">
        <p>booAI_bot - AI Smart Contract Deployer.</p>
      </footer>
    </main>
  );
}
