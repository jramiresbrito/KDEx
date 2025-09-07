import { expect } from "chai";

async function exchangeFixture(feeAccount) {
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(feeAccount);
  return exchange;
}

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
}

describe("Exchange", async () => {
  let exchange, deployer, feeAccount;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];

    exchange = await exchangeFixture(feeAccount);
  });

  context("Deployment", () => {
    it("Should set the right fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
  });
});
