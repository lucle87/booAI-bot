import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function DarkApp() {
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
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(162, 76, 255, 0.16), transparent 28%), linear-gradient(180deg, #09070d 0%, #040205 100%)', color: '#f6f6ff', padding: '1.5rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>booAI_bot Dark Cyber</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#b8c0e4' }}>Safe browser-only wallet + AI review experience.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => router.push('/picker')} style={buttonSecondaryStyle}>Choose style</button>
          <button type="button" onClick={() => router.push('/')} style={buttonSecondaryStyle}>Home</button>
        </div>
      </header>

      <section style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={cardDarkStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Wallet & network</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#c7d0ff' }}>Connect MetaMask or OKX Wallet after the page mounts.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#9da7ff' }}>Status: {wallet ? 'Connected' : 'Disconnected'}</p>
              <p style={{ margin: '0.25rem 0 0', color: '#dcdcff' }}>{walletLabel}</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" style={buttonStyle} onClick={() => setShowWalletModal(true)}>Select Wallet</button>
            <button type="button" style={buttonAltStyle} onClick={connectMetaMask}>Connect MetaMask</button>
            <button type="button" style={buttonAltStyle} onClick={connectOKX}>Connect OKX</button>
          </div>
        </div>

        <div style={cardDarkStyle}>
          <h2 style={{ margin: 0 }}>Smart contract</h2>
          <p style={{ margin: '0.5rem 0 1rem', color: '#c7d0ff' }}>Paste or edit Solidity code and review it with the AI endpoint.</p>
          <textarea
            value={contractCode}
            onChange={(event) => setContractCode(event.target.value)}
            style={{ width: '100%', minHeight: '240px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#f6f6ff', padding: '1rem', borderRadius: '16px', fontFamily: 'monospace', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button type="button" style={buttonStyle} onClick={handleReview} disabled={loading}>{loading ? 'Reviewing…' : 'Review contract'}</button>
            <button type="button" style={buttonAltStyle} onClick={handleDeploy} disabled={loading}>{loading ? 'Deploying…' : 'Deploy contract'}</button>
          </div>
          {aiResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', color: '#e3e9ff' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>AI Review</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{aiResult.error ?? aiResult.review ?? JSON.stringify(aiResult, null, 2)}</pre>
            </div>
          )}
          {deployResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: deployResult.success ? 'rgba(45, 185, 115, 0.16)' : 'rgba(255, 112, 112, 0.14)', borderRadius: '14px', color: '#f6f6ff' }}>
              <strong>{deployResult.success ? 'Deploy result:' : 'Deployment error:'}</strong>
              <p style={{ margin: '0.5rem 0 0' }}>{deployResult.message}</p>
            </div>
          )}
        </div>
      </section>

      {showWalletModal && (
        <div style={modalOverlayStyle} onClick={() => setShowWalletModal(false)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <h2 style={{ margin: 0 }}>Connect Wallet</h2>
            <p style={{ margin: '0.5rem 0 1rem', color: '#c7d0ff' }}>Choose your wallet provider.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button type="button" style={buttonStyle} onClick={connectMetaMask}>MetaMask</button>
              <button type="button" style={buttonStyle} onClick={connectOKX}>OKX Wallet</button>
            </div>
            <button type="button" style={{ marginTop: '1rem', ...buttonAltStyle }} onClick={() => setShowWalletModal(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}

const buttonStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: 'none',
  background: '#8857ff',
  color: '#ffffff',
  cursor: 'pointer',
}

const buttonAltStyle = {
  ...buttonStyle,
  background: 'rgba(255,255,255,0.08)',
  color: '#f6f6ff',
}

const buttonSecondaryStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'transparent',
  color: '#f6f6ff',
  cursor: 'pointer',
}

const cardDarkStyle = {
  background: 'rgba(15, 12, 30, 0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '1.5rem',
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
}

const modalStyle = {
  width: 'min(560px, 100%)',
  background: '#09070d',
  borderRadius: '20px',
  padding: '1.5rem',
  boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
}
