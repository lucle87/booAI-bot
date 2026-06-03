import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';
import { ABSTRACT_TESTNET } from '../lib/config';

const defaultContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BooAIAgent {
  string public greeting = "Hello ARC Testnet";

  function ping() external pure returns (string memory) {
    return "booAI_bot is ready";
  }
}`;

const taskOptions = [
  { value: 'audit', label: 'Audit contract' },
  { value: 'summarize', label: 'Summarize code' },
  { value: 'optimize', label: 'Optimize & explain' },
  { value: 'generate', label: 'Generate ARC token' },
];

export default function AppPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [contractCode, setContractCode] = useState(defaultContract);
  const [selectedTask, setSelectedTask] = useState(taskOptions[0].value);
  const [agentResult, setAgentResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { account, chainId, error, connectMetaMask, connectOkxWallet, switchToAbstract } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const expectedChainId = `0x${ABSTRACT_TESTNET.chainId.toString(16)}`;
  const isCorrectNetwork = Boolean(chainId && chainId.toLowerCase() === expectedChainId.toLowerCase());
  const networkLabel = chainId ? `Connected network: ${isCorrectNetwork ? 'ARC Testnet' : chainId}` : 'No network detected';
  const walletLabel = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'No wallet connected';

  const handleAgentTask = async () => {
    setLoading(true);
    setAgentResult(null);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: selectedTask,
          contractCode,
        }),
      });

      const data = await response.json();
      setAgentResult(data);
    } catch (err) {
      setAgentResult({ error: 'Agent request failed.' });
    }

    setLoading(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>booAI_bot — ARC Testnet AI Agent</title>
        <meta
          name="description"
          content="booAI_bot is an AI Agent platform for ARC Testnet smart contract review, generation, and deployment guidance."
        />
      </Head>

      <main>
        <header className="header">
          <div>
            <div className="brand">booAI_bot</div>
            <p className="subtitle">AI Agent platform for ARC Testnet contracts, audit guidance, and wallet-safe workflows.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="button-secondary" onClick={() => router.push('/')}>Home</button>
          </div>
        </header>

        <section>
          <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h1 className="title">Agent-first ARC Testnet Studio</h1>
              <p className="subtitle">
                Connect a browser wallet, inspect or generate Solidity, and let the ARC Agent provide audits,
                summaries, and optimized contract guidance.
              </p>

              <div className="list-card">
                <div>
                  <p className="label">Wallet</p>
                  <p>{walletLabel}</p>
                </div>
                <div>
                  <p className="label">Network</p>
                  <p>{networkLabel}</p>
                </div>
                <div>
                  <p className="label">Status</p>
                  <p>{error || (account ? 'Connected' : 'Disconnected')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button type="button" className="button" onClick={connectMetaMask}>Connect MetaMask</button>
                <button type="button" className="button-secondary" onClick={connectOkxWallet}>Connect OKX Wallet</button>
                {!isCorrectNetwork && <button type="button" className="button-secondary" onClick={switchToAbstract}>Switch to ARC Testnet</button>}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Agent Actions</h2>
              <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                {taskOptions.map((task) => (
                  <button
                    key={task.value}
                    type="button"
                    className={selectedTask === task.value ? 'button' : 'button-secondary'}
                    onClick={() => setSelectedTask(task.value)}
                  >
                    {task.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="button"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={handleAgentTask}
                disabled={loading}
              >
                {loading ? 'Running agent…' : 'Run agent task'}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="grid" style={{ gridTemplateColumns: '1fr 0.85fr', gap: '1.5rem' }}>
            <div className="card">
              <h2 className="section-title">Solidity contract</h2>
              <p className="section-text">Edit or paste your ARC Testnet contract and ask the AI agent to analyze it.</p>
              <textarea
                className="textarea"
                value={contractCode}
                onChange={(event) => setContractCode(event.target.value)}
              />
            </div>

            <div className="card">
              <h2 className="section-title">Agent output</h2>
              <p className="section-text">The AI agent responds with review notes, contract summaries, and code suggestions.</p>
              <div className="card" style={{ padding: '1rem', minHeight: '320px', overflow: 'auto', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)' }}>
                {agentResult ? (
                  <pre style={{ margin: 0, color: '#e8edf7' }}>
                    {agentResult.error || agentResult.response || JSON.stringify(agentResult, null, 2)}
                  </pre>
                ) : (
                  <p style={{ margin: 0, color: '#c6c9e7' }}>Select a task and run the AI agent to see results.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>booAI_bot — ARC Testnet AI Agent Platform</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="tag">ARC Testnet</span>
            <span className="tag">Anthropic Claude</span>
            <span className="tag">Wallet-safe</span>
          </div>
        </footer>
      </main>
    </>
  );
}
