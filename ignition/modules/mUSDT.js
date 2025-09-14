// Mock USDT token deployment
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("mUSDTModule", (m) => {
  const mUSDT = m.contract("Token", [
    "Mock Tether USD",
    "mUSDT",
    10_000_000, // 10M total supply for testing
  ]);

  return { mUSDT };
});
