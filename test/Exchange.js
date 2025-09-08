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

  const approveAndDeposit = async (amount, token, tokenAddress, user = deployer) => {
    await token.connect(user).approve(exchangeAddress, tokens(amount));
    await exchange.connect(user).deposit(tokenAddress, tokens(amount));
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

  context("Making Orders", () => {
    const structToOrder = (orderArray) => ({
      id: orderArray[0],
      user: orderArray[1],
      tokenGet: orderArray[2],
      amountGet: orderArray[3],
      tokenGiven: orderArray[4],
      amountGiven: orderArray[5],
      timestamp: orderArray[6],
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
        timestamp: block.timestamp,
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

  context("Cancelling Orders", () => {
    beforeEach(async () => {
      await approveAndDeposit(randomValue, token1, token1Address);
      await exchange.makeOrder(
        token2Address,
        tokens(randomValue / 2),
        token1Address,
        tokens(randomValue / 2)
      );
    });

    it("Should cancel an order", async () => {
      const tx = await exchange.cancelOrder(0);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(exchange, "OrderCancelled")
        .withArgs(
          0,
          deployer.address,
          token2Address,
          tokens(randomValue / 2),
          token1Address,
          tokens(randomValue / 2),
          block.timestamp
        );
      expect(await exchange.isOrderCancelled(0)).to.equal(true);
    });

    it("Should fail if the user it not the owner of the order", async () => {
      await expect(
        exchange.connect(feeAccount).cancelOrder(0)
      ).to.be.revertedWith("You are not the owner of this order");
    });

    it("Should fail if the order does not exist", async () => {
      await expect(exchange.cancelOrder(1)).to.be.revertedWith(
        "Order does not exist"
      );
    });

    it("Should fail if the order is already cancelled", async () => {
      await exchange.cancelOrder(0);

      await expect(exchange.cancelOrder(0)).to.be.revertedWith(
        "Order already cancelled"
      );
    });

    it("Should fail if the order is already filled", async () => {
      // Give deployer token2 so they can fill their own order
      await approveAndDeposit(randomValue / 2, token2, token2Address, deployer);

      await exchange.fillOrder(0);

      await expect(exchange.cancelOrder(0)).to.be.revertedWith(
        "Order already filled"
      );
    });
  });

  context("Filling Orders", () => {
    let orderCreator, orderFiller, poorFiller;

    beforeEach(async () => {
      const accounts = await ethers.getSigners();
      orderCreator = accounts[0];
      orderFiller = accounts[2];
      poorFiller = accounts[3];

      // Distribute tokens to test users
      await token2.transfer(orderFiller.address, tokens(randomValue * 2));
      await token2.transfer(poorFiller.address, tokens(50)); // Give poorFiller some token2

      // Order creator deposits token1 and creates order wanting token2
      await approveAndDeposit(randomValue, token1, token1Address, orderCreator);

      await exchange.connect(orderCreator).makeOrder(
        token2Address,           // Creator wants token2
        tokens(randomValue / 2), // Amount wanted
        token1Address,           // Creator gives token1
        tokens(randomValue / 2)  // Amount given
      );

      // Order filler deposits token2 (what the creator wants)
      await approveAndDeposit(randomValue, token2, token2Address, orderFiller);
    });

    it("Should fill an order", async () => {
      const tx = await exchange.connect(orderFiller).fillOrder(0);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(exchange, "OrderFilled")
        .withArgs(
          0,
          orderCreator.address,
          orderFiller.address,
          token2Address,
          tokens(randomValue / 2),
          token1Address,
          tokens(randomValue / 2),
          block.timestamp
        );

      expect(await exchange.isOrderFilled(0)).to.equal(true);

      // Verify balance changes
      expect(await exchange.balances(orderCreator.address, token1Address))
        .to.equal(tokens(randomValue - randomValue / 2)); // Creator lost token1
      expect(await exchange.balances(orderCreator.address, token2Address))
        .to.equal(tokens(randomValue / 2)); // Creator gained token2
      expect(await exchange.balances(orderFiller.address, token2Address))
        .to.equal(tokens(randomValue - randomValue / 2)); // Filler lost token2
      expect(await exchange.balances(orderFiller.address, token1Address))
        .to.equal(tokens(randomValue / 2)); // Filler gained token1
    });

    it("Should fail if the order does not exist", async () => {
      await expect(exchange.fillOrder(1)).to.be.revertedWith(
        "Order does not exist"
      )
    });

    it("Should fail if the order is cancelled", async () => {
      await exchange.connect(orderCreator).cancelOrder(0);  // Creator cancels their order
      await expect(exchange.connect(orderFiller).fillOrder(0)).to.be.revertedWith(
        "Order already cancelled"
      );
    });

    it("Should fail if the order is filled", async () => {
      await exchange.connect(orderFiller).fillOrder(0);  // Filler fills the order
      await expect(exchange.connect(orderFiller).fillOrder(0)).to.be.revertedWith(
        "Order already filled"
      );
    });

    it("Should fail if the user does not have enough balance", async () => {
      // Poor filler has some token2, but not enough to fill the order
      await approveAndDeposit(10, token2, token2Address, poorFiller);
      // Order requires randomValue/2 token2, but poorFiller only has 10

      await expect(exchange.connect(poorFiller).fillOrder(0)).to.be.revertedWith(
        "Insufficient balance"
      );
    });
  });
});
