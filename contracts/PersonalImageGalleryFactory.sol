// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PersonalImageGallery.sol";

contract PersonalImageGalleryFactory {
    event PersonalImageGalleryCreated(address indexed owner, address gallery);

    mapping(address => address[]) userToGalleries;

    function createPersonalImageGallery(address _owner) public {
        PersonalImageGallery gallery = new PersonalImageGallery(_owner);
        emit PersonalImageGalleryCreated(_owner, address(gallery));
        userToGalleries[_owner].push(address(gallery));
    }

    function getGalleries(
        address _owner
    ) public view returns (address[] memory) {
        return userToGalleries[_owner];
    }
}
