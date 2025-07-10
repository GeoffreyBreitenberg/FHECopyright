const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Sepolia Testnet Integration Tests
 *
 * These tests run against a deployed contract on Sepolia testnet
 * They verify real blockchain interactions with longer timeouts
 *
 * Requirements:
 * 1. Contract must be deployed to Sepolia
 * 2. SEPOLIA_RPC_URL and PRIVATE_KEY must be configured in .env
 * 3. Account must have Sepolia ETH
 *
 * Run with: npm run test:sepolia
 */

describe("AnonymousCopyright - Sepolia Testnet", function () {
  let contract;
  let contractAddress;
  let alice;
  let step = 0;
  let totalSteps = 0;

  function progress(message) {
    console.log(`  [${++step}/${totalSteps}] ${message}`);
  }

  before(async function () {
    // Skip if not on Sepolia network
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.log(`⚠️  This test suite can only run on Sepolia testnet (chainId: 11155111)`);
      console.log(`   Current network: ${network.name} (chainId: ${network.chainId})`);
      console.log(`   To run these tests, use: npm run test:sepolia`);
      this.skip();
    }

    console.log("\n📡 Running Sepolia Testnet Tests");
    console.log(`   Network: Sepolia (${network.chainId})`);

    // Load deployment information
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const latestFile = path.join(deploymentsDir, "sepolia-latest.json");

    if (!fs.existsSync(latestFile)) {
      throw new Error(
        `\n❌ No Sepolia deployment found!\n` +
        `   Please deploy the contract first:\n` +
        `   npm run deploy\n`
      );
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;

    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);

    // Get signer
    const signers = await ethers.getSigners();
    alice = signers[0];

    console.log(`   Test Account: ${alice.address}`);

    // Check balance
    const balance = await ethers.provider.getBalance(alice.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
      throw new Error(
        `\n❌ Test account has no balance!\n` +
        `   Please fund the account with Sepolia ETH from faucets:\n` +
        `   - https://sepoliafaucet.com\n` +
        `   - https://www.infura.io/faucet/sepolia\n`
      );
    }

    // Connect to contract
    const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
    contract = AnonymousCopyright.attach(contractAddress);

    console.log("✅ Setup complete. Starting tests...\n");
  });

  beforeEach(function () {
    step = 0;
  });

  describe("Deployment Verification", function () {
    it("should verify contract is deployed on Sepolia", async function () {
      totalSteps = 3;
      this.timeout(60000); // 60 seconds

      progress("Checking contract address...");
      expect(contractAddress).to.be.properAddress;

      progress("Verifying contract code...");
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");

      progress("Checking contract owner...");
      const owner = await contract.owner();
      expect(owner).to.be.properAddress;

      console.log(`     Owner: ${owner}`);
    });

    it("should have correct initial state", async function () {
      totalSteps = 2;
      this.timeout(60000);

      progress("Checking work counter...");
      const workCounter = await contract.workCounter();
      console.log(`     Work Counter: ${workCounter}`);

      progress("Checking total works...");
      const totalWorks = await contract.getTotalWorks();
      console.log(`     Total Works: ${totalWorks}`);

      expect(workCounter).to.be.gte(0);
      expect(totalWorks).to.be.gte(0);
    });
  });

  describe("Author Registration (Sepolia)", function () {
    const authorId = Math.floor(Math.random() * 1000000) + 500000;

    it("should register author on Sepolia testnet", async function () {
      totalSteps = 5;
      this.timeout(120000); // 2 minutes

      progress("Checking if already registered...");
      const alreadyRegistered = await contract.isRegisteredAuthor(alice.address);

      if (alreadyRegistered) {
        console.log(`     ℹ️  Author already registered. Skipping registration.`);
        progress("Verifying author stats...");
        const stats = await contract.getAuthorStats(alice.address);
        console.log(`     Registered: ${stats.registered}`);
        console.log(`     Work Count: ${stats.workCount}`);
        this.skip();
        return;
      }

      progress("Preparing registration transaction...");
      const tx = await contract.connect(alice).registerAuthor(authorId);
      console.log(`     Tx Hash: ${tx.hash}`);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`     Block: ${receipt.blockNumber}`);
      console.log(`     Gas Used: ${receipt.gasUsed}`);

      progress("Verifying registration...");
      const isRegistered = await contract.isRegisteredAuthor(alice.address);
      expect(isRegistered).to.be.true;

      progress("Checking author stats...");
      const stats = await contract.getAuthorStats(alice.address);
      expect(stats.registered).to.be.true;
      console.log(`     ✅ Author registered successfully`);
    });
  });

  describe("Work Registration (Sepolia)", function () {
    const contentHash = Math.floor(Math.random() * 4294967295);
    const title = `Test Work ${Date.now()}`;
    const category = "Sepolia Test";

    before(async function () {
      // Ensure author is registered
      const isRegistered = await contract.isRegisteredAuthor(alice.address);
      if (!isRegistered) {
        console.log("\n   ⚠️  Registering author first...");
        const authorId = Math.floor(Math.random() * 1000000) + 600000;
        const tx = await contract.connect(alice).registerAuthor(authorId);
        await tx.wait();
        console.log("   ✅ Author registered\n");
      }
    });

    it("should register work on Sepolia testnet", async function () {
      totalSteps = 6;
      this.timeout(120000); // 2 minutes

      progress("Getting current work count...");
      const worksBefore = await contract.getTotalWorks();
      console.log(`     Current Works: ${worksBefore}`);

      progress("Preparing work registration...");
      console.log(`     Title: "${title}"`);
      console.log(`     Category: "${category}"`);
      console.log(`     Content Hash: ${contentHash}`);

      progress("Submitting transaction...");
      const tx = await contract.connect(alice).registerWork(
        contentHash,
        title,
        category
      );
      console.log(`     Tx Hash: ${tx.hash}`);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`     Block: ${receipt.blockNumber}`);
      console.log(`     Gas Used: ${receipt.gasUsed}`);

      progress("Verifying work count increased...");
      const worksAfter = await contract.getTotalWorks();
      console.log(`     New Work Count: ${worksAfter}`);
      expect(worksAfter).to.be.gt(worksBefore);

      progress("Retrieving work information...");
      const workInfo = await contract.getWorkInfo(worksAfter);
      console.log(`     Work ID: ${worksAfter}`);
      console.log(`     Registrant: ${workInfo.registrant}`);
      console.log(`     Title: ${workInfo.title}`);
      console.log(`     Category: ${workInfo.category}`);
      console.log(`     ✅ Work registered successfully`);
    });
  });

  describe("View Functions (Sepolia)", function () {
    it("should read work information from Sepolia", async function () {
      totalSteps = 3;
      this.timeout(60000);

      progress("Getting total works...");
      const totalWorks = await contract.getTotalWorks();
      console.log(`     Total Works: ${totalWorks}`);

      if (totalWorks === 0n) {
        console.log(`     ℹ️  No works registered yet`);
        this.skip();
        return;
      }

      progress("Reading first work...");
      const workInfo = await contract.getWorkInfo(1);
      console.log(`     Registrant: ${workInfo.registrant}`);
      console.log(`     Title: ${workInfo.title}`);
      console.log(`     Category: ${workInfo.category}`);
      console.log(`     Verified: ${workInfo.verified}`);
      console.log(`     Disputed: ${workInfo.disputed}`);

      progress("Getting registrant stats...");
      const stats = await contract.getAuthorStats(workInfo.registrant);
      console.log(`     Work Count: ${stats.workCount}`);
      console.log(`     Total Disputes: ${stats.totalDisputes}`);
    });

    it("should read author works array", async function () {
      totalSteps = 2;
      this.timeout(60000);

      progress("Checking if author is registered...");
      const isRegistered = await contract.isRegisteredAuthor(alice.address);

      if (!isRegistered) {
        console.log(`     ℹ️  Author not registered yet`);
        this.skip();
        return;
      }

      progress("Getting author's works...");
      const authorWorks = await contract.getAuthorWorks(alice.address);
      console.log(`     Works Count: ${authorWorks.length}`);

      if (authorWorks.length > 0) {
        console.log(`     Work IDs: [${authorWorks.join(", ")}]`);
      }
    });
  });

  describe("Contract Statistics (Sepolia)", function () {
    it("should retrieve platform statistics", async function () {
      totalSteps = 4;
      this.timeout(60000);

      progress("Getting total works...");
      const totalWorks = await contract.getTotalWorks();
      console.log(`     Total Works Registered: ${totalWorks}`);

      progress("Getting work counter...");
      const workCounter = await contract.workCounter();
      console.log(`     Work Counter: ${workCounter}`);

      progress("Checking contract owner...");
      const owner = await contract.owner();
      console.log(`     Contract Owner: ${owner}`);

      progress("Getting test account stats...");
      const stats = await contract.getAuthorStats(alice.address);
      console.log(`     Registered: ${stats.registered}`);
      console.log(`     Work Count: ${stats.workCount}`);
      console.log(`     Total Disputes: ${stats.totalDisputes}`);
      console.log(`     Won Disputes: ${stats.wonDisputes}`);
    });
  });

  describe("Gas Cost Analysis (Sepolia)", function () {
    it("should measure real gas costs on Sepolia", async function () {
      totalSteps = 3;
      this.timeout(120000);

      const gasCosts = {
        authorRegistration: 0,
        workRegistration: 0,
        verification: 0
      };

      progress("Measuring author registration gas...");
      const isRegistered = await contract.isRegisteredAuthor(alice.address);
      if (!isRegistered) {
        const authorId = Math.floor(Math.random() * 1000000) + 700000;
        const tx = await contract.connect(alice).registerAuthor(authorId);
        const receipt = await tx.wait();
        gasCosts.authorRegistration = Number(receipt.gasUsed);
        console.log(`     Gas Used: ${receipt.gasUsed}`);
      } else {
        console.log(`     Skipped (already registered)`);
      }

      progress("Measuring work registration gas...");
      const contentHash = Math.floor(Math.random() * 4294967295);
      const tx = await contract.connect(alice).registerWork(
        contentHash,
        `Gas Test ${Date.now()}`,
        "Test"
      );
      const receipt = await tx.wait();
      gasCosts.workRegistration = Number(receipt.gasUsed);
      console.log(`     Gas Used: ${receipt.gasUsed}`);

      progress("Gas cost summary:");
      console.log(`     Work Registration: ${gasCosts.workRegistration.toLocaleString()} gas`);

      if (gasCosts.authorRegistration > 0) {
        console.log(`     Author Registration: ${gasCosts.authorRegistration.toLocaleString()} gas`);
      }
    });
  });

  after(function () {
    if (!this.currentTest?.parent?.tests?.some(t => t.state === "failed")) {
      console.log("\n✅ All Sepolia tests completed successfully!\n");
      console.log(`   View contract on Etherscan:`);
      console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);
    }
  });
});
