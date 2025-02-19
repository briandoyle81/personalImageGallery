// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./PersonalImageGallery.sol";
import "./GalleryMinter.sol";

contract MinterFactory {
    event GalleryCreated(
        address indexed owner,
        address gallery,
        address minter
    );
    error DeploymentFailed();

    mapping(address => address[]) userToMinterGalleries;

    function createGalleryAndMinter()
        public
        returns (address gallery, address minter)
    {
        // Deploy GalleryMinter first, owned by factory
        GalleryMinter galleryMinter = new GalleryMinter(address(this));
        if (address(galleryMinter) == address(0)) {
            revert DeploymentFailed();
        }

        // Deploy PersonalImageGallery, owned by the minter
        PersonalImageGallery personalImageGallery = new PersonalImageGallery(
            address(galleryMinter)
        );
        if (address(personalImageGallery) == address(0)) {
            revert DeploymentFailed();
        }

        // Set the gallery (this will work because factory owns the minter)
        galleryMinter.setGallery(address(personalImageGallery));

        // Transfer minter ownership to msg.sender
        galleryMinter.transferOwnership(msg.sender);

        emit GalleryCreated(
            msg.sender,
            address(personalImageGallery),
            address(galleryMinter)
        );
        userToMinterGalleries[msg.sender].push(address(personalImageGallery));
        return (address(personalImageGallery), address(galleryMinter));
    }

    function getGalleries(
        address _owner
    ) public view returns (address[] memory) {
        return userToMinterGalleries[_owner];
    }
}
