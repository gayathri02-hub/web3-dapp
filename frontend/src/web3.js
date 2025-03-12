import { ethers } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {};

export const connectWallet = async () => {
  try {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    });

    const instance = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(instance);
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
};
