// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPersonalImageGallery {
    struct Image {
        string description;
        string base64EncodedImage;
    }

    function getImage(uint256 index) external view returns (Image memory);

    function getImageCount() external view returns (uint256);

    // Pass through all other functions so we can use this address as a proxy
    function addImage(
        string memory description,
        string memory base64EncodedImage
    ) external;

    function deleteImage(uint256 index) external;

    function getImages() external view returns (Image[] memory);
}

contract GalleryMinter is ERC1155, Ownable {
    IPersonalImageGallery public personalImageGallery;
    error ImageIndexOutOfBounds();
    error GalleryAlreadySet();
    error GalleryNotSet();

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function setGallery(address _gallery) external onlyOwner {
        if (address(personalImageGallery) != address(0)) {
            revert GalleryAlreadySet();
        }
        personalImageGallery = IPersonalImageGallery(_gallery);
    }

    function mint(address to, uint256 imageIndex, uint256 amount) public {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        if (imageIndex >= personalImageGallery.getImageCount()) {
            revert ImageIndexOutOfBounds();
        }
        _mint(to, imageIndex, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        if (tokenId >= personalImageGallery.getImageCount()) {
            revert ImageIndexOutOfBounds();
        }

        IPersonalImageGallery.Image memory image = personalImageGallery
            .getImage(tokenId);
        return
            string.concat(
                '{"name": "Gallery NFT #',
                _toString(tokenId),
                '", "description": "',
                image.description,
                '", "image": "',
                image.base64EncodedImage,
                '"}'
            );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function addImage(
        string memory description,
        string memory base64EncodedImage
    ) external onlyOwner {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        personalImageGallery.addImage(description, base64EncodedImage);
    }

    function deleteImage(uint256 index) external onlyOwner {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        personalImageGallery.deleteImage(index);
    }

    function getImages()
        external
        view
        returns (IPersonalImageGallery.Image[] memory)
    {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        return personalImageGallery.getImages();
    }

    function getImageCount() external view returns (uint256) {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        return personalImageGallery.getImageCount();
    }

    function getImage(
        uint256 index
    ) external view returns (IPersonalImageGallery.Image memory) {
        if (address(personalImageGallery) == address(0)) {
            revert GalleryNotSet();
        }
        return personalImageGallery.getImage(index);
    }
}
