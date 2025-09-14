// KDEx Ecosystem Seed Script
// Creates realistic trading scenario with multiple users and orders

import fs from 'fs';

// Helper function to parse token amounts
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

// Helper function to get deployed contract addresses
function getDeployedAddresses() {
  const deploymentPath = 'ignition/deployments/chain-31337/deployed_addresses.json';

  if (!fs.existsSync(deploymentPath)) {
    throw new Error('Deployment file not found. Please deploy contracts first with: npx hardhat ignition deploy ignition/modules/KDExEcosystem.js --network localhost');
  }

  const deployed = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  return {
    KDEX: deployed["KDExEcosystemModule#KDEX"],
    mUSDT: deployed["KDExEcosystemModule#mUSDT"],
    mUSDC: deployed["KDExEcosystemModule#mUSDC"],
    mETH: deployed["KDExEcosystemModule#mETH"],
    Exchange: deployed["KDExEcosystemModule#KDEXe"],
  };
}

async function main() {
  console.log("🌱 Starting KDEx ecosystem seeding...\n");

  // 1. Setup users and contracts
  console.log("👥 Setting up users...");
  const [deployer, feeAccount, user1, user2] = await ethers.getSigners();

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Fee Account: ${feeAccount.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}\n`);

  // Get deployed contract addresses
  const addresses = getDeployedAddresses();
  console.log("📄 Contract addresses:");
  Object.entries(addresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  console.log("");

  // Get contract instances
  const kdexToken = await ethers.getContractAt("Token", addresses.KDEX);
  const mUSDT = await ethers.getContractAt("Token", addresses.mUSDT);
  const mUSDC = await ethers.getContractAt("Token", addresses.mUSDC);
  const mETH = await ethers.getContractAt("Token", addresses.mETH);
  const exchange = await ethers.getContractAt("Exchange", addresses.Exchange);

  // 2. Distribute tokens to users
  console.log("💰 Distributing tokens to users...");

  // Transfer to user1
  await kdexToken.transfer(user1.address, tokens(50_000));   // 50k KDEX
  await mUSDT.transfer(user1.address, tokens(10_000));       // 10k mUSDT
  await mUSDC.transfer(user1.address, tokens(10_000));       // 10k mUSDC
  await mETH.transfer(user1.address, tokens(5));             // 5 mETH

  // Transfer to user2
  await mUSDT.transfer(user2.address, tokens(15_000));       // 15k mUSDT
  await mUSDC.transfer(user2.address, tokens(15_000));       // 15k mUSDC
  await mETH.transfer(user2.address, tokens(10));            // 10 mETH

  console.log("✅ Token distribution complete\n");

  // 3. Helper function for approve and deposit
  const approveAndDeposit = async (user, token, amount) => {
    await token.connect(user).approve(addresses.Exchange, amount);
    await exchange.connect(user).deposit(await token.getAddress(), amount);
  };

  // 4. Users deposit tokens to exchange
  console.log("🏦 Users depositing tokens to exchange...");

  // User1 deposits
  await approveAndDeposit(user1, kdexToken, tokens(20_000));  // 20k KDEX
  await approveAndDeposit(user1, mUSDT, tokens(5_000));       // 5k mUSDT
  await approveAndDeposit(user1, mUSDC, tokens(5_000));       // 5k mUSDC
  await approveAndDeposit(user1, mETH, tokens(2));            // 2 mETH

  // User2 deposits
  await approveAndDeposit(user2, mUSDT, tokens(8_000));       // 8k mUSDT
  await approveAndDeposit(user2, mUSDC, tokens(8_000));       // 8k mUSDC
  await approveAndDeposit(user2, mETH, tokens(5));            // 5 mETH

  console.log("✅ Deposits complete\n");

  // 5. Create variety of orders for user1
  console.log("📋 Creating orders for user1...");

  const user1Orders = [
    // KDEX trading pairs
    { tokenGet: addresses.mUSDT, amountGet: 1000, tokenGive: addresses.KDEX, amountGive: 500 },
    { tokenGet: addresses.mUSDC, amountGet: 800, tokenGive: addresses.KDEX, amountGive: 400 },
    { tokenGet: addresses.mETH, amountGet: 1, tokenGive: addresses.KDEX, amountGive: 2000 },

    // Stablecoin pairs
    { tokenGet: addresses.mUSDC, amountGet: 1000, tokenGive: addresses.mUSDT, amountGive: 1000 },
    { tokenGet: addresses.mETH, amountGet: 1, tokenGive: addresses.mUSDT, amountGive: 2500 },
  ];

  for (let i = 0; i < user1Orders.length; i++) {
    const order = user1Orders[i];
    await exchange.connect(user1).makeOrder(
      order.tokenGet,
      tokens(order.amountGet),
      order.tokenGive,
      tokens(order.amountGive)
    );
    console.log(`📝 User1 Order ${i}: ${order.amountGive} → ${order.amountGet}`);
  }

  console.log("✅ User1 orders created\n");

  // 6. User2 fills some of user1's orders
  console.log("🔄 User2 filling some of user1's orders...");

  // Fill order 0 partially (50%)
  await exchange.connect(user2).fillOrder(0, tokens(500));
  console.log("✅ User2 partially filled order 0 (50%)");

  // Fill order 1 completely
  await exchange.connect(user2).fillOrder(1, tokens(800));
  console.log("✅ User2 completely filled order 1");

  // Fill order 3 partially (30%)
  await exchange.connect(user2).fillOrder(3, tokens(300));
  console.log("✅ User2 partially filled order 3 (30%)");

  console.log("✅ User2 fills complete\n");

  // 7. Create orders for user2
  console.log("📋 Creating orders for user2...");

  const user2Orders = [
    // User2 wants KDEX (doesn't have any)
    { tokenGet: addresses.KDEX, amountGet: 1000, tokenGive: addresses.mUSDT, amountGive: 2000 },
    { tokenGet: addresses.KDEX, amountGet: 800, tokenGive: addresses.mUSDC, amountGive: 1600 },

    // ETH trading
    { tokenGet: addresses.mUSDT, amountGet: 3000, tokenGive: addresses.mETH, amountGive: 1 },
    { tokenGet: addresses.mUSDC, amountGet: 2500, tokenGive: addresses.mETH, amountGive: 1 },
  ];

  for (let i = 0; i < user2Orders.length; i++) {
    const order = user2Orders[i];
    await exchange.connect(user2).makeOrder(
      order.tokenGet,
      tokens(order.amountGet),
      order.tokenGive,
      tokens(order.amountGive)
    );
    console.log(`📝 User2 Order ${i + user1Orders.length}: ${order.amountGive} → ${order.amountGet}`);
  }

  console.log("✅ User2 orders created\n");

  // 8. User1 fills some of user2's orders
  console.log("🔄 User1 filling some of user2's orders...");

  // Fill order 5 partially (50%) - User2 wants KDEX
  await exchange.connect(user1).fillOrder(5, tokens(500));
  console.log("✅ User1 partially filled order 5 (50%)");

  // Fill order 7 completely - User2 wants USDC for ETH
  await exchange.connect(user1).fillOrder(8, tokens(2500));
  console.log("✅ User1 completely filled order 8");

  console.log("✅ User1 fills complete\n");

  // 9. Deployer creates KDEX swap orders (unfilled)
  console.log("🏛️ Deployer creating KDEX swap orders...");

  // First, deployer needs to deposit KDEX tokens
  await approveAndDeposit(deployer, kdexToken, tokens(100_000));

  const deployerOrders = [
    { tokenGet: addresses.mUSDT, amountGet: 5000, tokenGive: addresses.KDEX, amountGive: 10000 },
    { tokenGet: addresses.mUSDC, amountGet: 4000, tokenGive: addresses.KDEX, amountGive: 8000 },
    { tokenGet: addresses.mETH, amountGet: 2, tokenGive: addresses.KDEX, amountGive: 5000 },
  ];

  for (let i = 0; i < deployerOrders.length; i++) {
    const order = deployerOrders[i];
    await exchange.connect(deployer).makeOrder(
      order.tokenGet,
      tokens(order.amountGet),
      order.tokenGive,
      tokens(order.amountGive)
    );
    console.log(`📝 Deployer Order ${i}: ${order.amountGive} KDEX → ${order.amountGet}`);
  }

  console.log("✅ Deployer KDEX swap orders created (unfilled)\n");

  // 10. Summary
  console.log("📊 Seeding Summary:");
  console.log(`Total Orders Created: ${await exchange.totalOrders()}`);

  // Check balances
  console.log("\n💼 Exchange Balances:");
  console.log(`User1 KDEX: ${ethers.formatEther(await exchange.balances(user1.address, addresses.KDEX))}`);
  console.log(`User1 mUSDT: ${ethers.formatEther(await exchange.balances(user1.address, addresses.mUSDT))}`);
  console.log(`User2 mUSDT: ${ethers.formatEther(await exchange.balances(user2.address, addresses.mUSDT))}`);
  console.log(`User2 mETH: ${ethers.formatEther(await exchange.balances(user2.address, addresses.mETH))}`);
  console.log(`Fee Account: ${ethers.formatEther(await exchange.balances(feeAccount.address, addresses.KDEX))}`);

  console.log("\n🎉 KDEx ecosystem seeding complete!");
  console.log("🚀 Your exchange is ready for trading!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
