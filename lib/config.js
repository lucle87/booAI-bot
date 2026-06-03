export const ABSTRACT_TESTNET = {
  key: 'abstractTestnet',
  name: 'ARC Testnet',
  chainName: 'ARC Testnet',
  symbol: 'ARC',
  chainId: 11124,
  nativeCurrency: {
    name: 'ARC Testnet Ether',
    symbol: 'ARC',
    decimals: 18,
  },
  rpc: process.env.NEXT_PUBLIC_ABSTRACT_TESTNET_RPC || 'https://rpc.testnet.abstract.xyz',
  rpcUrls: [process.env.NEXT_PUBLIC_ABSTRACT_TESTNET_RPC || 'https://rpc.testnet.abstract.xyz'],
  explorer: 'https://explorer.testnet.abstract.xyz',
  blockExplorerUrls: ['https://explorer.testnet.abstract.xyz'],
  status: 'live',
};

export const CHAINS = {
  abstractTestnet: ABSTRACT_TESTNET,
};

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000';
export const PAYMENT_RECEIVER = process.env.NEXT_PUBLIC_PAYMENT_RECEIVER || '0x0000000000000000000000000000000000000000';
export const USDC_DECIMALS = 6;
export const USDC_TRANSFER_AMOUNT = '0.1';
