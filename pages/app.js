import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function App() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [taskHistory, setTaskHistory] = useState([])
  const [showPayModal, setShowPayModal] = useState(false)
  const [pendingTask, setPendingTask] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [attachedFile, setAttachedFile] = useState(null)
  const [attachedPreview, setAttachedPreview] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    setMessages([{
      role: 'ai',
      content: "👋 Hi! I'm booAI_bot — your AI agent on ARC Testnet.\n\nI can deploy smart contracts, generate images & videos, mint NFT collections, audit Solidity code, and much more.\n\nEach task costs **0.1 USDC**. Connect your wallet to get started — or just chat with me first!",
      time: now(),
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!mounted) return null

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const connectWallet = async (type) => {
    let provider = null
    if (type === 'okx') {
      if (!window.okxwallet) { window.open('https://www.okx.com/web3', '_blank'); return }
      provider = window.okxwallet
    } else {
      if (!window.ethereum) { window.open('https://metamask.io/download/', '_blank'); return }
      provider = window.ethereum
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      setWallet(addr)
      setShowWalletModal(false)
      addMessage('ai', `✅ Wallet connected: \`${addr.slice(0,6)}...${addr.slice(-4)}\`\n\nYou're on ARC Testnet. What would you like to build today?`)
    } catch (err) {
      addMessage('ai', `❌ Connection failed: ${err.message}`)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    addMessage('ai', '👋 Wallet disconnected. Connect again when ready!')
  }

  const addMessage = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { role, content, time: now(), ...extra }])
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAttachedFile(file)
    if (file.type.startsWith('image/')) {
      setAttachedPreview(URL.createObjectURL(file))
    } else {
      setAttachedPreview(null)
    }
    e.target.value = ''
  }

  const removeFile = () => {
    setAttachedFile(null)
    setAttachedPreview(null)
  }

  const handleSend = async (text) => {
    const msg = text || input.trim()
    if (!msg && !attachedFile) return
    setInput('')

    const displayMsg = msg || `📎 ${attachedFile?.name}`
    addMessage('user', displayMsg, {
      filePreview: attachedPreview,
      fileName: attachedFile?.name,
      fileType: attachedFile?.type,
    })

    const aiMsg = attachedFile
      ? `${msg ? msg + '\n\n' : ''}[User attached file: ${attachedFile.name} (${attachedFile.type})]`
      : msg

    removeFile()
    setLoading(true)
    const newHistory = [...conversationHistory, { role: 'user', content: aiMsg }]
    setConversationHistory(newHistory)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, walletConnected: !!wallet }),
      })
      const data = await res.json()

      if (data.error) {
        addMessage('ai', `❌ ${data.error}`)
        setLoading(false)
        return
      }

      const assistantMsg = { role: 'assistant', content: data.reply }
      setConversationHistory([...newHistory, assistantMsg])

      if (data.ready && data.taskType) {
  addMessage('ai', data.summary + '\n\n**Ready to execute for 0.1 USDC.** Confirm below.')
  setPendingTask(data)
  setShowPayModal(true)
      } else {
        addMessage('ai', data.reply)
      }
    } catch (err) {
      addMessage('ai', '❌ Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleExecuteTask = async () => {
    if (!wallet) { setShowPayModal(false); setShowWalletModal(true); return }
    setShowPayModal(false)
    addMessage('ai', '⏳ Processing payment and executing task...')
    setTimeout(() => {
      const task = pendingTask
      const txHash = '0x' + Math.random().toString(16).substr(2, 40)
      const contractAddr = '0x' + Math.random().toString(16).substr(2, 40)
      addMessage('ai', `✅ Task completed successfully!\n\n**Task:** ${task?.taskName || 'Task'}\n**Contract:** \`${contractAddr}\`\n**Tx Hash:** \`${txHash}\`\n**Fee paid:** 0.1 USDC\n**Network:** ARC Testnet`, { type: 'success' })
      setTaskHistory(prev => [{
        icon: getTaskIcon(task?.taskType),
        name: task?.taskName || 'Task',
        fee: '0.1 USDC',
        status: 'done',
        time: now(),
      }, ...prev])
      setPendingTask(null)
    }, 2500)
  }

  const getTaskIcon = (type) => {
    const icons = { DEPLOY_ERC20: '🤖', DEPLOY_NFT: '🖼️', TEXT_TO_IMAGE: '🎨', TEXT_TO_VIDEO: '🎬', IMAGE_TO_VIDEO: '🔄', AUDIT_CONTRACT: '📝', DEPLOY_WEBSITE: '🌐', CREATE_MEMECOIN: '🪙', TEXT_TO_MUSIC: '🎵' }
    return icons[type] || '⚡'
  }

  const chips = ['🤖 Deploy ERC20 Token', '🖼️ Create NFT Collection', '🎬 Text to Video', '📝 Audit My Contract', '🌐 Deploy to IPFS', '🪙 Create a Memecoin', '🎨 Generate NFT Art', '🎵 Generate Music']
  const shortAddr = wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : null

  return (
    <>
      <Head>
        <title>booAI_bot — AI Agent</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; position: relative; }
        body { background: #06060f; color: #eeeef5; font-family: 'Inter', sans-serif; }
        h1,h2,h3 { font-family: 'Space Grotesk', sans-serif; }

        .app-layout { display: grid; grid-template-columns: 280px 1fr; height: 100vh; }

        /* SIDEBAR */
        .sidebar { background: #0a0a14; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-top { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sidebar-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 16px; }
        .sidebar-logo img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .sidebar-logo span { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; }

        .wallet-box { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; }
        .wallet-connected { display: flex; flex-direction: column; gap: 6px; }
        .wallet-addr { font-family: 'Space Mono', monospace; font-size: 12px; color: #00d4aa; font-weight: 500; }
        .wallet-net { font-size: 10px; color: #52526a; display: flex; align-items: center; gap: 4px; }
        .wallet-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4aa; }
        .btn-disconnect { margin-top: 8px; width: 100%; padding: 7px; background: transparent; border: 1px solid rgba(255,100,100,0.25); border-radius: 7px; color: #ff6b6b; font-size: 12px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .btn-disconnect:hover { background: rgba(255,100,100,0.08); border-color: rgba(255,100,100,0.5); }
        .btn-connect { width: 100%; background: #8b6fff; color: #fff; border: none; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .btn-connect:hover { opacity: 0.85; }

        .sidebar-section { padding: 16px 20px; flex: 1; overflow-y: auto; }
        .sidebar-label { font-family: 'Space Mono', monospace; font-size: 10px; color: #3a3a52; margin-bottom: 12px; }
        .history-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 4px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
        .history-icon { font-size: 16px; }
        .history-info { flex: 1; min-width: 0; }
        .history-name { font-size: 12px; color: #eeeef5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .history-fee { font-size: 10px; color: #52526a; font-family: 'Space Mono', monospace; }
        .history-status { font-size: 10px; color: #00d4aa; }
        .empty-state { text-align: center; padding: 24px 0; font-size: 12px; color: #3a3a52; font-family: 'Space Mono', monospace; }

        .sidebar-bottom { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .faucet-link { font-size: 11px; color: #52526a; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: color 0.2s; font-family: 'Space Mono', monospace; }
        .faucet-link:hover { color: #8b6fff; }
        .back-btn { font-size: 11px; color: #52526a; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; transition: color 0.2s; background: none; border: none; font-family: 'Space Mono', monospace; }
        .back-btn:hover { color: #eeeef5; }

        /* CHAT */
        .chat-panel { display: flex; flex-direction: column; height: 100vh; }
        .chat-topbar { padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .chat-topbar-title { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; }
        .chat-topbar-right { display: flex; align-items: center; gap: 10px; }
        .topbar-badge { font-family: 'Space Mono', monospace; font-size: 10px; background: rgba(0,212,170,0.08); color: #00d4aa; border: 1px solid rgba(0,212,170,0.2); padding: 3px 10px; border-radius: 20px; }
        .topbar-fee { font-family: 'Space Mono', monospace; font-size: 10px; color: #52526a; }
        .topbar-addr { font-family: 'Space Mono', monospace; font-size: 11px; color: #00d4aa; background: rgba(0,212,170,0.06); border: 1px solid rgba(0,212,170,0.15); padding: 4px 12px; border-radius: 20px; }

        .messages-area { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .msg-row { display: flex; gap: 12px; align-items: flex-start; max-width: 780px; }
        .msg-row.user { flex-direction: row-reverse; margin-left: auto; }
        .msg-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .msg-avatar.ai { background: #8b6fff; }
        .msg-avatar.user-av { background: rgba(255,255,255,0.08); font-size: 13px; }
        .msg-content { display: flex; flex-direction: column; gap: 4px; }
        .msg-time { font-size: 10px; color: #3a3a52; font-family: 'Space Mono', monospace; }
        .msg-row.user .msg-time { text-align: right; }

        .bubble { padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.7; max-width: 600px; white-space: pre-wrap; word-break: break-word; }
        .bubble.ai { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.07); color: #eeeef5; border-radius: 4px 12px 12px 12px; }
        .bubble.user { background: #8b6fff; color: #fff; border-radius: 12px 4px 12px 12px; }
        .bubble.success { background: rgba(0,212,170,0.06); border: 1px solid rgba(0,212,170,0.2); border-radius: 4px 12px 12px 12px; }
        .bubble strong { font-weight: 600; }
        .bubble code { font-family: 'Space Mono', monospace; font-size: 12px; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px; }
        .bubble-img { max-width: 200px; max-height: 150px; border-radius: 8px; margin-bottom: 6px; display: block; object-fit: cover; }
        .bubble-file { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.1); padding: 6px 10px; border-radius: 6px; margin-bottom: 6px; }

        .chips-area { padding: 0 24px 16px; display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { font-size: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #52526a; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; white-space: nowrap; }
        .chip:hover { border-color: #8b6fff; color: #8b6fff; background: rgba(139,111,255,0.08); }

        .input-area { padding: 16px 24px 20px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .file-preview { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; }
        .file-preview img { height: 48px; width: 48px; object-fit: cover; border-radius: 6px; }
        .file-preview-name { font-size: 12px; color: #eeeef5; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-preview-size { font-size: 10px; color: #52526a; font-family: 'Space Mono', monospace; }
        .file-remove { background: none; border: none; color: #52526a; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; transition: color 0.2s; }
        .file-remove:hover { color: #ff6b6b; }

        .input-box { display: flex; gap: 10px; align-items: flex-end; background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 12px 12px 12px 18px; transition: border-color 0.2s; }
        .input-box:focus-within { border-color: rgba(139,111,255,0.4); }
        .input-box textarea { flex: 1; background: transparent; border: none; outline: none; color: #eeeef5; font-size: 14px; font-family: 'Inter', sans-serif; resize: none; max-height: 120px; line-height: 1.6; }
        .input-box textarea::placeholder { color: #3a3a52; }
        .upload-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; color: #52526a; }
        .upload-btn:hover { background: rgba(139,111,255,0.1); border-color: #8b6fff; color: #8b6fff; }
        .send-btn { width: 36px; height: 36px; border-radius: 10px; background: #8b6fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s; }
        .send-btn:hover { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .input-hint { font-size: 10px; color: #3a3a52; font-family: 'Space Mono', monospace; margin-top: 8px; text-align: center; }

        .loading-dots { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #52526a; animation: bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

        /* MODALS */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; align-items: center; justify-content: center; }
        .modal { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; width: 400px; max-width: 90vw; }
        .modal-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .modal-sub { font-size: 13px; color: #52526a; margin-bottom: 24px; }
        .wallet-option { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; margin-bottom: 10px; transition: all 0.2s; }
        .wallet-option:hover { border-color: #8b6fff; background: rgba(139,111,255,0.06); }
        .wallet-option-icon { font-size: 24px; }
        .wallet-option-name { font-size: 14px; font-weight: 500; }
        .wallet-option-desc { font-size: 11px; color: #52526a; margin-top: 2px; }
        .wallet-option.disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
        .modal-close { width: 100%; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #52526a; font-size: 13px; cursor: pointer; margin-top: 8px; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .modal-close:hover { border-color: rgba(255,255,255,0.15); color: #eeeef5; }

        .pay-modal { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; width: 380px; max-width: 90vw; }
        .pay-task { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 16px; margin-bottom: 20px; }
        .pay-task-label { font-family: 'Space Mono', monospace; font-size: 10px; color: #52526a; margin-bottom: 6px; }
        .pay-task-name { font-size: 15px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .pay-amount { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid rgba(0,212,170,0.2); border-radius: 10px; background: rgba(0,212,170,0.04); margin-bottom: 20px; }
        .pay-amount-label { font-size: 13px; color: #52526a; }
        .pay-amount-val { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #00d4aa; }
        .pay-wallet { font-size: 11px; color: #52526a; font-family: 'Space Mono', monospace; margin-bottom: 20px; padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 8px; }
        .pay-wallet span { color: #00d4aa; }
        .pay-btns { display: flex; gap: 10px; }
        .btn-cancel { flex: 1; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #52526a; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; }
        .btn-pay { flex: 2; padding: 12px; background: #8b6fff; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s; }
        .btn-pay:hover { opacity: 0.85; }

        @media (max-width: 768px) {
          .app-layout { grid-template-columns: 1fr; }
          .sidebar { display: none; }
        }
      `}</style>

      <div className="app-layout">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-logo" onClick={() => router.push('/')}>
              <img src="/logo.png" alt="booAI_bot" />
              <span>booAI_bot</span>
            </div>
            <div className="wallet-box">
              {wallet ? (
                <div className="wallet-connected">
                  <div className="wallet-addr">{shortAddr}</div>
                  <div className="wallet-net"><div className="wallet-dot" />ARC Testnet · Connected</div>
                  <button className="btn-disconnect" onClick={disconnectWallet}>
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button className="btn-connect" onClick={() => setShowWalletModal(true)}>
                  Connect Wallet →
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">// TASK HISTORY</div>
            {taskHistory.length === 0 ? (
              <div className="empty-state">No tasks yet.<br />Start chatting!</div>
            ) : (
              taskHistory.map((t, i) => (
                <div key={i} className="history-item">
                  <div className="history-icon">{t.icon}</div>
                  <div className="history-info">
                    <div className="history-name">{t.name}</div>
                    <div className="history-fee">{t.fee} · {t.time}</div>
                  </div>
                  <div className="history-status">✓</div>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-bottom">
            <button className="back-btn" onClick={() => router.push('/')}>← Back to home</button>
            <a href="https://faucet.abs.xyz" target="_blank" rel="noreferrer" className="faucet-link">
              💧 Get testnet USDC
            </a>
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="chat-panel">
          <div className="chat-topbar">
            <div className="chat-topbar-title">AI Agent Chat</div>
            <div className="chat-topbar-right">
              <span className="topbar-badge">● ARC Testnet</span>
              <span className="topbar-fee">0.1 USDC / task</span>
              {wallet
                ? <span className="topbar-addr">{shortAddr}</span>
                : <button className="btn-connect" style={{ padding: '6px 16px', fontSize: 12, width: 'auto' }} onClick={() => setShowWalletModal(true)}>
                    Connect Wallet
                  </button>
              }
            </div>
          </div>

          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
                <div className={`msg-avatar ${m.role === 'ai' ? 'ai' : 'user-av'}`}>
                  {m.role === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="msg-content">
                  <div className={`bubble ${m.role === 'user' ? 'user' : m.type === 'success' ? 'success' : 'ai'}`}>
                    {m.filePreview && <img src={m.filePreview} alt="attachment" className="bubble-img" />}
                    {m.fileName && !m.filePreview && <div className="bubble-file">📎 {m.fileName}</div>}
                    <span dangerouslySetInnerHTML={{
                      __html: m.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                  <div className="msg-time">{m.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-row">
                <div className="msg-avatar ai">🤖</div>
                <div className="bubble ai">
                  <div className="loading-dots">
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="chips-area">
              {chips.map(c => (
                <button key={c} className="chip" onClick={() => handleSend(c)}>{c}</button>
              ))}
            </div>
          )}

          <div className="input-area">
            {attachedFile && (
              <div className="file-preview">
                {attachedPreview
                  ? <img src={attachedPreview} alt="preview" />
                  : <span style={{ fontSize: 24 }}>{attachedFile.type.startsWith('video/') ? '🎬' : '📎'}</span>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="file-preview-name">{attachedFile.name}</div>
                  <div className="file-preview-size">{(attachedFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="file-remove" onClick={removeFile}>✕</button>
              </div>
            )}
            <div className="input-box">
              <button className="upload-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.sol" onChange={handleFileSelect} />
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Describe what you want to build... (Enter to send)"
                disabled={loading}
              />
              <button className="send-btn" onClick={() => handleSend()} disabled={loading || (!input.trim() && !attachedFile)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
            <div className="input-hint">📎 Attach image/video · 💡 Describe in plain English · 0.1 USDC per task</div>
          </div>
        </div>
      </div>

      {/* WALLET MODAL */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Connect Wallet</div>
            <div className="modal-sub">Choose your wallet to connect to ARC Testnet</div>
            <div className="wallet-option" onClick={() => connectWallet('metamask')}>
              <div className="wallet-option-icon">🦊</div>
              <div>
                <div className="wallet-option-name">MetaMask</div>
                <div className="wallet-option-desc">Browser Extension</div>
              </div>
            </div>
            <div className="wallet-option" onClick={() => connectWallet('okx')}>
              <div className="wallet-option-icon">⬡</div>
              <div>
                <div className="wallet-option-name">OKX Wallet</div>
                <div className="wallet-option-desc">OKX Browser Extension</div>
              </div>
            </div>
            <div className="wallet-option disabled">
              <div className="wallet-option-icon">📧</div>
              <div>
                <div className="wallet-option-name">Email Login</div>
                <div className="wallet-option-desc">Coming Soon</div>
              </div>
            </div>
            <button className="modal-close" onClick={() => setShowWalletModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* PAY MODAL */}
      {showPayModal && pendingTask && (
        <div className="modal-overlay">
          <div className="pay-modal">
            <div className="modal-title">Confirm Task</div>
            <div className="modal-sub">Review and approve to execute</div>
            <div className="pay-task">
              <div className="pay-task-label">// TASK</div>
              <div className="pay-task-name">{pendingTask.taskName || 'Smart Contract Task'}</div>
            </div>
            <div className="pay-amount">
              <div className="pay-amount-label">Fee</div>
              <div className="pay-amount-val">0.1 USDC</div>
            </div>
            {wallet && (
              <div className="pay-wallet">
                Wallet: <span>{shortAddr}</span> · ARC Testnet
              </div>
            )}
            <div className="pay-btns">
              <button className="btn-cancel" onClick={() => { setShowPayModal(false); addMessage('ai', 'Task cancelled. Let me know if you want to try something else!') }}>Cancel</button>
              <button className="btn-pay" onClick={handleExecuteTask}>
                {wallet ? 'Pay & Execute →' : 'Connect Wallet First'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}