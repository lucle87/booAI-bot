import { useState, useRef } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { useDeploy } from '../../hooks/useDeploy';
import { CHAINS } from '../../lib/config';

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

export default function DarkApp() {
  const { account, chainId, error, connectMetaMask, switchToAbstract } = useWallet();
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

  const selectedChain = selectedChainKey ? CHAINS[selectedChainKey] : null;
  const isSelectedChainLive = selectedChain?.status === 'live';
  const isSelectedChainConnected = selectedChainKey === 'abstractTestnet' && chainId === '0x1498b';
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
    await deployContract({ signer: provider ? provider.getSigner() : null, abi, bytecode });
  };

  const provider = typeof window !== 'undefined' && window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(162, 76, 255, 0.16), transparent 28%), linear-gradient(180deg, #09070d 0%, #040205 100%)', color: '#f6f6ff' }}>
      <header className="header">
        <div>
          <div className="brand">booAI_bot</div>
          {selectedChain && <p style={{ margin: '0.5rem 0 0', color: '#b8c0e4' }}>Selected network: {selectedChain.name}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/picker" className="button-secondary">Choose style</Link>
          <Link href="/" className="button-secondary">Home</Link>
        </div>
      </header>

      <section>
        <div className="header" style={{ justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 className="title">Dark Cyber</h1>
            <p className="subtitle">A focused interface for network selection, wallet connection, AI review, and deployment.</p>
          </div>
        </div>

        <div className="card card-dark" style={{ marginTop: '1.5rem' }}>
          <h2 className="section-title">Select Network</h2>
          <p className="section-text">Choose Abstract Testnet to deploy now. Other networks are coming soon.</p>
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
                    border: active ? '1px solid #8857ff' : '1px solid rgba(255,255,255,0.08)',
                    background: active ? 'rgba(135, 81, 255, 0.18)' : 'rgba(19, 17, 35, 0.82)',
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
                  <span className="tag" style={{ background: chain.status === 'live' ? '#2bad6f' : 'rgba(255,255,255,0.08)', color: chain.status === 'live' ? '#ecfff3' : '#cbd6ff' }}>
                    {chain.status === 'live' ? 'Live' : 'Coming Soon'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedChain && (
          <div className="card card-dark" style={{ marginTop: '1.5rem' }}>
            <p className="tag">Account: {account || 'not connected'}</p>
            <p className="tag">Network: {chainId || 'unknown'}{isSelectedChainConnected ? ` (${selectedChain.name})` : ''}</p>
            {!account && isSelectedChainLive && (
              <button className="button" style={{ width: '100%' }} onClick={connectMetaMask}>Connect Wallet →</button>
            )}
            {account && !isSelectedChainConnected && selectedChainKey === 'abstractTestnet' && (
              <button className="button-secondary" style={{ width: '100%' }} onClick={switchToAbstract}>Switch to {selectedChain.name}</button>
            )}
            {account && isSelectedChainConnected && (
              <p style={{ color: '#b8c0e4', marginTop: '1rem' }}>Wallet connected to {selectedChain.name}.</p>
            )}
            {error && <p style={{ color: '#ff8da1', marginTop: '1rem' }}>{error}</p>}
          </div>
        )}
      </section>

      {selectedChain && account && (
        <section>
          <div className="card card-dark">
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

            {reviewError && <p style={{ color: '#ff8da1', marginTop: '1rem' }}>{reviewError}</p>}
            {review && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>AI Review</h3>
                <div className="card" style={{ background: 'rgba(15, 12, 30, 0.95)' }}>{review}</div>
              </div>
            )}

            {deployError && <p style={{ color: '#ff8da1', marginTop: '1rem' }}>{deployError}</p>}
            {contractAddress && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Contract address</h3>
                <p>{contractAddress}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
