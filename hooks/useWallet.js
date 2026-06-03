// hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react'

const ARC_TESTNET = {
  chainId: '0x4D0112',        // 5042002 decimal
  chainIdDecimal: 5042002,
  chainName: 'ARC Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
}

export function useWallet() {
  const [address, setAddress] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [walletType, setWalletType] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('booai_wallet_type')
    if (saved) autoReconnect(saved)

    const provider = saved === 'okx' ? window.okxwallet : window.ethereum
    if (!provider) return

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect()
      else setAddress(accounts[0])
    }
    const onChainChanged = (id) => setChainId(id)

    provider.on?.('accountsChanged', onAccountsChanged)
    provider.on?.('chainChanged', onChainChanged)
    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged)
      provider.removeListener?.('chainChanged', onChainChanged)
    }
  }, [])

  const autoReconnect = async (type) => {
    const provider = type === 'okx' ? window.okxwallet : window.ethereum
    if (!provider) return
    try {
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setWalletType(type)
        const chain = await provider.request({ method: 'eth_chainId' })
        setChainId(chain)
      }
    } catch { /* silent */ }
  }

  const switchToArcTestnet = async (provider) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainId }],
      })
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [ARC_TESTNET],
        })
      } else {
        throw switchErr
      }
    }
  }

  const connect = useCallback(async (type = 'metamask') => {
    setConnecting(true)
    setError(null)

    if (type === 'okx' && !window.okxwallet) {
      window.open('https://www.okx.com/web3', '_blank')
      setConnecting(false)
      return null
    }
    if (type === 'metamask' && !window.ethereum) {
      window.open('https://metamask.io/download/', '_blank')
      setConnecting(false)
      return null
    }

    const provider = type === 'okx' ? window.okxwallet : window.ethereum

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]

      // Switch to ARC Testnet
      await switchToArcTestnet(provider)

      const chain = await provider.request({ method: 'eth_chainId' })
      setAddress(addr)
      setChainId(chain)
      setWalletType(type)
      localStorage.setItem('booai_wallet_type', type)
      setConnecting(false)
      return addr
    } catch (err) {
      setError(err.message || 'Connection failed')
      setConnecting(false)
      return null
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    setWalletType(null)
    setError(null)
    localStorage.removeItem('booai_wallet_type')
  }, [])

  const isOnArcTestnet = chainId?.toLowerCase() === ARC_TESTNET.chainId.toLowerCase()
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

  return {
    address,
    shortAddress,
    chainId,
    connecting,
    error,
    walletType,
    isOnArcTestnet,
    connect,
    disconnect,
    arcTestnet: ARC_TESTNET,
  }
}