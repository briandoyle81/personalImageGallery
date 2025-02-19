import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MinterFactory", (m) => {
  const minterFactory = m.contract("MinterFactory");

  return { minterFactory };
});
