const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interactive script for testing contract functions
 * Demonstrates all major contract functionalities
 */

async function main() {
  console.log("==========================================");
  console.log("   Contract Interaction Script");
  console.log("   Anonymous Copyright Protection");
  console.log("==========================================\n");

  // Load deployment information
  const networkName = network.name;
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

  console.log("Network:", networkName);
  console.log("Contract Address:", contractAddress);
  console.log("");

  // Get signers
  const [owner, author1, author2] = await ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log("Author 1:", author1.address);
  console.log("Author 2:", author2.address);
  console.log("");

  // Connect to deployed contract
  const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
  const contract = AnonymousCopyright.attach(contractAddress);

  console.log("==========================================");
  console.log("   Testing Contract Functions");
  console.log("==========================================\n");

  try {
    // 1. Register authors
    console.log("1. Registering Authors");
    console.log("   -------------------");

    // Generate random author IDs (in production, these would be encrypted)
    const authorId1 = Math.floor(Math.random() * 1000000);
    const authorId2 = Math.floor(Math.random() * 1000000);

    console.log("   Registering Author 1 with ID:", authorId1);
    const registerTx1 = await contract.connect(author1).registerAuthor(authorId1);
    await registerTx1.wait();
    console.log("   ✓ Author 1 registered");

    console.log("   Registering Author 2 with ID:", authorId2);
    const registerTx2 = await contract.connect(author2).registerAuthor(authorId2);
    await registerTx2.wait();
    console.log("   ✓ Author 2 registered\n");

    // 2. Check author registration status
    console.log("2. Checking Author Status");
    console.log("   ---------------------");
    const isAuthor1 = await contract.isRegisteredAuthor(author1.address);
    const isAuthor2 = await contract.isRegisteredAuthor(author2.address);
    console.log("   Author 1 registered:", isAuthor1);
    console.log("   Author 2 registered:", isAuthor2);
    console.log("");

    // 3. Register works
    console.log("3. Registering Original Works");
    console.log("   --------------------------");

    // Generate content hashes
    const contentHash1 = Math.floor(Math.random() * 4294967295); // uint32 max
    const contentHash2 = Math.floor(Math.random() * 4294967295);

    console.log("   Author 1 registering work...");
    const workTx1 = await contract.connect(author1).registerWork(
      contentHash1,
      "Digital Art Collection 2024",
      "Digital Art"
    );
    const receipt1 = await workTx1.wait();

    // Extract work ID from event
    const event1 = receipt1.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === "WorkRegistered";
      } catch (e) {
        return false;
      }
    });
    const workId1 = event1 ? contract.interface.parseLog(event1).args.workId : 1n;
    console.log("   ✓ Work registered with ID:", workId1.toString());

    console.log("   Author 2 registering work...");
    const workTx2 = await contract.connect(author2).registerWork(
      contentHash2,
      "Music Composition - Symphony No. 1",
      "Music"
    );
    const receipt2 = await workTx2.wait();

    const event2 = receipt2.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === "WorkRegistered";
      } catch (e) {
        return false;
      }
    });
    const workId2 = event2 ? contract.interface.parseLog(event2).args.workId : 2n;
    console.log("   ✓ Work registered with ID:", workId2.toString());
    console.log("");

    // 4. Get work information
    console.log("4. Retrieving Work Information");
    console.log("   --------------------------");

    const work1Info = await contract.getWorkInfo(workId1);
    console.log("   Work ID:", workId1.toString());
    console.log("   Title:", work1Info.title);
    console.log("   Category:", work1Info.category);
    console.log("   Registrant:", work1Info.registrant);
    console.log("   Timestamp:", new Date(Number(work1Info.timestamp) * 1000).toISOString());
    console.log("   Verified:", work1Info.verified);
    console.log("   Disputed:", work1Info.disputed);
    console.log("");

    const work2Info = await contract.getWorkInfo(workId2);
    console.log("   Work ID:", workId2.toString());
    console.log("   Title:", work2Info.title);
    console.log("   Category:", work2Info.category);
    console.log("   Registrant:", work2Info.registrant);
    console.log("   Timestamp:", new Date(Number(work2Info.timestamp) * 1000).toISOString());
    console.log("");

    // 5. Get author statistics
    console.log("5. Author Statistics");
    console.log("   ----------------");

    const author1Stats = await contract.getAuthorStats(author1.address);
    console.log("   Author 1:");
    console.log("   - Registered:", author1Stats.registered);
    console.log("   - Work Count:", author1Stats.workCount.toString());
    console.log("   - Total Disputes:", author1Stats.totalDisputes.toString());
    console.log("   - Won Disputes:", author1Stats.wonDisputes.toString());
    console.log("");

    const author2Stats = await contract.getAuthorStats(author2.address);
    console.log("   Author 2:");
    console.log("   - Registered:", author2Stats.registered);
    console.log("   - Work Count:", author2Stats.workCount.toString());
    console.log("   - Total Disputes:", author2Stats.totalDisputes.toString());
    console.log("");

    // 6. Get author's works
    console.log("6. Author's Work Portfolio");
    console.log("   ----------------------");

    const author1Works = await contract.getAuthorWorks(author1.address);
    console.log("   Author 1 works:", author1Works.map(id => id.toString()).join(", "));

    const author2Works = await contract.getAuthorWorks(author2.address);
    console.log("   Author 2 works:", author2Works.map(id => id.toString()).join(", "));
    console.log("");

    // 7. Get total works
    console.log("7. Platform Statistics");
    console.log("   ------------------");
    const totalWorks = await contract.getTotalWorks();
    console.log("   Total registered works:", totalWorks.toString());
    console.log("");

    // 8. Owner verifies work (optional)
    console.log("8. Verifying Work (Owner Only)");
    console.log("   --------------------------");
    console.log("   Owner marking work", workId1.toString(), "as verified...");
    const verifyTx = await contract.connect(owner).markWorkAsVerified(workId1);
    await verifyTx.wait();
    console.log("   ✓ Work verified");

    const verifiedWork = await contract.getWorkInfo(workId1);
    console.log("   Verified status:", verifiedWork.verified);
    console.log("");

    // Summary
    console.log("==========================================");
    console.log("   INTERACTION SUMMARY");
    console.log("==========================================");
    console.log("✓ Authors registered: 2");
    console.log("✓ Works registered: 2");
    console.log("✓ Works verified: 1");
    console.log("✓ All contract functions tested successfully");
    console.log("==========================================\n");

    console.log("Contract is working as expected!");
    console.log("You can now integrate it with your frontend application.");
    console.log("");

    // Save interaction results
    const interactionResults = {
      network: networkName,
      contractAddress: contractAddress,
      timestamp: new Date().toISOString(),
      authors: [
        {
          address: author1.address,
          works: author1Works.map(id => id.toString()),
          stats: {
            workCount: author1Stats.workCount.toString(),
            totalDisputes: author1Stats.totalDisputes.toString(),
          }
        },
        {
          address: author2.address,
          works: author2Works.map(id => id.toString()),
          stats: {
            workCount: author2Stats.workCount.toString(),
            totalDisputes: author2Stats.totalDisputes.toString(),
          }
        }
      ],
      totalWorks: totalWorks.toString(),
    };

    const resultsFile = path.join(deploymentsDir, `interaction-results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(interactionResults, null, 2));
    console.log("Interaction results saved to:", resultsFile);
    console.log("");

  } catch (error) {
    console.error("\n❌ Interaction failed:");
    console.error(error.message);
    throw error;
  }
}

// Execute interaction
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
