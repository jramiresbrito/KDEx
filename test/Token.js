import { expect } from "chai";

describe("Token", () => {
  it("Should set the right name", async () => {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    expect(await token.name()).to.equal("KDEX");
  });
});
