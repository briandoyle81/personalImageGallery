import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { decodeEventLog, getAddress, parseGwei } from "viem";

describe("PersonalImageGallery", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployPersonalImageGalleryFixture() {
    const [owner, otherAccount, secondAccount, thirdAccount] = await hre.viem.getWalletClients();

    const personalImageGallery = await hre.viem.deployContract("PersonalImageGallery", [
      owner.account.address,
    ]);

    const personalImageGalleryFactory = await hre.viem.deployContract("PersonalImageGalleryFactory");

    const publicClient = await hre.viem.getPublicClient();

    return {
      personalImageGallery,
      personalImageGalleryFactory,
      owner,
      otherAccount,
      secondAccount,
      thirdAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should deploy the contract with the right owner", async function () {
      const { personalImageGallery, owner } = await loadFixture(
        deployPersonalImageGalleryFixture
      );

      expect((await personalImageGallery.read.owner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });
  });

  describe("Functionality", function () {
    it("Should allow the owner to add an image", async function () {
      const { personalImageGallery, owner } = await loadFixture(
        deployPersonalImageGalleryFixture
      );

      const image = "QmQ4Hw4wz9oZfjV5JZ4g2F4bQ1e9q6v6Q8Q8H9H5".toLocaleLowerCase();
      const description = "A beautiful image";

      await personalImageGallery.write.addImage([description, image]);

      const images = await personalImageGallery.read.getImages();

      const retreivedImage = images[0];
      expect(retreivedImage.description).to.equal(description);
      expect(retreivedImage.base64EncodedImage).to.equal(image);
    });

    it("Should allow the owner to remove an image", async function () {
      const { personalImageGallery, owner } = await loadFixture(
        deployPersonalImageGalleryFixture
      );

      const image = "QmQ4Hw4wz9oZfjV5JZ4g2F4bQ1e9q6v6Q8Q8H9H5".toLocaleLowerCase();
      const description = "A beautiful image";

      await personalImageGallery.write.addImage([description, image]);

      await personalImageGallery.write.deleteImage([0n]);

      const images = await personalImageGallery.read.getImages();

      expect(images.length).to.equal(0);
    });
  });

  describe("Factory", function () {
    it("Should allow the owner to create a new gallery", async function () {
      const { personalImageGalleryFactory, owner, publicClient } = await loadFixture(
        deployPersonalImageGalleryFixture
      );

      await personalImageGalleryFactory
        .write
        .createPersonalImageGallery([owner.account.address]);

      const logs = await publicClient.getContractEvents({
        abi: personalImageGalleryFactory.abi,
        address: personalImageGalleryFactory.address,
        eventName: "PersonalImageGalleryCreated",
      });

      console.log("logs", logs);

      const decoded = decodeEventLog({
        abi: personalImageGalleryFactory.abi,
        data: logs[0].data,
        topics: logs[0].topics,
      })

      console.log("decoded", decoded);

      const personalImageGallery =
        await hre.viem.getContractAt(
          "PersonalImageGallery",
          decoded.args.gallery,
        );

      expect((await personalImageGallery.read.owner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });
  });
});
