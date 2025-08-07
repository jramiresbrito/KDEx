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

    it("Should set the right name", async () => {
      const token = await tokenFixture(name, symbol, totalSupply);
      expect(await token.name()).to.equal(name);
    });

    it("Should set the right symbol", async () => {
      const token = await tokenFixture(name, symbol, totalSupply);
      expect(await token.symbol()).to.equal(symbol);
    });

    it("Should set the right total supply", async () => {
      const token = await tokenFixture(name, symbol, totalSupply);
      const expectedTotalSupplyInEther = ethers.parseUnits("1000000", "ether");
      const expectedTotalSupplyInGwei = ethers.parseUnits("1000000000000000", "gwei");
      const expectedTotalSupplyInWei = ethers.parseUnits("1000000000000000000000000", "wei");
      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInEther);
      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInGwei);
      expect(await token.totalSupply()).to.equal(expectedTotalSupplyInWei );
    });

    it("Should set the right balance of the owner", async () => {
      const owner = await getTokenOwner();
      const token = await tokenFixture(name, symbol, totalSupply);
      const expectedBalance = ethers.parseUnits("1000000", "ether");

      expect(await token.totalSupply()).to.equal(expectedBalance);
      expect(await token.balanceOf(owner.address)).to.equal(expectedBalance);

      // Verify other random addresses have zero balance
      const signers = await ethers.getSigners();
      for (let i = 1; i < Math.min(signers.length, 5); i++) {
        expect(await token.balanceOf(signers[i].address)).to.equal(0);
      }
    });
  });
});
