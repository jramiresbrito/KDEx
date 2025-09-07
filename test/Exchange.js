import { expect } from "chai";

async function exchangeFixture(feeAccount, feePercentage) {
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(feeAccount, feePercentage);
  return exchange;
}

async function tokenFixture(name, symbol, totalSupply) {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(name, symbol, totalSupply);
  return token;
}

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
  let exchange,
    exchangeAddress,
    deployer,
    feeAccount,
    feePercentage,
    token1,
    tokenAddress,
    randomValue;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    feePercentage = 1;

    randomValue = Math.floor(Math.random() * 1000);

    exchange = await exchangeFixture(feeAccount, feePercentage);
    exchangeAddress = await exchange.getAddress();

    token1 = await tokenFixture("Test Token", "TTT", 1_000_000);
    tokenAddress = await token1.getAddress();
  });

  context("Deployment", () => {
    it("Should set the right fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("Should set the right fee percentage", async () => {
      expect(await exchange.feePercentage()).to.equal(feePercentage);
    });
  });

  context("Depositing", () => {
    const approveAndDeposit = async (amount) => {
      await token1.connect(deployer).approve(exchangeAddress, tokens(amount));
      await exchange.deposit(tokenAddress, tokens(amount));
    };

    it("Should deposit tokens to the exchange", async () => {
      expect(await approveAndDeposit(randomValue)).to.emit(
        exchange,
        "Deposit"
      ).withArgs(deployer.address, tokenAddress, tokens(randomValue));

      expect(await exchange.balances(deployer.address, tokenAddress)).to.equal(
        tokens(randomValue)
      )

      expect(await token1.balanceOf(exchangeAddress)).to.equal(
        tokens(randomValue)
      )

      expect(await token1.balanceOf(deployer.address)).to.equal(
        tokens(1_000_000 - randomValue)
      )
    });

    it("Should fail if the amount is zero", async () => {
      await expect(approveAndDeposit(0)).to.be.revertedWith(
        "Deposit amount must be greater than 0"
      )
    });

    it("Should fail if the sender does not have enough balance", async () => {
      await expect(approveAndDeposit(1_000_001)).to.be.revertedWith(
        "Insufficient balance"
      )
    });
  });
});
