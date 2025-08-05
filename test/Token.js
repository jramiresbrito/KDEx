import { expect } from "chai";

describe("Token", () => {
  async function tokenFixture() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    return token;
  }

  it("Should set the right name", async () => {
    const token = await tokenFixture();
    expect(await token.name()).to.equal("Kempaf Decentralized Exchange");
  });

  it("Should set the right symbol", async () => {
    const token = await tokenFixture();
    expect(await token.symbol()).to.equal("KDEX");
  });

  it("Should set the right decimals", async () => {
    const token = await tokenFixture();
    expect(await token.decimals()).to.equal(18);
  });
});
