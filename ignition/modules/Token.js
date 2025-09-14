// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TokenModule", (m) => {
  const token = m.contract("Token", [
    "Kempaf Decentralized Exchange",
    "KDEX",
    1_000_000_000,
  ]);

  return { token };
});
