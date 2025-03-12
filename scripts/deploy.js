const hre = require("hardhat");

async function main() {
  const Transaction = await hre.ethers.getContractFactory("Transaction");
  const transaction = await Transaction.deploy(); // Deploy contract

  await transaction.waitForDeployment(); // Correct function to wait for deployment

  console.log(`✅ Smart Contract Deployed! Address: ${transaction.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
