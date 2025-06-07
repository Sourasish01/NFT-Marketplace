// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NFTMarketplaceModule", (m) => {
  const marketplace = m.contract("NFTMarketplace"); // Assuming NFTMarketplace is the name of your contract
  return { marketplace };
});
