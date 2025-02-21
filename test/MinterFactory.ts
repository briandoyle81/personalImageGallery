import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";
import { type GalleryMinter, type PersonalImageGallery } from "../typechain-types";

describe("MinterFactory", function () {
  async function deployMinterFactoryFixture() {
    const [account1, account2] = await hre.viem.getWalletClients();
    const minterFactory = await hre.viem.deployContract("MinterFactory");
    const publicClient = await hre.viem.getPublicClient();

    return {
      minterFactory,
      account1,
      account2,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should create gallery and minter with correct ownership", async function () {
      const { minterFactory, account1, publicClient } = await loadFixture(
        deployMinterFactoryFixture
      );

      const minterFactoryAsAccount1 = await hre.viem.getContractAt(
        "MinterFactory",
        minterFactory.address,
        { client: { wallet: account1 } }
      );

      const tx = await minterFactoryAsAccount1.write.createGalleryAndMinter([
        account1.account.address
      ]);

      const logs = await publicClient.getContractEvents({
        abi: minterFactory.abi,
        address: minterFactory.address,
        eventName: "GalleryCreated",
      });

      expect(logs.length).to.equal(1);
      const event = logs[0];
      
      if (!event.args.owner || !event.args.gallery || !event.args.minter) {
        throw new Error("Missing event args");
      }

      expect(getAddress(event.args.owner)).to.equal(
        getAddress(account1.account.address)
      );
      
      const personalImageGallery = await hre.viem.getContractAt<PersonalImageGallery>(
        "PersonalImageGallery",
        event.args.gallery
      );
      const galleryMinter = await hre.viem.getContractAt<GalleryMinter>(
        "GalleryMinter",
        event.args.minter
      );

      // Verify ownership
      expect(getAddress(await galleryMinter.read.owner())).to.equal(
        getAddress(account1.account.address)
      );
      expect(getAddress(await personalImageGallery.read.owner())).to.equal(
        getAddress(event.args.minter)
      );

      // Test the integration
      const minterAsOwner = await hre.viem.getContractAt<GalleryMinter>(
        "GalleryMinter",
        event.args.minter,
        { client: { wallet: account1 } }
      );

      await minterAsOwner.write.addImage(["Test Description", "Test Image"]);
      await minterAsOwner.write.mint([account1.account.address, 0n, 1n]);

      expect(await galleryMinter.read.balanceOf([account1.account.address, 0n])).to.equal(1n);
      
      const uri = await galleryMinter.read.uri([0n]);
      expect(uri).to.include("Test Image");
      expect(uri).to.include("Test Description");
    });

    it("Should not allow setting gallery address twice", async function () {
      const { minterFactory, account1, publicClient } = await loadFixture(
        deployMinterFactoryFixture
      );

      const minterFactoryAsAccount1 = await hre.viem.getContractAt(
        "MinterFactory",
        minterFactory.address,
        { client: { wallet: account1 } }
      );

      await minterFactoryAsAccount1.write.createGalleryAndMinter([
        account1.account.address
      ]);

      const logs = await publicClient.getContractEvents({
        abi: minterFactory.abi,
        address: minterFactory.address,
        eventName: "GalleryCreated",
      });

      if (!logs[0].args.minter) {
        throw new Error("Missing minter address in event");
      }

      // Get GalleryMinter instance with the correct wallet
      const galleryMinter = await hre.viem.getContractAt(
        "GalleryMinter",
        logs[0].args.minter,
        { client: { wallet: account1 } }
      );

      await expect(
        galleryMinter.write.setGallery([account1.account.address])
      ).to.be.rejectedWith("GalleryAlreadySet");
    });
  });
}); 