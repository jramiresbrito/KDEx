// Mock ETH token deployment (Wrapped ETH-like)
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("mETHModule", (m) => {
  const mETH = m.contract("Token", [
    "Mock Ether",
    "mETH",
    1_000_000, // 1M total supply for testing
  ]);

  return { mETH };
});
