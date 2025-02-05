// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PersonalImageGallery = buildModule("PersonalImageGallery", (m) => {
  const deployer = m.getAccount(0);
  console.log("Deployer address: ", deployer);

  const personalImageGalleryFactory = m.contract("PersonalImageGallery", [deployer], {});

  return { personalImageGalleryFactory };
});

export default PersonalImageGallery;
