import { ethers } from "ethers";

const contractAddress = "0x542Ca7373628eE54d4f672e5500A41FD3F086Dc3"; // Your contract address
const abi = [
  {
    "inputs": [
      { "internalType": "address payable", "name": "_to", "type": "address" },
      { "internalType": "string", "name": "_message", "type": "string" }
    ],
    "name": "sendFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "message", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

// ✅ Fix: Ensure `sendFunds` is correctly exported
export const sendFunds = async (recipient, message, amount) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.sendFunds(recipient, message, { value: ethers.parseEther(amount) });
    await tx.wait();
    console.log("Transaction successful:", tx);
    return tx;
  } catch (error) {
    console.error("Transaction failed:", error);
    return null;
  }
};

// ✅ Fix: Ensure `getTransactions` is correctly exported
export const getTransactions = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter, 7840000, "latest");

    let totalETHSent = 0;
    let userActivity = {};

    const transactions = events.map(event => {
      const amount = ethers.formatEther(event.args.amount);
      totalETHSent += parseFloat(amount);

      const sender = event.args.from;
      userActivity[sender] = (userActivity[sender] || 0) + 1;

      return {
        from: sender,
        to: event.args.to,
        amount: amount,
        message: event.args.message,
        timestamp: new Date(Number(event.args.timestamp) * 1000).toLocaleString(),
      };
    });

    return {
      transactions,
      totalTransactions: transactions.length,
      totalETHSent: totalETHSent.toFixed(4), // Keep 4 decimal places
      mostActiveUsers: Object.entries(userActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5), // Get top 5 most active users
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      totalTransactions: 0,
      totalETHSent: "0.0000",
      mostActiveUsers: [],
    };
  }
};
