import { expect } from "chai";

async function exchangeFixture(feeAccount, feePercentage) {
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(feeAccount, feePercentage);
  return exchange;
}

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
}

describe("Exchange", async () => {
  let exchange, deployer, feeAccount, feePercentage;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    feePercentage = 1;

    exchange = await exchangeFixture(feeAccount, feePercentage);
  });

  context("Deployment", () => {
    it("Should set the right fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("Should set the right fee percentage", async () => {
      expect(await exchange.feePercentage()).to.equal(feePercentage);
    });
  });
});
