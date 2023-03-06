const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.utils.parseUnits(n.toString(), "ether");

describe("Escrow Contract", async () => {
  let lender;
  let inspector;
  let seller;
  let buyer;

  let escrow;
  let realEstate;

  beforeEach(async () => {
    [lender, seller, lender, inspector, buyer] = await ethers.getSigners();

    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();

    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );

    // approve property
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    // list property
    transaction = await escrow
      .connect(seller)
      .list(1, buyer.address, tokens(10), tokens(5));
    await transaction.wait();
  });

  describe("address", async () => {
    it("nft address", async () => {
      expect(await escrow.nftAddress()).to.be.equal(realEstate.address);
    });

    it("seller address", async () => {
      expect(await escrow.seller()).to.be.equal(seller.address);
    });

    it("inspector address", async () => {
      expect(await escrow.inspector()).to.be.equal(inspector.address);
    });

    it("lender address", async () => {
      expect(await escrow.lender()).to.be.equal(lender.address);
    });
  });

  describe("Listing", async () => {
    it("transfer ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });

    it("buyer", async () => {
      expect(await escrow.buyer(1)).to.be.equal(buyer.address);
    });

    it("purchased price", async () => {
      expect(await escrow.purchasedPrice(1)).to.be.equal(tokens(10));
    });

    it("escrow amount", async () => {
      expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5));
    });
  });

  describe("deposit", async () => {
    it("deposit earnest", async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositeEarnest(1, { value: tokens(5) });
      await transaction.wait();
      expect(await escrow.getBalance()).to.be.equal(tokens(5));
    });

    it("inspection pass", async () => {
      const transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(1, true);
      await transaction.wait();

      expect(await escrow.inspectionPassed(1)).to.be.equal(true);
    });

    it("sale approve ", async () => {
      let transaction = await escrow.connect(seller).approve(1);
      await transaction.wait();

      transaction = await escrow.connect(buyer).approve(1);
      await transaction.wait();

      transaction = await escrow.connect(lender).approve(1);
      await transaction.wait();

      expect(await escrow.approval(1, seller.address)).to.be.equal(true);

      expect(await escrow.approval(1, buyer.address)).to.be.equal(true);

      expect(await escrow.approval(1, lender.address)).to.be.equal(true);
    });
  });
});
