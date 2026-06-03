"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { useDeploy } from '../../hooks/useDeploy';
import { CHAINS } from '../../lib/config';
import { ClientErrorBoundary } from '../../components/ClientErrorBoundary';

const initialAbi = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"}]';
const initialBytecode = '0x6003600501';
const initialSolidity = `// Example Solidity contract\npragma solidity ^0.8.0;\n\ncontract BooAI {\n  string public message = 'booAI_bot deployed';\n}`;

const networkOptions = [
  { key: 'ethereum', icon: '⟠' },
  { key: 'bnb', icon: '🟡' },
  { key: 'polygon', icon: '🟦' },
  { key: 'arbitrum', icon: '🟣' },
  { key: 'optimism', icon: '🔵' },
  { key: 'base', icon: '🟤' },
  { key: 'avalanche', icon: '🟥' },
  { key: 'abstractTestnet', icon: '🧩' },
];

function GlassAppComponent() {
  const { account, chainId, error, connectMetaMask, connectOkxWallet, connectWalletConnect, switchToAbstract } = useWallet();
  const { deploying, contractAddress, deployError, deployContract } = useDeploy();
  const [selectedTab, setSelectedTab] = useState('solidity');
  const [selectedChainKey, setSelectedChainKey] = useState(null);
  const [solidity, setSolidity] = useState(initialSolidity);
  const [abi, setAbi] = useState(initialAbi);
  const [bytecode, setBytecode] = useState(initialBytecode);
  const [review, setReview] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const editorRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const walletProvider = window.ethereum || window.okxwallet;
      if (walletProvider) {
        const browserProvider = new ethers.BrowserProvider(walletProvider);
        setProvider(browserProvider);
        setSigner(browserProvider.getSigner());
      }
    }
  }, []);

  if (!mounted) return null;

  const selectedChain = selectedChainKey ? CHAINS[selectedChainKey] : null;
  const isSelectedChainLive = selectedChain?.status === 'live';
  const isSelectedChainConnected = selectedChainKey === 'abstractTestnet' && chainId === '0x2b14';
  const getNetworkLabel = (id) => {
    if (!id) return 'unknown';
    if (id === '0x2b14') return 'ARC Testnet';
    return id;
  };
  const shortenAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'not connected';
  const walletOptions = [
    {
      id: 'metamask',
      icon: '🦊',
      title: 'MetaMask',
      description: 'Browser Extension',
      onClick: async () => { await connectMetaMask(); setWalletModalOpen(false); },
      disabled: false,
    },
    {
      id: 'okx',
      icon: 'OKX',
      title: 'OKX Wallet',
      description: 'OKX Browser Extension',
      onClick: async () => { await connectOkxWallet(); setWalletModalOpen(false); },
      disabled: false,
    },
    {
      id: 'walletconnect',
      icon: '🔗',
      title: 'WalletConnect',
      description: 'Mobile & Multi-wallet',
      onClick: () => { connectWalletConnect(); setWalletModalOpen(false); },
      disabled: false,
    },
    {
      id: 'email',
      icon: '📧',
      title: 'Email / Social Login',
      description: 'Sign in with Email (Coming Soon)',
      onClick: null,
      disabled: true,
    },
  ];
  const openWalletModal = () => setWalletModalOpen(true);
  const closeWalletModal = () => setWalletModalOpen(false);
  const contractReady = selectedTab === 'solidity'
    ? solidity.trim().length > 0 && solidity.trim() !== initialSolidity.trim()
    : abi.trim().length > 0 && bytecode.trim().length > 0 && (abi.trim() !== initialAbi.trim() || bytecode.trim() !== initialBytecode.trim());
  const showPasteContract = selectedChain && account && !contractReady && !review && !contractAddress;
  const showAnalyzeContract = selectedChain && account && contractReady && !review && !contractAddress;
  const showLaunchContract = selectedChain && account && review && !contractAddress;
  const showLaunching = deploying;
  const showViewExplorer = contractAddress && selectedChain?.explorer;

  const selectChain = (key) => {
    if (CHAINS[key].status === 'live') {
      setSelectedChainKey(key);
    }
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleLaunch = async () => {
    await handleDeploy();
  };

  const handleReview = async () => {
    setReview('');
    setReviewError(null);
    setReviewing(true);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: selectedTab === 'solidity' ? solidity : `${abi}\n\n${bytecode}` }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReviewError(data.error || 'Review failed.');
      } else {
        setReview(data.review || 'No review returned.');
      }
    } catch (err) {
      setReviewError(err.message || 'Unable to complete review.');
    } finally {
      setReviewing(false);
    }
  };

  const handleDeploy = async () => {
    await deployContract({ signer, abi, bytecode });
  };

  const sendChat = async (text) => {
    if (!text || chatLoading) return;
    const userMsg = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await resp.json();
      if (data.error) {
        setMessages((m) => [...m, { role: 'assistant', text: 'Error: ' + String(data.error) }]);
      } else {
        const assistantText = data.assistant || (data.message || '');
        setMessages((m) => [...m, { role: 'assistant', text: assistantText }]);
        if (data.done && data.solidityCode) {
          setSolidity(data.solidityCode);
          setReview('');
        }
      }
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Chat service error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <ClientErrorBoundary>
      <main
        style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(79, 88, 255, 0.16), transparent 31%), linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(20, 30, 70, 0.95))',
        color: '#f2f7ff',
      }}
    >
      <header className="header">
        <div>
          <div className="brand" style={{ fontSize: '1.5rem' }}>booAI_bot</div>
          {selectedChain && <p style={{ margin: '0.5rem 0 0', color: '#d9e9ff' }}>Selected network: {selectedChain.name}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/picker" className="button-secondary">Choose style</Link>
          <Link href="/" className="button-secondary">Home</Link>
        </div>
      </header>

      <section>
        <div className="header" style={{ justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 className="title">Glassmorphism</h1>
            <p className="subtitle">A soft gradient glass interface for network selection and smart deployment.</p>
          </div>
        </div>

        <div className="card card-glass" style={{ marginTop: '1.5rem' }}>
          <h2 className="section-title">Select Network</h2>
          <p className="section-text">Choose Abstract Testnet to deploy now. Other chains are available soon.</p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {networkOptions.map((network) => {
              const chain = CHAINS[network.key];
              const active = selectedChainKey === network.key;
              const disabled = chain.status !== 'live';

              return (
                <button
                  key={network.key}
                  type="button"
                  onClick={() => selectChain(network.key)}
                  disabled={disabled}
                  className="card"
                  style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.55 : 1,
                    border: active ? '1px solid rgba(255,255,255,0.75)' : '1px solid rgba(255,255,255,0.14)',
                    background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '1.6rem' }}>{network.icon}</span>
                    <h3 style={{ margin: '0.65rem 0 0' }}>{chain.name}</h3>
                  </div>
                  <span className="tag" style={{ background: chain.status === 'live' ? '#2bad6f' : 'rgba(255, 255, 255, 0.12)', color: chain.status === 'live' ? '#ecfff3' : '#d9e9ff' }}>
                    {chain.status === 'live' ? 'Live' : 'Coming Soon'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedChain && (
          <div className="card card-glass" style={{ marginTop: '1.5rem' }}>
            <p className="tag">Account: {shortenAddress(account)}</p>
            <p className="tag">Network: {getNetworkLabel(chainId)}{isSelectedChainConnected ? ` (${selectedChain.name})` : ''}</p>
            {!account && isSelectedChainLive && (
              <button className="button" style={{ width: '100%' }} onClick={openWalletModal}>Connect Wallet →</button>
            )}
            {account && !isSelectedChainConnected && selectedChainKey === 'abstractTestnet' && (
              <button className="button-secondary" style={{ width: '100%' }} onClick={switchToAbstract}>Switch to {selectedChain.name}</button>
            )}
            {account && isSelectedChainConnected && (
              <p style={{ color: '#d9e9ff', marginTop: '1rem' }}>Wallet connected to {selectedChain.name}.</p>
            )}
            {error && (
              error.includes('metamask.io') ? (
                <p style={{ color: '#ffb3a7', marginTop: '1rem' }}>
                  <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {error}
                  </a>
                </p>
              ) : (
                <p style={{ color: '#ffb3a7', marginTop: '1rem' }}>{error}</p>
              )
            )}
          </div>
        )}

        {walletModalOpen && (
          <div className="wallet-modal-overlay" onClick={closeWalletModal}>
            <div className="wallet-modal" onClick={(event) => event.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#fff' }}>Connect Wallet</h2>
                  <p style={{ margin: '0.4rem 0 0', color: '#d8dff2' }}>Choose a wallet to connect.</p>
                </div>
                <button onClick={closeWalletModal} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer' }}>×</button>
              </div>
              {walletOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="wallet-modal-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '1rem',
                    marginBottom: '0.8rem',
                    background: option.disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                    border: option.disabled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(155,127,255,0.3)',
                    borderRadius: '14px',
                    color: '#fff',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    opacity: option.disabled ? 0.5 : 1,
                    pointerEvents: option.disabled ? 'none' : 'auto',
                    textAlign: 'left',
                  }}
                  onClick={option.onClick}
                  disabled={option.disabled}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{option.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{option.title}</div>
                      <div style={{ color: '#d8dff2', fontSize: '0.95rem', marginTop: '0.25rem' }}>{option.description}</div>
                    </div>
                  </div>
                  {option.disabled && <span style={{ fontSize: '0.85rem', color: '#8f9cc7' }}>Coming Soon</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedChain && account && (        <section>
          <div className="card card-glass">
            {/* Chat Assistant */}
            <div style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#d9e9ff' }}>AI Assistant</strong>
                <div>
                  <button className="button-secondary" onClick={() => setChatOpen(!chatOpen)}>{chatOpen ? 'Minimize' : 'Expand'}</button>
                </div>
              </div>
              {chatOpen && (
                <div>
                  <div style={{ maxHeight: 180, overflowY: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    {messages.map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: m.role === 'assistant' ? 'flex-start' : 'flex-end', marginTop: 8 }}>
                        <div style={{ maxWidth: '82%', padding: '0.5rem 0.75rem', borderRadius: 12, background: m.role === 'assistant' ? 'rgba(135,81,255,0.14)' : 'rgba(255,255,255,0.06)', color: '#fff' }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: 6 }}>
                        💡 Describe your contract in plain English
                      </p>
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendChat(chatInput); }}
                        placeholder="✨ Try: 'Deploy a token named AGGG with supply 1,000,000' or click a suggestion above..."
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <button className="button" onClick={() => sendChat(chatInput)} disabled={chatLoading}>{chatLoading ? 'Thinking…' : 'Send'}</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {['solidity', 'abi'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className="button-secondary"
                  style={{ opacity: selectedTab === tab ? 1 : 0.7 }}
                >
                  {tab === 'solidity' ? 'Solidity' : 'ABI + Bytecode'}
                </button>
              ))}
            </div>

            {selectedTab === 'solidity' ? (
              <div>
                <label className="label">Solidity contract</label>
                <textarea
                  ref={editorRef}
                  className="textarea"
                  value={solidity}
                  onChange={(e) => setSolidity(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">ABI</label>
                  <textarea
                    ref={editorRef}
                    className="textarea"
                    value={abi}
                    onChange={(e) => setAbi(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Bytecode</label>
                  <textarea
                    className="textarea"
                    value={bytecode}
                    onChange={(e) => setBytecode(e.target.value)}
                  />
                </div>
              </>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              {showPasteContract && (
                <button className="button" style={{ width: '100%' }} onClick={focusEditor}>Paste Your Contract →</button>
              )}
              {showAnalyzeContract && (
                <button className="button" style={{ width: '100%' }} onClick={handleReview}>Analyze Contract →</button>
              )}
              {showLaunchContract && (
                <button className="button" style={{ width: '100%' }} onClick={handleLaunch}>Launch Contract →</button>
              )}
              {showLaunching && (
                <button className="button" style={{ width: '100%' }} disabled>Launching...</button>
              )}
              {showViewExplorer && (
                <a
                  className="button"
                  style={{ width: '100%', display: 'inline-flex', justifyContent: 'center' }}
                  href={`${selectedChain.explorer}/address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Explorer →
                </a>
              )}
            </div>

            {reviewError && <p style={{ color: '#ffb3a7', marginTop: '1rem' }}>{reviewError}</p>}
            {review && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>AI Review</h3>
                <div className="card card-glass" style={{ background: 'rgba(255,255,255,0.12)' }}>{review}</div>
              </div>
            )}

            {deployError && <p style={{ color: '#ffb3a7', marginTop: '1rem' }}>{deployError}</p>}
            {contractAddress && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Contract address</h3>
                <p>{contractAddress}</p>
              </div>
            )}
          </div>
        </section>
      )}
      <style jsx>{`
        .wallet-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }
        .wallet-modal {
          width: min(580px, 100%);
          background: #0e0e1a;
          border: 1px solid rgba(155, 127, 255, 0.3);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
        }
        .wallet-modal-row {
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .wallet-modal-row:hover {
          box-shadow: 0 0 0 1px rgba(155, 127, 255, 0.35), 0 18px 45px rgba(125, 90, 255, 0.16);
          transform: translateY(-1px);
        }
      `}</style>
    </main>
    </ClientErrorBoundary>
  );
}

export default dynamic(() => Promise.resolve(GlassAppComponent), { ssr: false });
