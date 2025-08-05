import { expect } from "chai";

describe("Token", () => {
  async function tokenFixture(name, symbol, totalSupply) {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(name, symbol, totalSupply);
    return token;
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
  });
});
