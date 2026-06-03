import { useEffect, useState } from 'react';
import { CHAINS } from '../lib/config';

const INSTALL_MESSAGE = 'Please install MetaMask to continue → metamask.io';
const INSTALL_URL = 'https://metamask.io/download/';

function getWalletProvider(preferred) {
  if (typeof window === 'undefined') return null;
  const { ethereum, okxwallet } = window;

  if (preferred === 'metamask') {
    if (ethereum?.isMetaMask) return ethereum;
    return ethereum || okxwallet || null;
  }

  if (preferred === 'okx') {
    if (okxwallet) return okxwallet;
    return ethereum || null;
  }

  if (ethereum?.isMetaMask) return ethereum;
  if (okxwallet) return okxwallet;
  return ethereum || null;
}

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  const refreshState = async () => {
    const provider = getWalletProvider();
    if (!provider) {
      setAccount(null);
      setChainId(null);
      setError(INSTALL_MESSAGE);
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      setAccount(accounts[0] || null);
      const id = await provider.request({ method: 'eth_chainId' });
      setChainId(id);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Unable to read wallet state.');
    }
  };

  const connectMetaMask = async () => {
    const provider = getWalletProvider('metamask');
    if (!provider) {
      setError(INSTALL_MESSAGE);
      if (typeof window !== 'undefined') {
        window.open(INSTALL_URL, '_blank');
      }
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] || null);
      const id = await provider.request({ method: 'eth_chainId' });
      setChainId(id);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Unable to connect wallet.');
    }
  };

  const connectOkxWallet = async () => {
    const provider = getWalletProvider('okx');
    if (!provider) {
      setError('OKX Wallet is not detected.');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] || null);
      const id = await provider.request({ method: 'eth_chainId' });
      setChainId(id);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Unable to connect OKX Wallet.');
    }
  };

  const connectWalletConnect = () => {
    if (typeof window !== 'undefined') {
      window.open('https://walletconnect.com/', '_blank');
      setError('WalletConnect opened in a new tab.');
    }
  };

  const switchToAbstract = async () => {
    const provider = getWalletProvider();
    if (!provider) {
      setError(INSTALL_MESSAGE);
      if (typeof window !== 'undefined') {
        window.open(INSTALL_URL, '_blank');
      }
      return;
    }

    const chain = CHAINS.abstractTestnet;
    const chainIdHex = `0x${chain.chainId.toString(16)}`;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      setChainId(chainIdHex);
      setError(null);
    } catch (switchError) {
      if (switchError?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: chain.chainName,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls,
              },
            ],
          });
          setChainId(chainIdHex);
          setError(null);
        } catch (addError) {
          setError(addError?.message || 'Unable to add ARC Testnet.');
        }
      } else {
        setError(switchError?.message || 'Unable to switch network.');
      }
    }
  };

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    refreshState();

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = (chain) => {
      setChainId(chain);
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider?.removeListener('accountsChanged', handleAccountsChanged);
      provider?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    account,
    chainId,
    error,
    connectMetaMask,
    connectOkxWallet,
    connectWalletConnect,
    switchToAbstract,
  };
}
