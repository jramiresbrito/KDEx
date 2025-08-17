import { expect } from "chai";

describe("Token", () => {
  async function tokenFixture(name, symbol, totalSupply) {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(name, symbol, totalSupply);
    return token;
  }

  // By default, hardhat uses the first signer as the owner/deployer
  async function getTokenOwner() {
    const [owner] = await ethers.getSigners();
    return owner;
  }

  context("When the token is deployed", () => {
    let name = "Kempaf Decentralized Exchange";
    let symbol = "KDEX";
    let totalSupply = 1_000_000;

    let token, owner, randomValue, transferAmount;

    beforeEach(async () => {
      token = await tokenFixture(name, symbol, totalSupply);
      owner = await getTokenOwner();
      randomValue = Math.floor(Math.random() * 1000);
      transferAmount = ethers.parseEther(randomValue.toString());
    });

    it("Should set the right name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("Should set the right symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it("Should set the right total supply", async () => {
      const expectedTotalSupplyInEther = ethers.parseUnits("1000000", "ether");
      const expectedTotalSupplyInGwei = ethers.parseUnits(
        "1000000000000000",
        "gwei"
      );
      const expectedTotalSupplyInWei = ethers.parseUnits(
        "1000000000000000000000000",
        "wei"
      );

      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInEther);
      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInGwei);
      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInWei);
    });

    it("Should set the right balance of the owner", async () => {
      const expectedBalance = ethers.parseUnits("1000000", "ether");

      expect(await token.totalSupply()).to.equal(expectedBalance);
      expect(await token.balanceOf(owner.address)).to.equal(expectedBalance);

      // Verify other random addresses have zero balance
      const signers = await ethers.getSigners();
      for (let i = 1; i < Math.min(signers.length, 5); i++) {
        expect(await token.balanceOf(signers[i].address)).to.equal(0);
      }
    });

    it("Should fail if the sender does not have enough balance", async () => {
      const [_owner, sender, receiver] = await ethers.getSigners();

      await expect(
        token.connect(sender).transfer(receiver.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");

      expect(await token.balanceOf(sender.address)).to.equal(0);
      expect(await token.balanceOf(receiver.address)).to.equal(0);
    });

    it("Should fail if the receiver is the zero address", async () => {
      await expect(
        token.connect(owner).transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Cannot transfer to the zero address");
    });

    it("Should transfer tokens between accounts", async () => {
      const receiver = (await ethers.getSigners())[1];

      // Perform the transfer
      expect(
        await token.connect(owner).transfer(receiver.address, transferAmount)
      )
        .to.emit(token, "Transfer")
        .withArgs(owner.address, receiver.address, transferAmount);

      // Calculate expected balances
      const expectedOwnerBalance = (await token.totalSupply()) - transferAmount;

      expect(await token.balanceOf(owner.address)).to.equal(
        expectedOwnerBalance
      );
      expect(await token.balanceOf(receiver.address)).to.equal(transferAmount);
    });

    it("Should fail approve the zero address", async () => {
      await expect(
        token.connect(owner).approve(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Cannot approve the zero address");
    });

    it("Should approve the spender if the value is zero", async () => {
      const [_owner, spender] = await ethers.getSigners();

      await expect(token.connect(owner).approve(spender.address, 0))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, 0);

      expect(await token.allowance(owner.address, spender.address)).to.equal(0);
    });

    it("Should approve the spender if the value is greater than zero", async () => {
      const [_owner, spender] = await ethers.getSigners();

      await expect(token.connect(owner).approve(spender.address, transferAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, transferAmount);

      expect(await token.allowance(owner.address, spender.address)).to.equal(
        transferAmount
      );
    });
  });
});
