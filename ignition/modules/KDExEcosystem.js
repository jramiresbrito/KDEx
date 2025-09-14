// Complete KDEx ecosystem deployment
// Deploys all tokens and the exchange in one go

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("KDExEcosystemModule", (m) => {
  // Deploy all tokens
  const kdexToken = m.contract("Token", [
    "Kempaf Decentralized Exchange",
    "KDEX",
    1_000_000_000,
  ], { id: "KDEX" });

  const mUSDT = m.contract("Token", [
    "Mock Tether USD",
    "mUSDT",
    10_000_000,
  ], { id: "mUSDT" });

  const mUSDC = m.contract("Token", [
    "Mock USD Coin",
    "mUSDC",
    10_000_000,
  ], { id: "mUSDC" });

  const mETH = m.contract("Token", [
    "Mock Ether",
    "mETH",
    1_000_000,
  ], { id: "mETH" });

  // Deploy Exchange
  const deployer = m.getAccount(0);  // First signer (deployer)
  const feeAccount = m.getParameter("feeAccount", deployer); // Default to deployer
  const feePercentage = m.getParameter("feePercentage", 1);

  const exchange = m.contract("Exchange", [
    feeAccount,
    feePercentage,
  ], { id: "KDEXe" });

  return {
    kdexToken,
    mUSDT,
    mUSDC,
    mETH,
    exchange
  };
});
