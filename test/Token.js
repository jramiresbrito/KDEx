import { expect } from "chai";

describe("Token", () => {
  async function tokenFixture(name, symbol, totalSupply) {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(name, symbol, totalSupply);
    return token;
  }

  it("Should set the right attributes", async () => {
    const token = await tokenFixture("Kempaf Decentralized Exchange", "KDEX", 1_000_000);
    expect(await token.name()).to.equal("Kempaf Decentralized Exchange");
    expect(await token.symbol()).to.equal("KDEX");
    expect(await token.decimals()).to.equal(18);
    const expectedTotalSupplyInEther = ethers.parseUnits("1000000", "ether");
    const expectedTotalSupplyInGwei = ethers.parseUnits("1000000000000000", "gwei");
    const expectedTotalSupplyInWei = ethers.parseUnits("1000000000000000000000000", "wei");
    expect(await token.totalSupply()).to.equal(expectedTotalSupplyInEther);
    expect(await token.totalSupply()).to.equal(expectedTotalSupplyInGwei);
    expect(await token.totalSupply()).to.equal(expectedTotalSupplyInWei );
  });
});
