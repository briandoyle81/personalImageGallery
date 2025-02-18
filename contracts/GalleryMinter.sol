// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IPersonalImageGallery {
    function getImage(uint256 index) external view returns (string memory);

    function getImageCount() external view returns (uint256);
}

contract GalleryMinter is ERC721 {
    uint public counter = 0;
    IPersonalImageGallery personalImageGallery;

    error ImageIndexOutOfBounds();

    mapping(uint256 => uint256) public imageIndexToTokenId;

    constructor(
        string memory _name,
        string memory _symbol,
        address _personalImageGallery
    ) ERC721(_name, _symbol) {
        personalImageGallery = IPersonalImageGallery(_personalImageGallery);
    }

    function mint(address to, uint256 imageIndex) public {
        if (imageIndex >= personalImageGallery.getImageCount()) {
            revert ImageIndexOutOfBounds();
        }
        counter++;
        imageIndexToTokenId[imageIndex] = counter;
        _mint(to, counter);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // return personalImageGallery.getImage(imageIndexToTokenId[tokenId]);
        This needs to return a json file with the image in it
    }
}
