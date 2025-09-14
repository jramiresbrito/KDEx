// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ExchangeModule", (m) => {
  // Get deployer account dynamically
  const deployer = m.getAccount(0);  // First signer (deployer)

  // Parameters for Exchange deployment
  const feeAccount = m.getParameter("feeAccount", deployer); // Default to deployer
  const feePercentage = m.getParameter("feePercentage", 1); // 1% default fee

  const exchange = m.contract("Exchange", [
    feeAccount,
    feePercentage,
  ]);

  return { exchange };
});
