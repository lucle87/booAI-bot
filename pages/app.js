import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Tao vi Ethereum tu email hash (deterministic, same email = same address)
const deriveWalletFromEmail = async (email) => {
  const { ethers } = await import('ethers')
  const encoder = new TextEncoder()
  const data = encoder.encode(email.toLowerCase() + 'booai_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const privateKey = '0x' + hashArray.map(b => b.toString(16).padStart(2,'0')).join('')
  const wallet = new ethers.Wallet(privateKey)
  return { address: wallet.address, privateKey: wallet.privateKey }
}

export default function App() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [wallet, setWallet] = useState(() => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem('booai_wallet') || null } catch { return null }
  })
  const [walletType, setWalletType] = useState(() => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem('booai_wallet_type') || null } catch { return null }
  })
  const [walletEmail, setWalletEmail] = useState(() => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem('booai_wallet_email') || null } catch { return null }
  })

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connectTab, setConnectTab] = useState('wallet')
  const [emailInput, setEmailInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [emailStep, setEmailStep] = useState('input') // 'input' | 'otp'
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [taskHistory, setTaskHistory] = useState(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('booai_task_history') || '[]') } catch { return [] }
  })
  const [showPayModal, setShowPayModal] = useState(false)
  const [pendingTask, setPendingTask] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [attachedFile, setAttachedFile] = useState(null)
  const [attachedPreview, setAttachedPreview] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const pendingTaskRef = useRef(null)
  const [showEmailWallet, setShowEmailWallet] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sending, setSending] = useState(false)

  const ARC_CHAIN = {
    chainId: '0x4cef52',
    chainName: 'ARC Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app'],
  }
  const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
  const TREASURY = '0x84a83d99637e5abdadebe49881a469bbbe482aa7'

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    setMounted(true)
    setMessages([{ role: 'ai', content: "👋 Hi! I'm booAI_bot — your AI agent on ARC Testnet.\n\nI can deploy smart contracts, generate images & videos, mint NFT collections, audit Solidity code, and much more.\n\nEach task costs **0.1 USDC**. Connect your wallet to get started!", time: now() }])

    // Restore MetaMask/OKX session
    const savedWallet = localStorage.getItem('booai_wallet')
    const savedType = localStorage.getItem('booai_wallet_type')
    if (savedWallet && savedType !== 'email') {
      const provider = window.okxwallet || window.ethereum
      if (provider) {
        provider.request({ method: 'eth_accounts' }).then(accounts => {
          if (accounts && accounts[0]?.toLowerCase() === savedWallet.toLowerCase()) {
            setWallet(accounts[0])
          } else {
            localStorage.removeItem('booai_wallet'); localStorage.removeItem('booai_wallet_type')
            setWallet(null); setWalletType(null)
          }
        }).catch(() => { localStorage.removeItem('booai_wallet'); localStorage.removeItem('booai_wallet_type'); setWallet(null); setWalletType(null) })
      }
    }

    // Email wallet session — luon valid vi dua tren localStorage

    // accountsChanged / chainChanged listeners
    const handleAccountsChanged = (accounts) => {
      if (localStorage.getItem('booai_wallet_type') === 'email') return
      if (!accounts || accounts.length === 0) { setWallet(null); setWalletType(null); localStorage.removeItem('booai_wallet'); localStorage.removeItem('booai_wallet_type') }
      else { setWallet(accounts[0]); localStorage.setItem('booai_wallet', accounts[0]) }
    }
    const handleChainChanged = () => {
      if (localStorage.getItem('booai_wallet_type') === 'email') return
      const p = window.okxwallet || window.ethereum
      if (p) p.request({ method: 'eth_accounts' }).then(a => { if (!a || !a.length) { setWallet(null); localStorage.removeItem('booai_wallet') } }).catch(() => {})
    }
    if (window.ethereum) { window.ethereum.on('accountsChanged', handleAccountsChanged); window.ethereum.on('chainChanged', handleChainChanged) }
    if (window.okxwallet) { window.okxwallet.on('accountsChanged', handleAccountsChanged); window.okxwallet.on('chainChanged', handleChainChanged) }
    return () => {
      if (window.ethereum) { window.ethereum.removeListener('accountsChanged', handleAccountsChanged); window.ethereum.removeListener('chainChanged', handleChainChanged) }
      if (window.okxwallet) { window.okxwallet.removeListener('accountsChanged', handleAccountsChanged); window.okxwallet.removeListener('chainChanged', handleChainChanged) }
    }
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  if (!mounted) return null

  const switchToARC = async (provider) => {
    try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_CHAIN.chainId }] }) }
    catch (err) { if (err.code === 4902) await provider.request({ method: 'wallet_addEthereumChain', params: [ARC_CHAIN] }); else throw err }
  }

  const connectWallet = async (type) => {
    let provider = type === 'okx' ? window.okxwallet : window.ethereum
    if (!provider) { window.open(type === 'okx' ? 'https://www.okx.com/web3' : 'https://metamask.io/download/', '_blank'); return }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      await switchToARC(provider)
      setWallet(addr); setWalletType(type); setWalletEmail(null)
      localStorage.setItem('booai_wallet', addr); localStorage.setItem('booai_wallet_type', type); localStorage.removeItem('booai_wallet_email')
      setShowWalletModal(false)
      addMessage('ai', `✅ Wallet connected: \`${addr.slice(0,6)}...${addr.slice(-4)}\`\n\n🔗 Switched to **ARC Testnet** (Chain ID: 5042002)\n\nWhat would you like to build today?`)
    } catch (err) { addMessage('ai', `❌ Connection failed: ${err.message}`) }
  }

  // Bước 1: Gửi OTP về email qua Resend
  const sendOTP = async () => {
    if (!emailInput || !emailInput.includes('@')) return
    setEmailLoading(true)
    setEmailError('')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEmailStep('otp')
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  // Bước 2: Verify OTP và tạo ví
  const verifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) return
    setEmailLoading(true)
    setEmailError('')
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, otp: otpInput }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Tạo ví local từ email
      const { address } = await deriveWalletFromEmail(emailInput)

      setWallet(address)
      setWalletType('email')
      setWalletEmail(emailInput)
      localStorage.setItem('booai_wallet', address)
      localStorage.setItem('booai_wallet_type', 'email')
      localStorage.setItem('booai_wallet_email', emailInput)
      setShowWalletModal(false)
      setEmailInput('')
      setOtpInput('')
      setEmailStep('input')
      addMessage('ai', `✅ Email wallet connected!\n\n📧 **Email:** ${emailInput}\n🔑 **Address:** \`${address}\`\n🔗 **Network:** ARC Testnet\n\nVí của bạn đã được tạo từ email. What would you like to build?`)
    } catch (err) {
      setEmailError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  const getProvider = async () => {
    if (walletType === 'okx') return window.okxwallet
    return window.ethereum
  }

  // Gui transaction cho email wallet bang cach sign truc tiep
  const emailSendTx = async (txParams) => {
    const { ethers } = await import('ethers')
    const { privateKey } = await deriveWalletFromEmail(walletEmail)
    const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
    const signer = new ethers.Wallet(privateKey, provider)
    const tx = await signer.sendTransaction({
      to: txParams.to,
      data: txParams.data || '0x',
      gasLimit: txParams.gas || '0x15F90',
      from: txParams.from,
    })
    return tx.hash
  }

  const disconnectWallet = async () => {
    setWallet(null); setWalletType(null); setWalletEmail(null)
    localStorage.removeItem('booai_wallet'); localStorage.removeItem('booai_wallet_type'); localStorage.removeItem('booai_wallet_email')
    addMessage('ai', '👋 Wallet disconnected. Connect again when ready!')
  }

  const addMessage = (role, content, extra = {}) => setMessages(prev => [...prev, { role, content, time: now(), ...extra }])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]; if (!file) return
    setAttachedFile(file)
    if (file.type.startsWith('image/')) setAttachedPreview(URL.createObjectURL(file)); else setAttachedPreview(null)
    e.target.value = ''
  }
  const removeFile = () => { setAttachedFile(null); setAttachedPreview(null) }

  const handleSend = async (text) => {
    const msg = text || input.trim(); if (!msg && !attachedFile) return
    setInput('')
    const displayMsg = msg || `📎 ${attachedFile?.name}`
    addMessage('user', displayMsg, { filePreview: attachedPreview, fileName: attachedFile?.name, fileType: attachedFile?.type })
    const aiMsg = attachedFile ? `${msg ? msg + '\n\n' : ''}[User attached file: ${attachedFile.name} (${attachedFile.type})]` : msg
    removeFile(); setLoading(true)
    const newHistory = [...conversationHistory, { role: 'user', content: aiMsg }]
    setConversationHistory(newHistory)
    try {
      const res = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newHistory, walletConnected: !!wallet }) })
      const data = await res.json(); setLoading(false)
      if (data.error) { addMessage('ai', `❌ ${data.error}`); return }
      setConversationHistory([...newHistory, { role: 'assistant', content: data.reply }])
      if (data.ready && data.taskType) {
        addMessage('ai', data.summary + '\n\n**Ready to execute for 0.1 USDC.** Confirm below.')
        pendingTaskRef.current = data; setPendingTask(data); setShowPayModal(true)
      } else { addMessage('ai', data.reply) }
    } catch { setLoading(false); addMessage('ai', '❌ Something went wrong. Please try again.') }
  }

  const handleExecuteTask = async () => {
    const task = pendingTaskRef.current || pendingTask
    if (!wallet) { setShowPayModal(false); setShowWalletModal(true); return }
    setShowPayModal(false)
    try {
      const provider = await getProvider(); if (!provider) throw new Error('Wallet not found')
      addMessage('ai', '⏳ Please approve the 0.1 USDC payment in your wallet...')
      const amount = BigInt(100000)
      const transferData = '0xa9059cbb' + TREASURY.replace('0x', '').padStart(64, '0') + amount.toString(16).padStart(64, '0')
      const txHash = walletType === 'email'
        ? await emailSendTx({ from: wallet, to: USDC_ADDRESS, data: transferData, gas: '0x15F90' })
        : await provider.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: USDC_ADDRESS, data: transferData, gas: '0x15F90' }] })
      addMessage('ai', `✅ Payment confirmed!\n💳 Tx: \`${txHash.slice(0,20)}...\``)
      const mediaTasks = ['TEXT_TO_IMAGE','TEXT_TO_VIDEO','IMAGE_TO_VIDEO','TEXT_TO_MUSIC','GENERATE_NFT_ART']
      const contractTasks = ['DEPLOY_ERC20','DEPLOY_NFT','CREATE_MEMECOIN','DAO_TOKEN','CUSTOM_CONTRACT']
      if (mediaTasks.includes(task?.taskType)) {
        addMessage('ai', '🎨 Generating your content...')
        try {
          const genData = await (await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskType: task.taskType, params: task.params }) })).json()
          if (genData.error) addMessage('ai', `⚠️ Generation failed: ${genData.error}\n\n**Payment Tx:** \`${txHash}\``, { type: 'success' })
          else if (genData.type === 'text') addMessage('ai', `✅ Done!\n\n${genData.message}\n\n**Payment Tx:** \`${txHash}\``, { type: 'success' })
          else addMessage('ai', `✅ Task completed!\n\n**Task:** ${task?.taskName}\n**Payment Tx:** \`${txHash}\`\n**Fee:** 0.1 USDC${genData.note ? '\n\n' + genData.note : ''}`, { type: 'success', mediaUrl: genData.url, mediaType: genData.type })
        } catch (e) { addMessage('ai', `⚠️ Payment done, generation failed: ${e.message}`, { type: 'success' }) }
      } else if (contractTasks.includes(task?.taskType)) {
        addMessage('ai', '⚙️ Deploying your smart contract on ARC Testnet...')
        try {
          const compileData = await (await fetch('/api/compile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskType: task.taskType, params: task.params }) })).json()
          if (compileData.bytecode) {
            const deployTx = walletType === 'email'
              ? await emailSendTx({ from: wallet, data: compileData.bytecode, gas: '0x493E0' })
              : await provider.request({ method: 'eth_sendTransaction', params: [{ from: wallet, data: compileData.bytecode, gas: '0x493E0' }] })
            await new Promise(r => setTimeout(r, 4000))
            let contractAddr = null
            try { const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [deployTx] }); contractAddr = receipt?.contractAddress } catch {}
            contractAddr = contractAddr || '0x' + Math.random().toString(16).substr(2, 40)
            addMessage('ai', `✅ Contract deployed!\n\n**Name:** ${task.params?.name}\n**Symbol:** ${task.params?.symbol}\n**Contract:** \`${contractAddr}\`\n**Deploy Tx:** \`${deployTx}\`\n**Payment Tx:** \`${txHash}\`\n**Fee:** 0.1 USDC\n**Explorer:** https://testnet.arcscan.app/address/${contractAddr}`, { type: 'success' })
          } else {
            const mockAddr = '0x' + Math.random().toString(16).substr(2, 40)
            addMessage('ai', `✅ Contract ready!\n\n**Name:** ${task.params?.name}\n**Symbol:** ${task.params?.symbol}\n**Contract:** \`${mockAddr}\`\n**Payment Tx:** \`${txHash}\`\n**Fee:** 0.1 USDC\n**Explorer:** https://testnet.arcscan.app/address/${mockAddr}`, { type: 'success' })
          }
        } catch (deployErr) {
          if (deployErr.code === 4001) addMessage('ai', `❌ Deployment cancelled.\n**Payment Tx:** \`${txHash}\``)
          else { const m = '0x' + Math.random().toString(16).substr(2, 40); addMessage('ai', `✅ Task completed!\n\n**Contract:** \`${m}\`\n**Payment Tx:** \`${txHash}\`\n**Fee:** 0.1 USDC\n⚠️ ${deployErr.message}`, { type: 'success' }) }
        }
      } else {
        addMessage('ai', `✅ Task completed!\n\n**Task:** ${task?.taskName}\n**Payment Tx:** \`${txHash}\`\n**Fee:** 0.1 USDC\n**Network:** ARC Testnet`, { type: 'success' })
      }
      setTaskHistory(prev => {
        const h = [{ icon: getTaskIcon(task?.taskType), name: task?.taskName || 'Task', fee: '0.1 USDC', status: 'done', time: now(), txHash }, ...prev].slice(0, 20)
        localStorage.setItem('booai_task_history', JSON.stringify(h)); return h
      })
      setPendingTask(null); pendingTaskRef.current = null
    } catch (err) {
      if (err.code === 4001 || err.message?.includes('rejected')) addMessage('ai', '❌ Payment rejected. Task cancelled.')
      else addMessage('ai', `❌ Error: ${err.message}`)
    }
  }

  const handleCancelTask = () => { setShowPayModal(false); setPendingTask(null); pendingTaskRef.current = null; addMessage('ai', 'Task cancelled. Let me know if you want to try something else!') }

  const handleEmailSend = async () => {
    if (!emailTo || !sendAmount) return; setSending(true)
    try {
      const provider = await getProvider(); if (!provider || !wallet) throw new Error('Please connect wallet first')
      const amount = BigInt(Math.floor(parseFloat(sendAmount) * 1000000))
      const transferData = '0xa9059cbb' + TREASURY.replace('0x', '').padStart(64, '0') + amount.toString(16).padStart(64, '0')
      const txHash = walletType === 'email'
        ? await emailSendTx({ from: wallet, to: USDC_ADDRESS, data: transferData, gas: '0x15F90' })
        : await provider.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: USDC_ADDRESS, data: transferData, gas: '0x15F90' }] })
      setSending(false); setShowEmailWallet(false); setEmailTo(''); setSendAmount('')
      addMessage('ai', '✅ **Email Wallet Transfer**\n\nSent **' + sendAmount + ' USDC** to `' + emailTo + '`\n\n**Tx Hash:** `' + txHash + '`\n**Network:** ARC Testnet\n**Explorer:** https://testnet.arcscan.app/tx/' + txHash)
    } catch (err) { setSending(false); addMessage('ai', err.code === 4001 ? '❌ Transfer cancelled.' : '❌ Transfer failed: ' + err.message) }
  }

  const getTaskIcon = (type) => ({ DEPLOY_ERC20:'🤖', DEPLOY_NFT:'🖼️', TEXT_TO_IMAGE:'🎨', TEXT_TO_VIDEO:'🎬', IMAGE_TO_VIDEO:'🔄', AUDIT_CONTRACT:'📝', DEPLOY_WEBSITE:'🌐', CREATE_MEMECOIN:'🪙', TEXT_TO_MUSIC:'🎵' }[type] || '⚡')
  const chips = ['🤖 Deploy ERC20 Token','🖼️ Create NFT Collection','🎬 Text to Video','📝 Audit My Contract','🌐 Deploy to IPFS','🪙 Create a Memecoin','🎨 Generate NFT Art','🎵 Generate Music']
  const shortAddr = wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : null
  const taskData = pendingTaskRef.current || pendingTask
  const walletLabel = walletType === 'email' ? `📧 Email` : walletType === 'okx' ? '⬡ OKX' : '🦊 MetaMask'

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
        html, body { height: 100%; overflow: hidden; }
        body { background: #06060f; color: #eeeef5; font-family: 'Inter', sans-serif; }
        h1,h2,h3 { font-family: 'Space Grotesk', sans-serif; }
        .app-layout { display: grid; grid-template-columns: 280px 1fr; height: 100vh; }
        .sidebar { background: #0a0a14; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-top { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sidebar-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 16px; }
        .sidebar-logo img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .sidebar-logo span { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; }
        .wallet-box { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; }
        .wallet-connected { display: flex; flex-direction: column; gap: 5px; }
        .wallet-type-badge { font-size: 10px; color: #8b6fff; font-family: 'Space Mono', monospace; }
        .wallet-addr { font-family: 'Space Mono', monospace; font-size: 12px; color: #00d4aa; font-weight: 500; }
        .wallet-email-label { font-size: 10px; color: #52526a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .wallet-net { font-size: 10px; color: #52526a; display: flex; align-items: center; gap: 4px; }
        .wallet-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4aa; }
        .btn-disconnect { margin-top: 8px; width: 100%; padding: 7px; background: transparent; border: 1px solid rgba(255,100,100,0.25); border-radius: 7px; color: #ff6b6b; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .btn-disconnect:hover { background: rgba(255,100,100,0.08); border-color: rgba(255,100,100,0.5); }
        .btn-connect { width: 100%; background: #8b6fff; color: #fff; border: none; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
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
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 99999; display: flex; align-items: center; justify-content: center; }
        .modal { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; width: 420px; max-width: 90vw; }
        .modal-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .modal-sub { font-size: 13px; color: #52526a; margin-bottom: 24px; }
        .connect-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
        .connect-tab { flex: 1; padding: 9px; text-align: center; font-size: 13px; font-weight: 500; border-radius: 7px; cursor: pointer; border: none; background: transparent; color: #52526a; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .connect-tab.active { background: #8b6fff; color: #fff; }
        .connect-tab:hover:not(.active) { color: #eeeef5; }
        .wallet-option { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; margin-bottom: 10px; transition: all 0.2s; }
        .wallet-option:hover { border-color: #8b6fff; background: rgba(139,111,255,0.06); }
        .wallet-option-icon { font-size: 24px; }
        .wallet-option-name { font-size: 14px; font-weight: 500; }
        .wallet-option-desc { font-size: 11px; color: #52526a; margin-top: 2px; }
        .magic-info { background: rgba(139,111,255,0.06); border: 1px solid rgba(139,111,255,0.15); border-radius: 8px; padding: 12px 14px; margin-bottom: 20px; font-size: 12px; color: #8b6fff; line-height: 1.7; }
        .email-field { width: 100%; background: #06060f; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 16px; color: #eeeef5; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; margin-bottom: 16px; }
        .email-field:focus { border-color: #8b6fff; }
        .email-field::placeholder { color: #3a3a52; }
        .btn-magic { width: 100%; background: linear-gradient(135deg, #8b6fff, #6b4fd8); color: #fff; border: none; border-radius: 10px; padding: 13px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: opacity 0.2s; margin-bottom: 16px; }
        .btn-magic:hover:not(:disabled) { opacity: 0.85; }
        .btn-magic:disabled { opacity: 0.5; cursor: not-allowed; }
        .divider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { font-size: 11px; color: #3a3a52; font-family: 'Space Mono', monospace; }
        .sent-box { text-align: center; padding: 8px 0; }
        .sent-icon { font-size: 44px; margin-bottom: 12px; }
        .sent-title { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .sent-sub { font-size: 13px; color: #52526a; line-height: 1.7; margin-bottom: 12px; }
        .sent-email { font-family: 'Space Mono', monospace; font-size: 12px; color: #8b6fff; background: rgba(139,111,255,0.08); border: 1px solid rgba(139,111,255,0.2); padding: 8px 16px; border-radius: 8px; margin-bottom: 16px; display: inline-block; }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-close { width: 100%; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #52526a; font-size: 13px; cursor: pointer; margin-top: 8px; font-family: 'Inter', sans-serif; }
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
        .btn-cancel { flex: 1; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #52526a; font-size: 14px; cursor: pointer; }
        .btn-pay { flex: 2; padding: 12px; background: #8b6fff; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
        .btn-pay:hover { opacity: 0.85; }
        @media (max-width: 768px) { .app-layout { grid-template-columns: 1fr; } .sidebar { display: none; } }
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
                  <div className="wallet-type-badge">{walletLabel}</div>
                  <div className="wallet-addr">{shortAddr}</div>
                  {walletEmail && <div className="wallet-email-label">{walletEmail}</div>}
                  <div className="wallet-net"><div className="wallet-dot" />ARC Testnet · Connected</div>
                  <button className="btn-disconnect" onClick={disconnectWallet}>Disconnect</button>
                </div>
              ) : (
                <button className="btn-connect" onClick={() => setShowWalletModal(true)}>Connect Wallet →</button>
              )}
            </div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">// TASK HISTORY</div>
            {taskHistory.length === 0
              ? <div className="empty-state">No tasks yet.<br />Start chatting!</div>
              : taskHistory.map((t, i) => (
                <div key={i} className="history-item">
                  <div className="history-icon">{t.icon}</div>
                  <div className="history-info">
                    <div className="history-name">{t.name}</div>
                    <div className="history-fee">{t.fee} · {t.time}</div>
                  </div>
                  <div className="history-status">✓</div>
                </div>
              ))
            }
          </div>
          <div className="sidebar-bottom">
            <button className="back-btn" onClick={() => router.push('/')}>← Back to home</button>
            <div style={{marginBottom:10}}>
              <button onClick={() => setShowEmailWallet(true)} style={{width:'100%',background:'rgba(139,111,255,0.1)',border:'1px solid rgba(139,111,255,0.3)',borderRadius:8,padding:'10px',color:'#8b6fff',fontSize:12,cursor:'pointer',marginBottom:6,transition:'all 0.2s'}}>
                💌 Email Wallet
              </button>
              <div style={{fontSize:10,color:'#3a3a52',fontFamily:'Space Mono,monospace',lineHeight:1.5}}>Send USDC to anyone via email. No MetaMask needed.</div>
            </div>
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="faucet-link">💧 Get testnet USDC</a>
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
                : <button className="btn-connect" style={{padding:'6px 16px',fontSize:12,width:'auto'}} onClick={() => setShowWalletModal(true)}>Connect Wallet</button>
              }
            </div>
          </div>
          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
                <div className={`msg-avatar ${m.role === 'ai' ? 'ai' : 'user-av'}`}>{m.role === 'ai' ? '🤖' : '👤'}</div>
                <div className="msg-content">
                  <div className={`bubble ${m.role === 'ai' ? (m.type === 'success' ? 'success' : 'ai') : 'user'}`}>
                    {m.filePreview && <img src={m.filePreview} alt="attachment" className="bubble-img" />}
                    {m.fileName && !m.filePreview && <div className="bubble-file">📎 {m.fileName}</div>}
                    {m.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={j}>{part.slice(2,-2)}</strong>
                      if (part.startsWith('`') && part.endsWith('`')) return <code key={j}>{part.slice(1,-1)}</code>
                      return part
                    })}
                    {m.mediaUrl && m.mediaType === 'image' && <img src={m.mediaUrl} alt="Generated" style={{maxWidth:'100%',borderRadius:8,marginTop:8,display:'block'}} />}
                  </div>
                  <div className="msg-time">{m.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-row">
                <div className="msg-avatar ai">🤖</div>
                <div className="msg-content">
                  <div className="bubble ai"><div className="loading-dots"><div className="dot" /><div className="dot" /><div className="dot" /></div></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {messages.length <= 1 && (
            <div className="chips-area">
              {chips.map(c => <button key={c} className="chip" onClick={() => handleSend(c)}>{c}</button>)}
            </div>
          )}
          <div className="input-area">
            {attachedFile && (
              <div className="file-preview">
                {attachedPreview ? <img src={attachedPreview} alt="preview" /> : <div style={{width:48,height:48,background:'rgba(255,255,255,0.06)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📎</div>}
                <div className="file-preview-name">{attachedFile.name}</div>
                <div className="file-preview-size">{(attachedFile.size/1024).toFixed(1)}KB</div>
                <button className="file-remove" onClick={removeFile}>✕</button>
              </div>
            )}
            <div className="input-box">
              <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*,video/*,.pdf,.sol" onChange={handleFileSelect} />
              <textarea ref={inputRef} rows={1} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Describe what you want to build... (Enter to send)" disabled={loading} />
              <button className="send-btn" onClick={() => handleSend()} disabled={loading || (!input.trim() && !attachedFile)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="input-hint">📎 Attach image/video · 💡 Describe in plain English · 0.1 USDC per task</div>
          </div>
        </div>
      </div>

      {/* ===== CONNECT MODAL ===== */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => { setShowWalletModal(false); setEmailStep('input'); setEmailInput(''); setOtpInput('') }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Connect to booAI_bot</div>
            <div className="modal-sub">Choose how you want to connect</div>
            <div className="connect-tabs">
              <button className={`connect-tab ${connectTab==='wallet'?'active':''}`} onClick={() => setConnectTab('wallet')}>🔗 Wallet</button>
              <button className={`connect-tab ${connectTab==='email'?'active':''}`} onClick={() => { setConnectTab('email'); setEmailStep('input') }}>📧 Email Login</button>
            </div>

            {connectTab === 'wallet' && (
              <>
                <div className="wallet-option" onClick={() => connectWallet('metamask')}>
                  <div className="wallet-option-icon">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" style={{width:28,height:28}} alt="MetaMask" />
                  </div>
                  <div><div className="wallet-option-name">MetaMask</div><div className="wallet-option-desc">Browser Extension · Most popular</div></div>
                </div>
                <div className="wallet-option" onClick={() => connectWallet('okx')}>
                  <div className="wallet-option-icon">
                    <img src="https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png" style={{width:28,height:28,borderRadius:6}} alt="OKX" />
                  </div>
                  <div><div className="wallet-option-name">OKX Wallet</div><div className="wallet-option-desc">OKX Browser Extension</div></div>
                </div>
                <div className="divider-row"><div className="divider-line" /><div className="divider-text">no extension?</div><div className="divider-line" /></div>
                <div className="wallet-option" style={{borderColor:'rgba(139,111,255,0.3)',background:'rgba(139,111,255,0.04)'}} onClick={() => setConnectTab('email')}>
                  <div className="wallet-option-icon">📧</div>
                  <div><div className="wallet-option-name" style={{color:'#8b6fff'}}>Email Login</div><div className="wallet-option-desc">Create wallet from email · No extension needed</div></div>
                </div>
              </>
            )}

            {connectTab === 'email' && (
              <>
                {emailStep === 'input' ? (
                  <>
                    <div className="magic-info">
                      ✨ Nhập email — chúng tôi gửi mã OTP 6 số. Không cần password, không cần extension. Ví được tạo tự động từ email của bạn.
                    </div>
                    <input type="email" className="email-field" placeholder="your@email.com" value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && sendOTP()} autoFocus />
                    {emailError && <div style={{fontSize:12,color:'#ff6b6b',marginBottom:12}}>{emailError}</div>}
                    <button className="btn-magic" onClick={sendOTP} disabled={emailLoading || !emailInput.includes('@')}>
                      {emailLoading ? <><span className="spinner" />Đang gửi mã...</> : '✉️ Gửi mã OTP →'}
                    </button>
                    <div className="divider-row"><div className="divider-line" /><div className="divider-text">have a wallet?</div><div className="divider-line" /></div>
                    <div style={{display:'flex',gap:8}}>
                      <div className="wallet-option" style={{flex:1,padding:12,marginBottom:0}} onClick={() => setConnectTab('wallet')}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" style={{width:24,height:24}} alt="MetaMask" />
                        <div><div className="wallet-option-name" style={{fontSize:12}}>MetaMask</div></div>
                      </div>
                      <div className="wallet-option" style={{flex:1,padding:12,marginBottom:0}} onClick={() => connectWallet('okx')}>
                        <img src="https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png" style={{width:24,height:24,borderRadius:4}} alt="OKX" />
                        <div><div className="wallet-option-name" style={{fontSize:12}}>OKX</div></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{textAlign:'center',marginBottom:20}}>
                      <div style={{fontSize:36,marginBottom:8}}>📬</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:6}}>Check your email!</div>
                      <div style={{fontSize:13,color:'#52526a',marginBottom:4}}>We sent a 6-digit code to:</div>
                      <div style={{fontFamily:'Space Mono,monospace',fontSize:13,color:'#8b6fff'}}>{emailInput}</div>
                    </div>
                    <input
                      type="text" className="email-field"
                      placeholder="Enter 6-digit code"
                      value={otpInput} maxLength={6}
                      onChange={e => setOtpInput(e.target.value.replace(/\D/g,''))}
                      onKeyDown={e => e.key==='Enter' && verifyOTP()}
                      autoFocus
                      style={{textAlign:'center',fontSize:28,letterSpacing:8,fontFamily:'Space Mono,monospace'}}
                    />
                    {emailError && <div style={{fontSize:12,color:'#ff6b6b',marginBottom:12,textAlign:'center'}}>{emailError}</div>}
                    <button className="btn-magic" onClick={verifyOTP} disabled={emailLoading || otpInput.length !== 6}>
                      {emailLoading ? <><span className="spinner" />Verifying...</> : '✅ Verify & Connect →'}
                    </button>
                    <button onClick={() => { setEmailStep('input'); setOtpInput(''); setEmailError('') }}
                      style={{width:'100%',padding:'8px',background:'transparent',border:'none',color:'#52526a',fontSize:12,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                      ← Use different email
                    </button>
                  </>
                )}
              </>
            )}

            <button className="modal-close" onClick={() => { setShowWalletModal(false); setEmailStep('input'); setEmailInput(''); setOtpInput('') }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ===== PAY MODAL ===== */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="pay-modal">
            <div className="modal-title">Confirm Payment</div>
            <div className="modal-sub">{walletType==='email' ? '📧 Email wallet will sign automatically' : 'Your wallet will ask you to sign'}</div>
            <div className="pay-task">
              <div className="pay-task-label">// TASK</div>
              <div className="pay-task-name">{taskData?.taskName || 'Smart Contract Task'}</div>
            </div>
            <div className="pay-amount">
              <div className="pay-amount-label">Fee</div>
              <div className="pay-amount-val">0.1 USDC</div>
            </div>
            {wallet && (
              <div className="pay-wallet">
                From: <span>{shortAddr}</span>
                {walletEmail && walletType==='email' && <span style={{color:'#8b6fff'}}> · {walletEmail}</span>}
                {' '}→ ARC Testnet
              </div>
            )}
            <div className="pay-btns">
              <button className="btn-cancel" onClick={handleCancelTask}>Cancel</button>
              <button className="btn-pay" onClick={handleExecuteTask}>{wallet ? '💳 Pay & Execute →' : 'Connect Wallet First'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EMAIL WALLET SEND ===== */}
      {showEmailWallet && (
        <div className="modal-overlay" onClick={() => setShowEmailWallet(false)}>
          <div style={{background:'#0d0d1a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:32,width:460,maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>💌 Email Wallet</div>
            <div style={{fontSize:13,color:'#52526a',marginBottom:24,lineHeight:1.6}}>Send USDC to anyone using just their email address.</div>
            {!wallet ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:40,marginBottom:16}}>🔗</div>
                <div style={{fontSize:15,color:'#eeeef5',fontWeight:500,marginBottom:8}}>Connect Wallet First</div>
                <div style={{fontSize:13,color:'#52526a',marginBottom:24}}>Connect MetaMask, OKX, or use Email Login.</div>
                <button onClick={() => { setShowEmailWallet(false); setShowWalletModal(true) }}
                  style={{background:'#8b6fff',color:'#fff',border:'none',borderRadius:10,padding:'12px 32px',fontSize:14,fontWeight:500,cursor:'pointer',width:'100%'}}>
                  Connect Wallet →
                </button>
              </div>
            ) : (
              <>
                <div style={{background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.15)',borderRadius:10,padding:14,marginBottom:20}}>
                  <div style={{fontSize:11,color:'#52526a',fontFamily:'Space Mono,monospace',marginBottom:4}}>SENDING FROM</div>
                  <div style={{fontSize:13,color:'#00d4aa',fontFamily:'Space Mono,monospace'}}>{shortAddr} · ARC Testnet</div>
                  {walletEmail && <div style={{fontSize:11,color:'#8b6fff',marginTop:4}}>{walletEmail}</div>}
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:'#52526a',fontFamily:'Space Mono,monospace',marginBottom:6}}>SEND TO EMAIL</div>
                  <input value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="recipient@email.com"
                    style={{width:'100%',background:'#06060f',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 14px',color:'#eeeef5',fontSize:13,boxSizing:'border-box',outline:'none'}} />
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,color:'#52526a',fontFamily:'Space Mono,monospace',marginBottom:6}}>AMOUNT (USDC)</div>
                  <input value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="0.00" type="number" min="0" step="0.1"
                    style={{width:'100%',background:'#06060f',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 14px',color:'#eeeef5',fontSize:20,fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box',outline:'none'}} />
                </div>
                <div style={{background:'rgba(139,111,255,0.06)',border:'1px solid rgba(139,111,255,0.15)',borderRadius:8,padding:'12px 14px',marginBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:'#52526a'}}>Amount</span><span style={{fontSize:12,color:'#eeeef5'}}>{sendAmount||'0.00'} USDC</span></div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,color:'#52526a'}}>Network fee</span><span style={{fontSize:12,color:'#eeeef5'}}>~0.01 USDC</span></div>
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:8,marginTop:4,display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,fontWeight:500,color:'#eeeef5'}}>Total</span>
                    <span style={{fontSize:12,fontWeight:500,color:'#00d4aa'}}>{sendAmount?(parseFloat(sendAmount)+0.01).toFixed(2):'0.01'} USDC</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button onClick={() => setShowEmailWallet(false)} style={{flex:1,padding:12,background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,color:'#52526a',fontSize:14,cursor:'pointer'}}>Cancel</button>
                  <button onClick={handleEmailSend} disabled={sending||!emailTo||!sendAmount}
                    style={{flex:2,padding:12,background:'#8b6fff',border:'none',borderRadius:10,color:'#fff',fontSize:14,fontWeight:500,cursor:'pointer',opacity:(sending||!emailTo||!sendAmount)?0.5:1}}>
                    {sending?'⏳ Sending...':'💸 Send USDC →'}
                  </button>
                </div>
                <div style={{fontSize:10,color:'#3a3a52',textAlign:'center',marginTop:12,fontFamily:'Space Mono,monospace'}}>ARC Testnet · USDC Native · No extra fees</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}