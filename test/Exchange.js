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
    token1Address,
    token2,
    token2Address,
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
    token1Address = await token1.getAddress();
    token2 = await tokenFixture("Test Token 2", "TTT2", 1_000_000);
    token2Address = await token2.getAddress();
  });

  const approveAndDeposit = async (amount, token, tokenAddress) => {
    await token.connect(deployer).approve(exchangeAddress, tokens(amount));
    await exchange.deposit(tokenAddress, tokens(amount));
  };

  context("Deployment", () => {
    it("Should set the right fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("Should set the right fee percentage", async () => {
      expect(await exchange.feePercentage()).to.equal(feePercentage);
    });
  });

  context("Depositing", () => {
    it("Should deposit tokens to the exchange", async () => {
      expect(await approveAndDeposit(randomValue, token1, token1Address))
        .to.emit(exchange, "Deposit")
        .withArgs(
          deployer.address,
          token1Address,
          tokens(randomValue),
          tokens(randomValue)
        );

      expect(await exchange.balances(deployer.address, token1Address)).to.equal(
        tokens(randomValue)
      );

      expect(await token1.balanceOf(exchangeAddress)).to.equal(
        tokens(randomValue)
      );

      expect(await token1.balanceOf(deployer.address)).to.equal(
        tokens(1_000_000 - randomValue)
      );
    });

    it("Should fail if the amount is zero", async () => {
      await expect(
        approveAndDeposit(0, token1, token1Address)
      ).to.be.revertedWith("Deposit amount must be greater than 0");
    });

    it("Should fail if the sender does not have enough balance", async () => {
      await expect(
        approveAndDeposit(1_000_001, token1, token1Address)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail if the token was not approved", async () => {
      await expect(
        exchange.deposit(token1Address, tokens(randomValue))
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  context("Balances", () => {
    it("Should allow check the user balance", async () => {
      await approveAndDeposit(randomValue, token1, token1Address);
      expect(
        await exchange.balanceOf(deployer.address, token1Address)
      ).to.equal(tokens(randomValue));
    });
  });

  context("Withdrawing", () => {
    beforeEach(async () => {
      await approveAndDeposit(randomValue, token1, token1Address);
    });

    it("Should withdraw tokens from the exchange", async () => {
      expect(await exchange.withdraw(token1Address, tokens(randomValue)))
        .to.emit(exchange, "Withdraw")
        .withArgs(
          deployer.address,
          token1Address,
          tokens(randomValue),
          tokens(randomValue - randomValue)
        );

      expect(
        await exchange.balanceOf(deployer.address, token1Address)
      ).to.equal(tokens(randomValue - randomValue));

      expect(await token1.balanceOf(deployer.address)).to.equal(
        tokens(1_000_000)
      );

      expect(await token1.balanceOf(exchangeAddress)).to.equal(tokens(0));
    });

    it("Should fail if the amount is zero", async () => {
      await expect(exchange.withdraw(token1Address, 0)).to.be.revertedWith(
        "Withdraw amount must be greater than 0"
      );
    });

    it("Should fail if the user does not have enough balance", async () => {
      await expect(
        exchange.withdraw(token1Address, tokens(randomValue + 1))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  context("Making Orders", async () => {
    const structToOrder = (orderArray) => ({
      id: orderArray[0],
      user: orderArray[1],
      tokenGet: orderArray[2],
      amountGet: orderArray[3],
      tokenGiven: orderArray[4],
      amountGiven: orderArray[5],
      timestamp: orderArray[6]
    });

    beforeEach(async () => {
      await approveAndDeposit(randomValue, token1, token1Address);
    });

    it("Should make an order", async () => {
      const tx = await exchange.makeOrder(
        token2Address,
        tokens(randomValue / 2),
        token1Address,
        tokens(randomValue / 2)
      );

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(exchange, "Order")
        .withArgs(
          0,
          deployer.address,
          token2Address,
          tokens(randomValue / 2),
          token1Address,
          tokens(randomValue / 2),
          block.timestamp
        );
      expect(await exchange.totalOrders()).to.equal(1);

      const orderArray = await exchange.orders(0);
      const order = structToOrder(orderArray);

      expect(order).to.deep.equal({
        id: 0,
        user: deployer.address,
        tokenGet: token2Address,
        amountGet: tokens(randomValue / 2),
        tokenGiven: token1Address,
        amountGiven: tokens(randomValue / 2),
        timestamp: block.timestamp
      });
    });

    it("Should fail if the amount get is zero", async () => {
      await expect(
        exchange.makeOrder(
          token2Address,
          0,
          token1Address,
          tokens(randomValue / 2)
        )
      ).to.be.revertedWith("Amount get must be greater than 0");
      expect(await exchange.totalOrders()).to.equal(0);
    });

    it("Should fail if the amount given is zero", async () => {
      await expect(
        exchange.makeOrder(
          token2Address,
          tokens(randomValue / 2),
          token1Address,
          0
        )
      ).to.be.revertedWith("Amount given must be greater than 0");
      expect(await exchange.totalOrders()).to.equal(0);
    });

    it("Should fail if the user does not have enough balance", async () => {
      await expect(
        exchange.makeOrder(
          token2Address,
          tokens(randomValue / 2),
          token1Address,
          tokens(randomValue * 2)
        )
      ).to.be.revertedWith("Insufficient balance");
      expect(await exchange.totalOrders()).to.equal(0);
    });
  });
});
