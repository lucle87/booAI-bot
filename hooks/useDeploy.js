import { useState } from 'react';
import { ethers } from 'ethers';
import { PAYMENT_RECEIVER, USDC_ADDRESS, USDC_DECIMALS, USDC_TRANSFER_AMOUNT } from '../lib/config';

const IERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
];

export function useDeploy() {
  const [deploying, setDeploying] = useState(false);
  const [contractAddress, setContractAddress] = useState(null);
  const [deployError, setDeployError] = useState(null);

  const deployContract = async ({ signer, abi, bytecode }) => {
    setDeployError(null);
    setContractAddress(null);

    if (!signer) {
      setDeployError('Wallet signer is required.');
      return null;
    }

    if (!abi || !bytecode) {
      setDeployError('ABI and bytecode are required to deploy a contract.');
      return null;
    }

    try {
      setDeploying(true);
      const token = new ethers.Contract(USDC_ADDRESS, IERC20_ABI, signer);
      const amount = ethers.parseUnits(USDC_TRANSFER_AMOUNT, USDC_DECIMALS);
      const paymentTx = await token.transfer(PAYMENT_RECEIVER, amount);
      await paymentTx.wait();

      const parsedAbi = typeof abi === 'string' ? JSON.parse(abi) : abi;
      const factory = new ethers.ContractFactory(parsedAbi, bytecode, signer);
      const deployment = await factory.deploy();
      await deployment.wait();

      setContractAddress(deployment.target);
      return deployment.target;
    } catch (err) {
      setDeployError(err?.message || 'Deployment failed.');
      return null;
    } finally {
      setDeploying(false);
    }
  };

  return {
    deploying,
    contractAddress,
    deployError,
    deployContract,
  };
}
