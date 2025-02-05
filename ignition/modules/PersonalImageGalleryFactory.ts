// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PersonalImageGalleryFactoryModule = buildModule("PersonalImageGalleryFactory", (m) => {

  const personalImageGalleryFactory = m.contract("PersonalImageGalleryFactory", [], {});

  return { personalImageGalleryFactory };
});

export default PersonalImageGalleryFactoryModule;
