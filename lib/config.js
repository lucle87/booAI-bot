// lib/config.js — ARC Testnet (by Circle)

export const CHAIN_CONFIG = {
  chainId: '0x4CDEF2',         // 5042002 in hex
  chainIdDecimal: 5042002,
  chainName: 'ARC Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
}

// USDC is native on ARC — system contract address
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

// Your treasury wallet (receives 0.1 USDC fee)
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000'

// 0.1 USDC = 100000 (6 decimals)
export const DEPLOY_FEE = '100000'

// Faucet URL
export const FAUCET_URL = 'https://faucet.circle.com'

// Explorer URL
export const EXPLORER_URL = 'https://testnet.arcscan.app'

// Minimal ERC20 ABI for USDC transfer
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]