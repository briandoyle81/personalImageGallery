import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OWNER_ADDRESS = "0xac5b774D7a700AcDb528048B6052bc1549cd73B9";

export default buildModule("GalleryMinter", (m) => {
  const galleryMinter = m.contract("GalleryMinter", [OWNER_ADDRESS]);

  return { galleryMinter };
});
