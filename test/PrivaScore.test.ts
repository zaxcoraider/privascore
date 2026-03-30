import { expect } from "chai";
import hre from "hardhat";
import { cofhejs, Encryptable, FheTypes } from "cofhejs/node";

describe("PrivaScore", function () {
  let contract: any;
  let owner: any;
  let oracle: any;
  let alice: any;    // user with a score
  let bob: any;      // user without a score
  let lender: any;
  let stranger: any;

  before(async function () {
    [owner, oracle, alice, bob, lender, stranger] = await hre.ethers.getSigners();
    await cofhejs.initializeWithEthers({ provider: hre.ethers.provider });
  });

  beforeEach(async function () {
    const Factory = await hre.ethers.getContractFactory("PrivaScore");
    contract = await Factory.connect(owner).deploy(oracle.address);
    await contract.waitForDeployment();
  });

  // ─── hasScore ─────────────────────────────────────────────────────────────

  it("hasScore returns false before score is assigned", async function () {
    expect(await contract.hasScore(bob.address)).to.equal(false);
  });

  it("hasScore returns true after score is assigned", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(700n)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();
    expect(await contract.hasScore(alice.address)).to.equal(true);
  });

  // ─── Score Assignment ──────────────────────────────────────────────────────

  it("oracle can assign an encrypted score", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(750n)]);
    await expect(
      contract.connect(oracle).updateScore(alice.address, encScore)
    )
      .to.emit(contract, "ScoreUpdated")
      .withArgs(alice.address);
  });

  it("non-oracle cannot update score", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(750n)]);
    await expect(
      contract.connect(stranger).updateScore(alice.address, encScore)
    ).to.be.revertedWithCustomError(contract, "NotOracle");
  });

  // ─── Lender Registration ──────────────────────────────────────────────────

  it("owner can register a lender", async function () {
    await expect(contract.connect(owner).registerLender(lender.address))
      .to.emit(contract, "LenderRegistered")
      .withArgs(lender.address);
    expect(await contract.registeredLenders(lender.address)).to.equal(true);
  });

  it("non-owner cannot register a lender", async function () {
    await expect(
      contract.connect(stranger).registerLender(lender.address)
    ).to.be.revertedWithCustomError(contract, "NotOwner");
  });

  // ─── isEligible ───────────────────────────────────────────────────────────

  it("registered lender can check eligibility — emits EligibilityChecked", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(750n)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();
    await (await contract.connect(owner).registerLender(lender.address)).wait();

    const [encThreshold] = await cofhejs.encrypt([Encryptable.uint32(600n)]);
    await expect(
      contract.connect(lender).isEligible(alice.address, encThreshold)
    )
      .to.emit(contract, "EligibilityChecked")
      .withArgs(alice.address, lender.address);
  });

  it("non-lender cannot check eligibility", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(750n)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();

    const [encThreshold] = await cofhejs.encrypt([Encryptable.uint32(600n)]);
    await expect(
      contract.connect(stranger).isEligible(alice.address, encThreshold)
    ).to.be.revertedWithCustomError(contract, "NotRegisteredLender");
  });

  it("isEligible reverts with NoScoreAssigned for unscored wallet", async function () {
    await (await contract.connect(owner).registerLender(lender.address)).wait();

    const [encThreshold] = await cofhejs.encrypt([Encryptable.uint32(600n)]);
    await expect(
      contract.connect(lender).isEligible(bob.address, encThreshold)
    ).to.be.revertedWithCustomError(contract, "NoScoreAssigned");
  });

  it("getEligCheckHash returns non-zero bytes32 after eligibility check", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(750n)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();
    await (await contract.connect(owner).registerLender(lender.address)).wait();

    const [encThreshold] = await cofhejs.encrypt([Encryptable.uint32(600n)]);
    await (await contract.connect(lender).isEligible(alice.address, encThreshold)).wait();

    const ctHash = await contract.getEligCheckHash(lender.address);
    expect(ctHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  // ─── getMyScoreHash ───────────────────────────────────────────────────────

  it("user can retrieve their own score ctHash", async function () {
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(820n)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();

    const ctHash = await contract.connect(alice).getMyScoreHash();
    expect(ctHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  it("user can unseal their score via cofhejs", async function () {
    const scoreValue = 820n;
    const [encScore] = await cofhejs.encrypt([Encryptable.uint32(scoreValue)]);
    await (await contract.connect(oracle).updateScore(alice.address, encScore)).wait();

    const ctHash = await contract.connect(alice).getMyScoreHash();
    const result = await cofhejs.unseal(BigInt(ctHash), FheTypes.Uint32, alice.address);

    // result is a Result<bigint>; unwrap it
    if (result.error) throw new Error(result.error.message);
    expect(result.data).to.equal(scoreValue);
  });

  it("getMyScoreHash reverts when wallet has no score", async function () {
    await expect(
      contract.connect(alice).getMyScoreHash()
    ).to.be.revertedWithCustomError(contract, "NoScoreAssigned");
  });
});
