const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Comprehensive Test Suite for Anonymous Copyright Protection System
 * Following FHEVM best practices and test patterns
 *
 * Test Coverage:
 * - Deployment and initialization (5 tests)
 * - Author registration (8 tests)
 * - Work registration (10 tests)
 * - Work verification (7 tests)
 * - Dispute management (8 tests)
 * - View functions (4 tests)
 * - Access control (5 tests)
 * - Edge cases (6 tests)
 * - Gas optimization (3 tests)
 *
 * Total: 56 test cases
 */

describe("AnonymousCopyright", function () {
  let contract;
  let owner, alice, bob, charlie, dave;
  let contractAddress;

  // Deployment fixture
  async function deployFixture() {
    const [deployer, user1, user2, user3, user4] = await ethers.getSigners();

    const AnonymousCopyright = await ethers.getContractFactory("AnonymousCopyright");
    const instance = await AnonymousCopyright.deploy();
    await instance.waitForDeployment();

    const address = await instance.getAddress();

    return {
      contract: instance,
      contractAddress: address,
      owner: deployer,
      alice: user1,
      bob: user2,
      charlie: user3,
      dave: user4
    };
  }

  beforeEach(async function () {
    const deployment = await deployFixture();
    contract = deployment.contract;
    contractAddress = deployment.contractAddress;
    owner = deployment.owner;
    alice = deployment.alice;
    bob = deployment.bob;
    charlie = deployment.charlie;
    dave = deployment.dave;
  });

  // ==========================================
  // DEPLOYMENT AND INITIALIZATION (5 tests)
  // ==========================================

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set deployer as owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should initialize with zero work counter", async function () {
      const workCounter = await contract.workCounter();
      expect(workCounter).to.equal(0);
    });

    it("should have correct total works count", async function () {
      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(0);
    });

    it("should return correct contract address", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
      expect(address).to.equal(contractAddress);
    });
  });

  // ==========================================
  // AUTHOR REGISTRATION (8 tests)
  // ==========================================

  describe("Author Registration", function () {
    const authorId = 123456;

    it("should allow user to register as author", async function () {
      const tx = await contract.connect(alice).registerAuthor(authorId);
      await tx.wait();

      const isRegistered = await contract.isRegisteredAuthor(alice.address);
      expect(isRegistered).to.be.true;
    });

    it("should emit AuthorRegistered event", async function () {
      await expect(contract.connect(alice).registerAuthor(authorId))
        .to.emit(contract, "AuthorRegistered")
        .withArgs(alice.address, await ethers.provider.getBlockNumber() + 1);
    });

    it("should initialize author profile correctly", async function () {
      await contract.connect(alice).registerAuthor(authorId);

      const stats = await contract.getAuthorStats(alice.address);
      expect(stats.registered).to.be.true;
      expect(stats.workCount).to.equal(0);
      expect(stats.totalDisputes).to.equal(0);
      expect(stats.wonDisputes).to.equal(0);
    });

    it("should reject registration if already registered", async function () {
      await contract.connect(alice).registerAuthor(authorId);

      await expect(
        contract.connect(alice).registerAuthor(authorId)
      ).to.be.revertedWith("Already registered");
    });

    it("should allow multiple authors to register", async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(charlie).registerAuthor(100003);

      expect(await contract.isRegisteredAuthor(alice.address)).to.be.true;
      expect(await contract.isRegisteredAuthor(bob.address)).to.be.true;
      expect(await contract.isRegisteredAuthor(charlie.address)).to.be.true;
    });

    it("should handle different author IDs", async function () {
      await contract.connect(alice).registerAuthor(1);
      await contract.connect(bob).registerAuthor(999999999);
      await contract.connect(charlie).registerAuthor(0);

      expect(await contract.isRegisteredAuthor(alice.address)).to.be.true;
      expect(await contract.isRegisteredAuthor(bob.address)).to.be.true;
      expect(await contract.isRegisteredAuthor(charlie.address)).to.be.true;
    });

    it("should return false for non-registered authors", async function () {
      const isRegistered = await contract.isRegisteredAuthor(dave.address);
      expect(isRegistered).to.be.false;
    });

    it("should maintain separate author profiles", async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);

      const aliceStats = await contract.getAuthorStats(alice.address);
      const bobStats = await contract.getAuthorStats(bob.address);

      expect(aliceStats.registered).to.be.true;
      expect(bobStats.registered).to.be.true;
      expect(aliceStats.workCount).to.equal(0);
      expect(bobStats.workCount).to.equal(0);
    });
  });

  // ==========================================
  // WORK REGISTRATION (10 tests)
  // ==========================================

  describe("Work Registration", function () {
    const authorId = 123456;
    const contentHash = 987654321;
    const title = "Original Digital Artwork";
    const category = "Digital Art";

    beforeEach(async function () {
      // Register alice as author
      await contract.connect(alice).registerAuthor(authorId);
    });

    it("should allow registered author to register work", async function () {
      const tx = await contract.connect(alice).registerWork(
        contentHash,
        title,
        category
      );
      await tx.wait();

      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(1);
    });

    it("should emit WorkRegistered event", async function () {
      await expect(
        contract.connect(alice).registerWork(contentHash, title, category)
      ).to.emit(contract, "WorkRegistered");
    });

    it("should reject work registration from non-registered author", async function () {
      await expect(
        contract.connect(bob).registerWork(contentHash, title, category)
      ).to.be.revertedWith("Author not registered");
    });

    it("should reject work with empty title", async function () {
      await expect(
        contract.connect(alice).registerWork(contentHash, "", category)
      ).to.be.revertedWith("Title required");
    });

    it("should reject work with empty category", async function () {
      await expect(
        contract.connect(alice).registerWork(contentHash, title, "")
      ).to.be.revertedWith("Category required");
    });

    it("should increment work counter correctly", async function () {
      await contract.connect(alice).registerWork(contentHash, title, category);
      let totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(1);

      await contract.connect(alice).registerWork(111222333, "Work 2", "Category 2");
      totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(2);
    });

    it("should store work information correctly", async function () {
      await contract.connect(alice).registerWork(contentHash, title, category);

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.registrant).to.equal(alice.address);
      expect(workInfo.title).to.equal(title);
      expect(workInfo.category).to.equal(category);
      expect(workInfo.verified).to.be.false;
      expect(workInfo.disputed).to.be.false;
      expect(workInfo.disputeCount).to.equal(0);
    });

    it("should increment author work count", async function () {
      await contract.connect(alice).registerWork(contentHash, title, category);

      const stats = await contract.getAuthorStats(alice.address);
      expect(stats.workCount).to.equal(1);
    });

    it("should add work to author's work list", async function () {
      await contract.connect(alice).registerWork(contentHash, "Work 1", category);
      await contract.connect(alice).registerWork(111222333, "Work 2", category);

      const authorWorks = await contract.getAuthorWorks(alice.address);
      expect(authorWorks.length).to.equal(2);
      expect(authorWorks[0]).to.equal(1);
      expect(authorWorks[1]).to.equal(2);
    });

    it("should allow multiple authors to register works", async function () {
      await contract.connect(bob).registerAuthor(200001);

      await contract.connect(alice).registerWork(111111111, "Alice Work", "Art");
      await contract.connect(bob).registerWork(222222222, "Bob Work", "Music");

      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(2);

      const aliceWorks = await contract.getAuthorWorks(alice.address);
      const bobWorks = await contract.getAuthorWorks(bob.address);

      expect(aliceWorks.length).to.equal(1);
      expect(bobWorks.length).to.equal(1);
    });
  });

  // ==========================================
  // WORK VERIFICATION (7 tests)
  // ==========================================

  describe("Work Verification", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(alice).registerWork(987654321, "Test Work", "Art");
    });

    it("should allow owner to verify work", async function () {
      const tx = await contract.connect(owner).markWorkAsVerified(1);
      await tx.wait();

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.verified).to.be.true;
    });

    it("should emit WorkVerified event", async function () {
      await expect(contract.connect(owner).markWorkAsVerified(1))
        .to.emit(contract, "WorkVerified")
        .withArgs(1, owner.address);
    });

    it("should reject verification from non-owner", async function () {
      await expect(
        contract.connect(alice).markWorkAsVerified(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject verification of invalid work ID", async function () {
      await expect(
        contract.connect(owner).markWorkAsVerified(999)
      ).to.be.revertedWith("Invalid work ID");
    });

    it("should reject verification of work ID zero", async function () {
      await expect(
        contract.connect(owner).markWorkAsVerified(0)
      ).to.be.revertedWith("Invalid work ID");
    });

    it("should allow verification of multiple works", async function () {
      await contract.connect(alice).registerWork(111222333, "Work 2", "Art");

      await contract.connect(owner).markWorkAsVerified(1);
      await contract.connect(owner).markWorkAsVerified(2);

      const work1 = await contract.getWorkInfo(1);
      const work2 = await contract.getWorkInfo(2);

      expect(work1.verified).to.be.true;
      expect(work2.verified).to.be.true;
    });

    it("should maintain verified status after multiple checks", async function () {
      await contract.connect(owner).markWorkAsVerified(1);

      let workInfo = await contract.getWorkInfo(1);
      expect(workInfo.verified).to.be.true;

      // Check again
      workInfo = await contract.getWorkInfo(1);
      expect(workInfo.verified).to.be.true;
    });
  });

  // ==========================================
  // DISPUTE MANAGEMENT (8 tests)
  // ==========================================

  describe("Dispute Management", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(alice).registerWork(987654321, "Alice Work", "Art");
    });

    it("should allow registered author to file dispute", async function () {
      const tx = await contract.connect(bob).fileDispute(1, 111222333);
      await tx.wait();

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.disputed).to.be.true;
      expect(workInfo.disputeCount).to.equal(1);
    });

    it("should emit DisputeFiled event", async function () {
      await expect(contract.connect(bob).fileDispute(1, 111222333))
        .to.emit(contract, "DisputeFiled")
        .withArgs(1, bob.address, 0);
    });

    it("should reject dispute from non-registered author", async function () {
      await expect(
        contract.connect(charlie).fileDispute(1, 111222333)
      ).to.be.revertedWith("Author not registered");
    });

    it("should reject dispute against own work", async function () {
      await expect(
        contract.connect(alice).fileDispute(1, 987654321)
      ).to.be.revertedWith("Cannot dispute own work");
    });

    it("should reject dispute for invalid work ID", async function () {
      await expect(
        contract.connect(bob).fileDispute(999, 111222333)
      ).to.be.revertedWith("Invalid work ID");
    });

    it("should increment dispute counters", async function () {
      await contract.connect(bob).fileDispute(1, 111222333);

      const aliceStats = await contract.getAuthorStats(alice.address);
      const bobStats = await contract.getAuthorStats(bob.address);

      expect(aliceStats.totalDisputes).to.equal(1);
      expect(bobStats.totalDisputes).to.equal(1);
    });

    it("should allow multiple disputes on same work", async function () {
      await contract.connect(charlie).registerAuthor(100003);

      await contract.connect(bob).fileDispute(1, 111222333);
      await contract.connect(charlie).fileDispute(1, 444555666);

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.disputeCount).to.equal(2);
    });

    it("should return correct dispute count", async function () {
      await contract.connect(bob).fileDispute(1, 111222333);

      const disputeCount = await contract.getDisputeCount(1);
      expect(disputeCount).to.equal(1);
    });
  });

  // ==========================================
  // VIEW FUNCTIONS (4 tests)
  // ==========================================

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(alice).registerWork(987654321, "Alice Work", "Art");
    });

    it("should return correct work information", async function () {
      const workInfo = await contract.getWorkInfo(1);

      expect(workInfo.registrant).to.equal(alice.address);
      expect(workInfo.title).to.equal("Alice Work");
      expect(workInfo.category).to.equal("Art");
      expect(workInfo.verified).to.be.false;
      expect(workInfo.disputed).to.be.false;
    });

    it("should return correct author statistics", async function () {
      const stats = await contract.getAuthorStats(alice.address);

      expect(stats.registered).to.be.true;
      expect(stats.workCount).to.equal(1);
      expect(stats.totalDisputes).to.equal(0);
      expect(stats.wonDisputes).to.equal(0);
    });

    it("should return author works array", async function () {
      await contract.connect(alice).registerWork(111222333, "Work 2", "Music");

      const works = await contract.getAuthorWorks(alice.address);
      expect(works.length).to.equal(2);
      expect(works[0]).to.equal(1);
      expect(works[1]).to.equal(2);
    });

    it("should return empty array for author with no works", async function () {
      const works = await contract.getAuthorWorks(bob.address);
      expect(works.length).to.equal(0);
    });
  });

  // ==========================================
  // ACCESS CONTROL (5 tests)
  // ==========================================

  describe("Access Control", function () {
    beforeEach(async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(alice).registerWork(987654321, "Test Work", "Art");
    });

    it("should allow only owner to verify works", async function () {
      await expect(contract.connect(owner).markWorkAsVerified(1))
        .to.not.be.reverted;
    });

    it("should reject non-owner from verifying works", async function () {
      await expect(
        contract.connect(alice).markWorkAsVerified(1)
      ).to.be.revertedWith("Not authorized");

      await expect(
        contract.connect(bob).markWorkAsVerified(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow only registered authors to register works", async function () {
      await expect(
        contract.connect(bob).registerWork(111222333, "Bob Work", "Art")
      ).to.be.revertedWith("Author not registered");
    });

    it("should allow only registered authors to file disputes", async function () {
      await expect(
        contract.connect(charlie).fileDispute(1, 111222333)
      ).to.be.revertedWith("Author not registered");
    });

    it("should allow anyone to view public information", async function () {
      // Anyone can call view functions
      await expect(contract.connect(dave).getWorkInfo(1)).to.not.be.reverted;
      await expect(contract.connect(dave).getTotalWorks()).to.not.be.reverted;
      await expect(contract.connect(dave).isRegisteredAuthor(alice.address)).to.not.be.reverted;
    });
  });

  // ==========================================
  // EDGE CASES (6 tests)
  // ==========================================

  describe("Edge Cases", function () {
    it("should handle zero author ID", async function () {
      await expect(contract.connect(alice).registerAuthor(0))
        .to.not.be.reverted;

      expect(await contract.isRegisteredAuthor(alice.address)).to.be.true;
    });

    it("should handle maximum uint64 author ID", async function () {
      const maxUint64 = BigInt("18446744073709551615");
      await expect(contract.connect(alice).registerAuthor(maxUint64))
        .to.not.be.reverted;
    });

    it("should handle zero content hash", async function () {
      await contract.connect(alice).registerAuthor(100001);

      await expect(
        contract.connect(alice).registerWork(0, "Zero Hash Work", "Art")
      ).to.not.be.reverted;
    });

    it("should handle maximum uint32 content hash", async function () {
      await contract.connect(alice).registerAuthor(100001);

      const maxUint32 = 4294967295;
      await expect(
        contract.connect(alice).registerWork(maxUint32, "Max Hash Work", "Art")
      ).to.not.be.reverted;
    });

    it("should handle very long title and category", async function () {
      await contract.connect(alice).registerAuthor(100001);

      const longTitle = "A".repeat(200);
      const longCategory = "B".repeat(100);

      await expect(
        contract.connect(alice).registerWork(123456, longTitle, longCategory)
      ).to.not.be.reverted;
    });

    it("should handle special characters in title and category", async function () {
      await contract.connect(alice).registerAuthor(100001);

      await expect(
        contract.connect(alice).registerWork(
          123456,
          "Title with émojis 🎨 and symbols!@#$%",
          "Category-with_special.chars/123"
        )
      ).to.not.be.reverted;
    });
  });

  // ==========================================
  // GAS OPTIMIZATION (3 tests)
  // ==========================================

  describe("Gas Optimization", function () {
    it("should register author with reasonable gas cost", async function () {
      const tx = await contract.connect(alice).registerAuthor(100001);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000); // Less than 300k gas
    });

    it("should register work with reasonable gas cost", async function () {
      await contract.connect(alice).registerAuthor(100001);

      const tx = await contract.connect(alice).registerWork(
        987654321,
        "Test Work",
        "Art"
      );
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(400000); // Less than 400k gas
    });

    it("should file dispute with reasonable gas cost", async function () {
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(alice).registerWork(987654321, "Test Work", "Art");

      const tx = await contract.connect(bob).fileDispute(1, 111222333);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(350000); // Less than 350k gas
    });
  });

  // ==========================================
  // INTEGRATION SCENARIOS (3 tests)
  // ==========================================

  describe("Integration Scenarios", function () {
    it("should handle complete workflow: register, create, verify", async function () {
      // Register author
      await contract.connect(alice).registerAuthor(100001);

      // Create work
      await contract.connect(alice).registerWork(987654321, "Artwork", "Digital Art");

      // Verify work
      await contract.connect(owner).markWorkAsVerified(1);

      // Check final state
      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.verified).to.be.true;
      expect(workInfo.disputed).to.be.false;

      const stats = await contract.getAuthorStats(alice.address);
      expect(stats.workCount).to.equal(1);
    });

    it("should handle multiple authors and works", async function () {
      // Register authors
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(charlie).registerAuthor(100003);

      // Each creates works
      await contract.connect(alice).registerWork(111, "Alice Work 1", "Art");
      await contract.connect(alice).registerWork(222, "Alice Work 2", "Music");
      await contract.connect(bob).registerWork(333, "Bob Work", "Literature");
      await contract.connect(charlie).registerWork(444, "Charlie Work", "Film");

      // Verify totals
      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(4);

      const aliceWorks = await contract.getAuthorWorks(alice.address);
      expect(aliceWorks.length).to.equal(2);

      const bobWorks = await contract.getAuthorWorks(bob.address);
      expect(bobWorks.length).to.equal(1);
    });

    it("should handle dispute workflow", async function () {
      // Setup: Alice creates work, Bob disputes
      await contract.connect(alice).registerAuthor(100001);
      await contract.connect(bob).registerAuthor(100002);
      await contract.connect(alice).registerWork(987654321, "Original", "Art");

      // Bob files dispute
      await contract.connect(bob).fileDispute(1, 111222333);

      // Check dispute state
      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.disputed).to.be.true;
      expect(workInfo.disputeCount).to.equal(1);

      // Check dispute counters
      const aliceStats = await contract.getAuthorStats(alice.address);
      const bobStats = await contract.getAuthorStats(bob.address);

      expect(aliceStats.totalDisputes).to.equal(1);
      expect(bobStats.totalDisputes).to.equal(1);
    });
  });
});
