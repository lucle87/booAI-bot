import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LightApp() {
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
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eff7ff 0%, #d9e9ff 100%)', color: '#0f2b59', padding: '1.5rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>booAI_bot Light</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#516d97' }}>A clean, safe client-side wallet and AI review page.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => router.push('/picker')} style={lightButtonSecondaryStyle}>Choose style</button>
          <button type="button" onClick={() => router.push('/')} style={lightButtonSecondaryStyle}>Home</button>
        </div>
      </header>

      <section style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={cardLightStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Wallet connection</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#566f95' }}>Connect MetaMask or OKX after mount and paste your contract code.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#3b5f99' }}>Status: {wallet ? 'Connected' : 'Disconnected'}</p>
              <p style={{ margin: '0.25rem 0 0', color: '#4b6f9f' }}>{walletLabel}</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" style={lightButtonStyle} onClick={() => setShowWalletModal(true)}>Select Wallet</button>
            <button type="button" style={lightButtonAltStyle} onClick={connectMetaMask}>MetaMask</button>
            <button type="button" style={lightButtonAltStyle} onClick={connectOKX}>OKX Wallet</button>
          </div>
        </div>

        <div style={cardLightStyle}>
          <h2 style={{ margin: 0 }}>Smart contract editor</h2>
          <p style={{ margin: '0.5rem 0 1rem', color: '#566f95' }}>Review and deploy your Solidity contract safely on the client.</p>
          <textarea
            value={contractCode}
            onChange={(event) => setContractCode(event.target.value)}
            style={{ width: '100%', minHeight: '240px', background: '#fff', border: '1px solid #c7d4ea', color: '#0f2b59', padding: '1rem', borderRadius: '16px', fontFamily: 'monospace', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button type="button" style={lightButtonStyle} onClick={handleReview} disabled={loading}>{loading ? 'Reviewing…' : 'Review contract'}</button>
            <button type="button" style={lightButtonAltStyle} onClick={handleDeploy} disabled={loading}>{loading ? 'Deploying…' : 'Deploy contract'}</button>
          </div>
          {aiResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5ff', borderRadius: '14px', color: '#0f2b59' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>AI Review</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>{aiResult.error ?? aiResult.review ?? JSON.stringify(aiResult, null, 2)}</pre>
            </div>
          )}
          {deployResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: deployResult.success ? '#e7f8ee' : '#ffe7e7', borderRadius: '14px', color: '#0f2b59' }}>
              <strong>{deployResult.success ? 'Deploy result:' : 'Deployment error:'}</strong>
              <p style={{ margin: '0.5rem 0 0' }}>{deployResult.message}</p>
            </div>
          )}
        </div>
      </section>

      {showWalletModal && (
        <div style={lightModalOverlayStyle} onClick={() => setShowWalletModal(false)}>
          <div style={lightModalStyle} onClick={(event) => event.stopPropagation()}>
            <h2 style={{ margin: 0 }}>Connect Wallet</h2>
            <p style={{ margin: '0.5rem 0 1rem', color: '#566f95' }}>Choose your wallet provider.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button type="button" style={lightButtonStyle} onClick={connectMetaMask}>MetaMask</button>
              <button type="button" style={lightButtonStyle} onClick={connectOKX}>OKX Wallet</button>
            </div>
            <button type="button" style={{ marginTop: '1rem', ...lightButtonAltStyle }} onClick={() => setShowWalletModal(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}

const lightButtonStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: 'none',
  background: '#3c76ff',
  color: '#ffffff',
  cursor: 'pointer',
}

const lightButtonAltStyle = {
  ...lightButtonStyle,
  background: '#e7f1ff',
  color: '#0f2b59',
}

const lightButtonSecondaryStyle = {
  padding: '0.9rem 1.4rem',
  borderRadius: '14px',
  border: '1px solid #bfd1ff',
  background: 'transparent',
  color: '#0f2b59',
  cursor: 'pointer',
}

const cardLightStyle = {
  background: '#ffffff',
  border: '1px solid #dbe4f2',
  borderRadius: '24px',
  padding: '1.5rem',
}

const lightModalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 34, 79, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
}

const lightModalStyle = {
  width: 'min(560px, 100%)',
  background: '#ffffff',
  borderRadius: '20px',
  padding: '1.5rem',
  boxShadow: '0 24px 80px rgba(15,34,79,0.18)',
}
