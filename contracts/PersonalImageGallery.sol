// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PersonalImageGallery is Ownable {
    struct Image {
        string description;
        string base64EncodedImage;
    }

    Image[] public images;

    error ImageIndexOutOfBounds(uint256 index, uint256 length);

    constructor(address _owner) Ownable(_owner) {}

    function addImage(
        string memory _description,
        string memory _base64EncodedImage
    ) public onlyOwner {
        images.push(Image(_description, _base64EncodedImage));
    }

    function deleteImage(uint256 index) public onlyOwner {
        if (index >= images.length) {
            revert ImageIndexOutOfBounds(index, images.length);
        }
        for (uint256 i = index; i < images.length - 1; i++) {
            images[i] = images[i + 1];
        }
        images.pop();
    }

    function getImages() public view returns (Image[] memory) {
        return images;
    }

    function getImage(uint256 index) public view returns (Image memory) {
        if (index >= images.length) {
            revert ImageIndexOutOfBounds(index, images.length);
        }
        return images[index];
    }

    function getImageCount() public view returns (uint256) {
        return images.length;
    }
}
