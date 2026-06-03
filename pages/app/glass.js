import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function GlassApp() {
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [contractCode, setContractCode] = useState(`// Example Solidity contract\npragma solidity ^0.8.0;\n\ncontract BooAI {\n  string public message = 'booAI_bot deployed';\n}`)
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deployResult, setDeployResult] = useState(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getProvider = () => {
    if (typeof window === 'undefined') return null
    if (window.ethereum) return window.ethereum
    if (window.okxwallet) return window.okxwallet
    return null
  }

  const connectMetaMask = async () => {
    try {
      const provider = getProvider()
      if (!provider || provider !== window.ethereum || typeof provider.request !== 'function') {
        window.open('https://metamask.io/download/', '_blank')
        return
      }
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      setWallet(accounts?.[0] ?? null)
      setShowWalletModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const connectOKX = async () => {
    try {
      const provider = getProvider()
      if (!provider || provider !== window.okxwallet || typeof provider.request !== 'function') {
        window.open('https://www.okx.com/web3', '_blank')
        return
      }
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      setWallet(accounts?.[0] ?? null)
      setShowWalletModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReview = async () => {
    if (!contractCode.trim()) return
    setLoading(true)
    setAiResult(null)

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractCode }),
      })
      const data = await res.json()
      setAiResult(data)
    } catch (err) {
      console.error(err)
      setAiResult({ error: 'Review request failed.' })
    }

    setLoading(false)
  }

  const handleDeploy = async () => {
    if (!contractCode.trim()) {
      setDeployResult({ success: false, message: 'Paste contract code before deploying.' })
      return
    }

    if (!wallet) {
      setDeployResult({ success: false, message: 'Connect a wallet before deploying.' })
      return
    }

    setLoading(true)
    try {
      setDeployResult({ success: true, message: 'Deployment simulated. No blockchain interaction was performed.' })
    } catch (err) {
      console.error(err)
      setDeployResult({ success: false, message: 'Deployment failed.' })
    }
    setLoading(false)
  }

  const walletLabel = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Disconnected'

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(255,255,255,0.28), transparent 20%), linear-gradient(180deg, rgba(12, 18, 31, 0.9), rgba(22, 34, 58, 0.95))', color: '#ebf2ff', padding: '1.5rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>booAI_bot Glass</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#d8e6ff' }}>Glassmorphism style with safe client-only wallet flow.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => router.push('/picker')} style={glassButtonSecondaryStyle}>Choose style</button>
          <button type="button" onClick={() => router.push('/')} style={glassButtonSecondaryStyle}>Home</button>
        </div>
      </header>

      <section style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={cardGlassStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Wallet connect</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#d6e4ff' }}>Open the wallet modal after mount and connect securely.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#e8f3ff' }}>Status: {wallet ? 'Connected' : 'Disconnected'}</p>
              <p style={{ margin: '0.25rem 0 0', color: '#e8f3ff' }}>{walletLabel}</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" style={glassButtonStyle} onClick={() => setShowWalletModal(true)}>Select Wallet</button>
            <button type="button" style={glassButtonAltStyle} onClick={connectMetaMask}>MetaMask</button>
            <button type="button" style={glassButtonAltStyle} onClick={connectOKX}>OKX Wallet</button>
          </div>
        </div>

        <div style={cardGlassStyle}>
          <h2 style={{ margin: 0 }}>Solidity editor</h2>
          <p style={{ margin: '0.5rem 0 1rem', color: '#d6e4ff' }}>Paste contract source and then review or deploy from the client.</p>
          <textarea
            value={contractCode}
            onChange={(event) => setContractCode(event.target.value)}
            style={{ width: '100%', minHeight: '240px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '1rem', borderRadius: '20px', fontFamily: 'monospace', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button type="button" style={glassButtonStyle} onClick={handleReview} disabled={loading}>{loading ? 'Reviewing…' : 'Review contract'}</button>
            <button type="button" style={glassButtonAltStyle} onClick={handleDeploy} disabled={loading}>{loading ? 'Deploying…' : 'Deploy contract'}</button>
          </div>
          {aiResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '18px', color: '#f3f6ff' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>AI Review</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{aiResult.error ?? aiResult.review ?? JSON.stringify(aiResult, null, 2)}</pre>
            </div>
          )}
          {deployResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: deployResult.success ? 'rgba(72, 216, 164, 0.14)' : 'rgba(255, 124, 124, 0.14)', borderRadius: '18px', color: '#f3f6ff' }}>
              <strong>{deployResult.success ? 'Deploy result:' : 'Deployment error:'}</strong>
              <p style={{ margin: '0.5rem 0 0' }}>{deployResult.message}</p>
            </div>
          )}
        </div>
      </section>

      {showWalletModal && (
        <div style={glassModalOverlayStyle} onClick={() => setShowWalletModal(false)}>
          <div style={glassModalStyle} onClick={(event) => event.stopPropagation()}>
            <h2 style={{ margin: 0 }}>Connect Wallet</h2>
            <p style={{ margin: '0.5rem 0 1rem', color: '#d6e4ff' }}>Select one of the wallet providers available in your browser.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button type="button" style={glassButtonStyle} onClick={connectMetaMask}>MetaMask</button>
              <button type="button" style={glassButtonStyle} onClick={connectOKX}>OKX Wallet</button>
            </div>
            <button type="button" style={{ marginTop: '1rem', ...glassButtonAltStyle }} onClick={() => setShowWalletModal(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}

const glassButtonStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.24)',
  background: 'rgba(255,255,255,0.14)',
  color: '#ffffff',
  cursor: 'pointer',
}

const glassButtonAltStyle = {
  ...glassButtonStyle,
  background: 'rgba(255,255,255,0.08)',
}

const glassButtonSecondaryStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.24)',
  background: 'transparent',
  color: '#ffffff',
  cursor: 'pointer',
}

const cardGlassStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  backdropFilter: 'blur(18px)',
  borderRadius: '24px',
  padding: '1.5rem',
}

const glassModalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 12, 27, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
}

const glassModalStyle = {
  width: 'min(560px, 100%)',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '20px',
  padding: '1.5rem',
  backdropFilter: 'blur(18px)',
}
