// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PersonalImageGallery is Ownable {
    struct Image {
        string description;
        string base64EncodedImage;
    }

    Image[] public images;

    constructor(address _owner) Ownable(_owner) {}

    function addImage(
        string memory _description,
        string memory _base64EncodedImage
    ) public onlyOwner {
        images.push(Image(_description, _base64EncodedImage));
    }

    // @dev LOL
    function deleteImage(uint256 index) public onlyOwner {
        require(index < images.length, "Index out of bounds");
        for (uint256 i = index; i < images.length - 1; i++) {
            images[i] = images[i + 1];
        }
        images.pop();
    }

    function getImages() public view returns (Image[] memory) {
        return images;
    }
}
