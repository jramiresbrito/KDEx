import chai from "chai";

const { expect } = chai;

describe("Token", function () {
  it("Should set the right name", async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    expect(await token.name()).to.equal("KDEX");
  });
});