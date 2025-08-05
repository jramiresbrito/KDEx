import { expect } from "chai";

describe("Token", () => {
  it("Should set the right name", async () => {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    expect(await token.name()).to.equal("Kempaf Decentralized Exchange");
  });

  it("Should set the right symbol", async () => {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    expect(await token.symbol()).to.equal("KDEX");
  });

  it("Should set the right decimals", async () => {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    expect(await token.decimals()).to.equal(18);
  });
});
