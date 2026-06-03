import { useEffect, useState } from 'react';
import { CHAINS } from '../lib/config';

const INSTALL_MESSAGE = 'Please install MetaMask to continue → metamask.io';
const INSTALL_URL = 'https://metamask.io/download/';

function getEthereumProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const ethereum = window.ethereum;

  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    return ethereum.providers.find((provider) => typeof provider.request === 'function') || ethereum.providers[0] || ethereum;
  }

  return ethereum;
}

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  const refreshState = async () => {
    const provider = getEthereumProvider();
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
    const provider = getEthereumProvider();
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

  const switchToAbstract = async () => {
    const provider = getEthereumProvider();
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
    switchToAbstract,
  };
}
