const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==========================================");
  console.log("   Anonymous Copyright Protection System");
  console.log("   Deployment Script");
  console.log("==========================================\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer account has no balance. Please fund the account.");
  }

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("");

  // Estimate deployment cost
  const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
  const deploymentData = AnonymousCopyright.getDeployTransaction();

  const feeData = await ethers.provider.getFeeData();
  const estimatedGas = 3000000n; // Estimated gas for deployment
  const estimatedCost = estimatedGas * (feeData.gasPrice || feeData.maxFeePerGas || 0n);

  console.log("Estimated deployment cost:", ethers.formatEther(estimatedCost), "ETH");
  console.log("");

  // Deploy contract
  console.log("Deploying AnonymousCopyright contract...");
  const contract = await AnonymousCopyright.deploy();

  console.log("Transaction submitted. Waiting for confirmation...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();

  console.log("\n✓ Contract deployed successfully!");
  console.log("");

  // Wait for confirmations
  console.log("Waiting for 5 block confirmations...");
  const receipt = await deploymentTx.wait(5);
  console.log("✓ Confirmed!");
  console.log("");

  // Calculate actual deployment cost
  const actualCost = receipt.gasUsed * receipt.gasPrice;

  // Deployment Summary
  console.log("==========================================");
  console.log("   DEPLOYMENT SUMMARY");
  console.log("==========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Block Number:", receipt.blockNumber);
  console.log("Transaction Hash:", receipt.hash);
  console.log("Gas Used:", receipt.gasUsed.toString());
  console.log("Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
  console.log("Deployment Cost:", ethers.formatEther(actualCost), "ETH");
  console.log("==========================================\n");

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    contractName: "AnonymousCopyright",
    deployer: deployer.address,
    deploymentTransaction: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: receipt.gasPrice.toString(),
    deploymentCost: ethers.formatEther(actualCost),
    timestamp: new Date().toISOString(),
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment information saved to:", deploymentFile);

  // Save latest deployment
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("Latest deployment info saved to:", latestFile);
  console.log("");

  // Verification instructions
  if (network.chainId === 11155111n) { // Sepolia
    console.log("==========================================");
    console.log("   VERIFICATION");
    console.log("==========================================");
    console.log("To verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
    console.log("");
    console.log("Or use the verification script:");
    console.log("npm run verify");
    console.log("");
    console.log("Etherscan URL:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("==========================================\n");
  }

  // Next steps
  console.log("==========================================");
  console.log("   NEXT STEPS");
  console.log("==========================================");
  console.log("1. Verify the contract (see instructions above)");
  console.log("2. Test interactions: npm run interact");
  console.log("3. Run simulations: npm run simulate");
  console.log("4. Update frontend with contract address");
  console.log("==========================================\n");

  return {
    contractAddress,
    deploymentInfo
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
