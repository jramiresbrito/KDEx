// Mock USDC token deployment
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("mUSDCModule", (m) => {
  const mUSDC = m.contract("Token", [
    "Mock USD Coin",
    "mUSDC",
    10_000_000, // 10M total supply for testing
  ]);

  return { mUSDC };
});
