import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("GalleryMinter", function () {
  async function deployGalleryMinterFixture() {
    const [account1, account2] = await hre.viem.getWalletClients();

    // First deploy a PersonalImageGallery
    const personalImageGallery = await hre.viem.deployContract("PersonalImageGallery", [
      account1.account.address,
    ]);

    // Add some test images
    await personalImageGallery.write.addImage(["First Image", "Test Image 1"]);
    await personalImageGallery.write.addImage(["Second Image", "Test Image 2"]);

    // Then deploy GalleryMinter
    const galleryMinter = await hre.viem.deployContract("GalleryMinter", [
      "Gallery NFT",
      "GNFT",
      personalImageGallery.address,
    ]);

    return {
      galleryMinter,
      personalImageGallery,
      account1,
      account2,
    };
  }

  describe("Deployment", function () {
    it("Should initialize with counter at 0", async function () {
      const { galleryMinter } = await loadFixture(deployGalleryMinterFixture);
      expect(await galleryMinter.read.counter()).to.equal(0n);
    });
  });

  describe("Minting", function () {
    it("Should allow anyone to mint NFT", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account2.account.address, 0n]);

      expect((await galleryMinter.read.ownerOf([1n])).toLowerCase()).to.equal(
        account2.account.address.toLowerCase()
      );
      expect(await galleryMinter.read.counter()).to.equal(1n);
    });

    it("Should increment counter correctly", async function () {
      const { galleryMinter, account1, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account1.account.address, 0n]);
      await galleryMinter.write.mint([account2.account.address, 1n]);

      expect(await galleryMinter.read.counter()).to.equal(2n);
    });

    it("Should revert when minting with invalid image index", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await expect(
        galleryMinter.write.mint([account2.account.address, 99n])
      ).to.be.rejectedWith("ImageIndexOutOfBounds()");
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account2.account.address, 0n]);
      
      expect(await galleryMinter.read.tokenURI([1n])).to.equal("Test Image 1");
    });

    it("Should map different image indices to different tokens", async function () {
      const { galleryMinter, account1, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account1.account.address, 0n]);
      await galleryMinter.write.mint([account2.account.address, 1n]);
      
      expect(await galleryMinter.read.tokenURI([1n])).to.equal("Test Image 1");
      expect(await galleryMinter.read.tokenURI([2n])).to.equal("Test Image 2");
    });
  });
});
