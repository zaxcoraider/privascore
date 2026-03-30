import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("─────────────────────────────────────────────");
  console.log("  Deploying PrivaScore");
  console.log("─────────────────────────────────────────────");
  console.log("Network    :", hre.network.name);
  console.log("Deployer   :", deployer.address);
  console.log("Oracle     :", deployer.address, "(deployer set as oracle)");
  console.log("");

  const Factory = await hre.ethers.getContractFactory("PrivaScore");

  // Deployer address is used as the oracle for the initial deployment.
  // Replace with a dedicated oracle address before mainnet.
  const contract = await Factory.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ PrivaScore deployed to:", address);
  console.log("");
  console.log("─────────────────────────────────────────────");
  console.log("  Next Steps");
  console.log("─────────────────────────────────────────────");
  console.log("1. Copy the contract address above into your .env:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`   VITE_ORACLE_ADDRESS=${deployer.address}`);
  console.log("");
  console.log("2. Register lenders (owner only):");
  console.log("   await contract.registerLender(lenderAddress)");
  console.log("");
  console.log("3. Oracle assigns first score (oracle only):");
  console.log("   const [enc] = await cofhejs.encrypt([Encryptable.uint32(750n)])");
  console.log("   await contract.updateScore(walletAddress, enc)");
  console.log("");
  console.log("4. Start the frontend:");
  console.log("   cd frontend && npm run dev");
  console.log("─────────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
