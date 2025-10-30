const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of AnonymousCopyright contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
  console.log("Deploying AnonymousCopyright...");

  const contract = await AnonymousCopyright.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("AnonymousCopyright deployed to:", contractAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("========================\n");

  console.log("Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("Confirmed!");

  console.log("\nVerify contract with:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
