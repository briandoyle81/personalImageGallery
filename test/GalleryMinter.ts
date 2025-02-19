import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("GalleryMinter", function () {
  async function deployGalleryMinterFixture() {
    const [account1, account2] = await hre.viem.getWalletClients();

    // First deploy GalleryMinter
    const galleryMinter = await hre.viem.deployContract("GalleryMinter", [
      account1.account.address,
    ]);

    // Then deploy PersonalImageGallery owned by the minter
    const personalImageGallery = await hre.viem.deployContract("PersonalImageGallery", [
      galleryMinter.address,  // Make the minter the owner
    ]);

    // Set the gallery in the minter
    await galleryMinter.write.setGallery([personalImageGallery.address]);

    // Add test images through the minter
    const minterAsOwner = await hre.viem.getContractAt(
      "GalleryMinter",
      galleryMinter.address,
      { client: { wallet: account1 } }
    );

    await minterAsOwner.write.addImage(["First Image", "Test Image 1"]);
    await minterAsOwner.write.addImage(["Second Image", "Test Image 2"]);

    return {
      galleryMinter,
      personalImageGallery,
      account1,
      account2,
    };
  }

  describe("Minting", function () {
    it("Should allow anyone to mint tokens", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account2.account.address, 0n, 5n]);

      expect(await galleryMinter.read.balanceOf([account2.account.address, 0n])).to.equal(5n);
    });

    it("Should allow minting multiple different tokens", async function () {
      const { galleryMinter, account1 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account1.account.address, 0n, 3n]);
      await galleryMinter.write.mint([account1.account.address, 1n, 2n]);

      expect(await galleryMinter.read.balanceOf([account1.account.address, 0n])).to.equal(3n);
      expect(await galleryMinter.read.balanceOf([account1.account.address, 1n])).to.equal(2n);
    });

    it("Should revert when minting with invalid image index", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await expect(
        galleryMinter.write.mint([account2.account.address, 99n, 1n])
      ).to.be.rejectedWith("ImageIndexOutOfBounds");
    });
  });

  describe("URI", function () {
    it("Should return correct token URI", async function () {
      const { galleryMinter, account2 } = await loadFixture(
        deployGalleryMinterFixture
      );

      await galleryMinter.write.mint([account2.account.address, 0n, 1n]);
      
      const uri = await galleryMinter.read.uri([0n]);
      expect(uri).to.include("Test Image 1");
      expect(uri).to.include("First Image");
      expect(uri).to.include("Gallery NFT #0");
    });

    it("Should revert for invalid token ID", async function () {
      const { galleryMinter } = await loadFixture(
        deployGalleryMinterFixture
      );

      await expect(
        galleryMinter.read.uri([99n])
      ).to.be.rejectedWith("ImageIndexOutOfBounds");
    });
  });

  describe("Gallery Functions", function () {
    it("Should add and retrieve images through minter", async function () {
      const { galleryMinter, account1 } = await loadFixture(
        deployGalleryMinterFixture
      );

      const minterAsOwner = await hre.viem.getContractAt(
        "GalleryMinter",
        galleryMinter.address,
        { client: { wallet: account1 } }
      );

      await minterAsOwner.write.addImage(["New Image", "Test Image Data"]);

      const images = await galleryMinter.read.getImages();
      expect(images.length).to.equal(3); // Including the 2 images from fixture
      expect(images[2].description).to.equal("New Image");
      expect(images[2].base64EncodedImage).to.equal("Test Image Data");
    });

    it("Should delete images through minter", async function () {
      const { galleryMinter, account1 } = await loadFixture(
        deployGalleryMinterFixture
      );

      const minterAsOwner = await hre.viem.getContractAt(
        "GalleryMinter",
        galleryMinter.address,
        { client: { wallet: account1 } }
      );

      await minterAsOwner.write.deleteImage([0n]);

      const images = await galleryMinter.read.getImages();
      expect(images.length).to.equal(1);
      expect(images[0].description).to.equal("Second Image");
    });

    it("Should get image count through minter", async function () {
      const { galleryMinter } = await loadFixture(
        deployGalleryMinterFixture
      );

      expect(await galleryMinter.read.getImageCount()).to.equal(2n); // From fixture
      
      await galleryMinter.write.addImage(["New Image", "Test Image Data"]);
      expect(await galleryMinter.read.getImageCount()).to.equal(3n);
      
      await galleryMinter.write.deleteImage([0n]);
      expect(await galleryMinter.read.getImageCount()).to.equal(2n);
    });

    it("Should get single image through minter", async function () {
      const { galleryMinter } = await loadFixture(
        deployGalleryMinterFixture
      );

      const image = await galleryMinter.read.getImage([0n]);
      expect(image.description).to.equal("First Image");
      expect(image.base64EncodedImage).to.equal("Test Image 1");
    });

    it("Should revert when getting invalid image index", async function () {
      const { galleryMinter } = await loadFixture(
        deployGalleryMinterFixture
      );

      await expect(
        galleryMinter.read.getImage([99n])
      ).to.be.rejectedWith("ImageIndexOutOfBounds");
    });
  });
});
