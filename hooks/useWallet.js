import { useEffect, useState } from 'react';
import { CHAINS } from '../lib/config';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  const refreshState = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    setAccount(accounts[0] || null);
    const id = await window.ethereum.request({ method: 'eth_chainId' });
    setChainId(id);
  };

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask is required to connect.');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const id = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(id);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Unable to connect MetaMask.');
    }
  };

  const switchToAbstract = async () => {
    const chain = CHAINS.abstractTestnet;
    const chainIdHex = `0x${chain.chainId.toString(16)}`;

    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      setChainId(chainIdHex);
      setError(null);
    } catch (switchError) {
      if (switchError?.code === 4902) {
        try {
          await window.ethereum.request({
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
          setError(addError?.message || 'Unable to add Abstract Testnet.');
        }
      } else {
        setError(switchError?.message || 'Unable to switch network.');
      }
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    refreshState();

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = (chain) => {
      setChainId(chain);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
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
