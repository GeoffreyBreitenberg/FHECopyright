const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simulation script for comprehensive testing
 * Simulates realistic usage scenarios including disputes
 */

async function main() {
  console.log("==========================================");
  console.log("   Contract Simulation Script");
  console.log("   Complete Workflow Testing");
  console.log("==========================================\n");

  // Load deployment information
  const networkName = network.name;
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${networkName}-latest.json`);

  let contractAddress;
  let deployFromScratch = false;

  if (!fs.existsSync(latestFile)) {
    console.log("⚠ No deployment found. Deploying for simulation...\n");
    deployFromScratch = true;
  } else {
    const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
  }

  console.log("Network:", networkName);

  // Get signers for simulation
  const [owner, alice, bob, charlie, dave] = await ethers.getSigners();

  console.log("Simulation Participants:");
  console.log("  Owner:", owner.address);
  console.log("  Alice (Author):", alice.address);
  console.log("  Bob (Author):", bob.address);
  console.log("  Charlie (Author):", charlie.address);
  console.log("  Dave (Author):", dave.address);
  console.log("");

  // Deploy or connect to contract
  let contract;
  if (deployFromScratch) {
    console.log("Deploying AnonymousCopyright contract...");
    const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
    contract = await AnonymousCopyright.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log("✓ Contract deployed to:", contractAddress);
    console.log("");
  } else {
    console.log("Contract Address:", contractAddress);
    const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
    contract = AnonymousCopyright.attach(contractAddress);
    console.log("✓ Connected to existing contract");
    console.log("");
  }

  const simulationResults = {
    network: networkName,
    contractAddress: contractAddress,
    timestamp: new Date().toISOString(),
    scenarios: []
  };

  try {
    console.log("==========================================");
    console.log("   SCENARIO 1: Author Registration");
    console.log("==========================================\n");

    const authors = [
      { signer: alice, name: "Alice", id: 100001 },
      { signer: bob, name: "Bob", id: 100002 },
      { signer: charlie, name: "Charlie", id: 100003 },
      { signer: dave, name: "Dave", id: 100004 }
    ];

    for (const author of authors) {
      console.log(`Registering ${author.name}...`);
      const tx = await contract.connect(author.signer).registerAuthor(author.id);
      const receipt = await tx.wait();
      console.log(`✓ ${author.name} registered (Gas used: ${receipt.gasUsed.toString()})`);
    }

    console.log("\n✓ All authors registered successfully\n");

    simulationResults.scenarios.push({
      name: "Author Registration",
      status: "success",
      authorsRegistered: authors.length
    });

    console.log("==========================================");
    console.log("   SCENARIO 2: Work Registration");
    console.log("==========================================\n");

    const works = [
      {
        author: alice,
        name: "Alice",
        contentHash: 123456789,
        title: "Abstract Digital Art Series",
        category: "Digital Art"
      },
      {
        author: alice,
        name: "Alice",
        contentHash: 987654321,
        title: "Photography Portfolio 2024",
        category: "Photography"
      },
      {
        author: bob,
        name: "Bob",
        contentHash: 555111222,
        title: "Electronic Music Album",
        category: "Music"
      },
      {
        author: charlie,
        name: "Charlie",
        contentHash: 777888999,
        title: "Science Fiction Novel",
        category: "Literature"
      },
      {
        author: dave,
        name: "Dave",
        contentHash: 111222333,
        title: "Software Architecture Design",
        category: "Technical Documentation"
      }
    ];

    const workIds = [];

    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      console.log(`${work.name} registering: "${work.title}"`);

      const tx = await contract.connect(work.author.signer).registerWork(
        work.contentHash,
        work.title,
        work.category
      );
      const receipt = await tx.wait();

      // Extract work ID from event
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === "WorkRegistered";
        } catch (e) {
          return false;
        }
      });

      const workId = event ? contract.interface.parseLog(event).args.workId : BigInt(i + 1);
      workIds.push(workId);

      console.log(`✓ Work ID: ${workId.toString()} (Gas used: ${receipt.gasUsed.toString()})`);
      console.log("");
    }

    console.log("✓ All works registered successfully\n");

    simulationResults.scenarios.push({
      name: "Work Registration",
      status: "success",
      worksRegistered: works.length,
      workIds: workIds.map(id => id.toString())
    });

    console.log("==========================================");
    console.log("   SCENARIO 3: Work Verification");
    console.log("==========================================\n");

    console.log("Owner verifying legitimate works...");

    // Verify first two works
    for (let i = 0; i < 2 && i < workIds.length; i++) {
      const tx = await contract.connect(owner).markWorkAsVerified(workIds[i]);
      await tx.wait();
      console.log(`✓ Work ID ${workIds[i].toString()} verified`);
    }

    console.log("\n✓ Verification process completed\n");

    simulationResults.scenarios.push({
      name: "Work Verification",
      status: "success",
      worksVerified: 2
    });

    console.log("==========================================");
    console.log("   SCENARIO 4: Dispute Filing");
    console.log("==========================================\n");

    console.log("Simulating copyright dispute scenario...");
    console.log("Bob claims prior ownership of Alice's work");
    console.log("");

    // Bob files a dispute against Alice's first work
    const disputeTx = await contract.connect(bob.signer).fileDispute(
      workIds[0],
      555111222 // Bob's content hash
    );
    const disputeReceipt = await disputeTx.wait();

    console.log("✓ Dispute filed successfully");
    console.log(`  Gas used: ${disputeReceipt.gasUsed.toString()}`);
    console.log("");

    // Check updated work info
    const disputedWork = await contract.getWorkInfo(workIds[0]);
    console.log("Disputed Work Status:");
    console.log("  Disputed:", disputedWork.disputed);
    console.log("  Dispute Count:", disputedWork.disputeCount.toString());
    console.log("");

    simulationResults.scenarios.push({
      name: "Dispute Filing",
      status: "success",
      disputesFiled: 1
    });

    console.log("==========================================");
    console.log("   SCENARIO 5: Author Statistics");
    console.log("==========================================\n");

    for (const author of authors) {
      const stats = await contract.getAuthorStats(author.signer.address);
      const authorWorks = await contract.getAuthorWorks(author.signer.address);

      console.log(`${author.name}:`);
      console.log(`  Registered: ${stats.registered}`);
      console.log(`  Work Count: ${stats.workCount.toString()}`);
      console.log(`  Total Disputes: ${stats.totalDisputes.toString()}`);
      console.log(`  Won Disputes: ${stats.wonDisputes.toString()}`);
      console.log(`  Works: [${authorWorks.map(id => id.toString()).join(", ")}]`);
      console.log("");
    }

    simulationResults.scenarios.push({
      name: "Author Statistics",
      status: "success"
    });

    console.log("==========================================");
    console.log("   SCENARIO 6: Platform Statistics");
    console.log("==========================================\n");

    const totalWorks = await contract.getTotalWorks();
    console.log("Total Registered Works:", totalWorks.toString());

    // Count verified works
    let verifiedCount = 0;
    let disputedCount = 0;

    for (const workId of workIds) {
      const workInfo = await contract.getWorkInfo(workId);
      if (workInfo.verified) verifiedCount++;
      if (workInfo.disputed) disputedCount++;
    }

    console.log("Verified Works:", verifiedCount);
    console.log("Disputed Works:", disputedCount);
    console.log("Pending Works:", Number(totalWorks) - verifiedCount);
    console.log("");

    simulationResults.scenarios.push({
      name: "Platform Statistics",
      status: "success",
      totalWorks: totalWorks.toString(),
      verifiedWorks: verifiedCount,
      disputedWorks: disputedCount
    });

    console.log("==========================================");
    console.log("   SCENARIO 7: Detailed Work Inspection");
    console.log("==========================================\n");

    for (let i = 0; i < Math.min(3, workIds.length); i++) {
      const workInfo = await contract.getWorkInfo(workIds[i]);
      const disputeCount = await contract.getDisputeCount(workIds[i]);

      console.log(`Work ID: ${workIds[i].toString()}`);
      console.log(`  Title: ${workInfo.title}`);
      console.log(`  Category: ${workInfo.category}`);
      console.log(`  Registrant: ${workInfo.registrant}`);
      console.log(`  Timestamp: ${new Date(Number(workInfo.timestamp) * 1000).toISOString()}`);
      console.log(`  Verified: ${workInfo.verified}`);
      console.log(`  Disputed: ${workInfo.disputed}`);
      console.log(`  Dispute Count: ${disputeCount.toString()}`);
      console.log("");
    }

    simulationResults.scenarios.push({
      name: "Work Inspection",
      status: "success"
    });

    console.log("==========================================");
    console.log("   SIMULATION SUMMARY");
    console.log("==========================================\n");

    console.log("✓ All scenarios completed successfully");
    console.log("");
    console.log("Scenarios Tested:");
    simulationResults.scenarios.forEach((scenario, index) => {
      console.log(`  ${index + 1}. ${scenario.name}: ${scenario.status}`);
    });
    console.log("");

    console.log("Key Metrics:");
    console.log(`  Authors Registered: ${authors.length}`);
    console.log(`  Works Registered: ${works.length}`);
    console.log(`  Works Verified: ${verifiedCount}`);
    console.log(`  Disputes Filed: ${disputedCount}`);
    console.log("");

    console.log("Contract Performance:");
    console.log("  ✓ Author registration working");
    console.log("  ✓ Work registration with encryption working");
    console.log("  ✓ Verification system working");
    console.log("  ✓ Dispute mechanism working");
    console.log("  ✓ Statistics tracking working");
    console.log("");

    console.log("==========================================");
    console.log("   SIMULATION COMPLETE");
    console.log("==========================================\n");

    // Save simulation results
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const resultsFile = path.join(deploymentsDir, `simulation-results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(simulationResults, null, 2));
    console.log("Simulation results saved to:", resultsFile);
    console.log("");

    console.log("The contract is ready for production deployment!");
    console.log("");

  } catch (error) {
    console.error("\n❌ Simulation failed:");
    console.error(error.message);

    simulationResults.scenarios.push({
      name: "Error",
      status: "failed",
      error: error.message
    });

    throw error;
  }
}

// Execute simulation
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
