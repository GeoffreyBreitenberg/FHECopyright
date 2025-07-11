const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verification script for deployed contracts
 * Automatically reads deployment info and verifies on Etherscan
 */

async function main() {
  console.log("==========================================");
  console.log("   Contract Verification Script");
  console.log("==========================================\n");

  // Get network from command line or use default
  const networkName = network.name;
  console.log("Network:", networkName);

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${networkName}-latest.json`);

  if (!fs.existsSync(latestFile)) {
    throw new Error(
      `No deployment found for network: ${networkName}\n` +
      `Please deploy the contract first using: npm run deploy`
    );
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  const contractName = deploymentInfo.contractName;

  console.log("Contract Name:", contractName);
  console.log("Contract Address:", contractAddress);
  console.log("");

  // Verify contract
  console.log("Starting verification on Etherscan...");
  console.log("This may take a few moments...\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: `contracts/${contractName}.sol:${contractName}`,
    });

    console.log("\n✓ Contract verified successfully!");
    console.log("");
    console.log("==========================================");
    console.log("   VERIFICATION SUMMARY");
    console.log("==========================================");
    console.log("Contract:", contractName);
    console.log("Address:", contractAddress);
    console.log("Network:", networkName);
    console.log("");

    if (networkName === "sepolia") {
      console.log("View on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }

    console.log("==========================================\n");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract is already verified!");
      console.log("");
      console.log("View on Etherscan:");
      if (networkName === "sepolia") {
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      }
      console.log("");
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      console.error("");
      console.error("Common issues:");
      console.error("1. Make sure ETHERSCAN_API_KEY is set in .env file");
      console.error("2. Wait a few moments after deployment before verifying");
      console.error("3. Ensure the contract was compiled with the same settings");
      throw error;
    }
  }
}

// Execute verification
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
