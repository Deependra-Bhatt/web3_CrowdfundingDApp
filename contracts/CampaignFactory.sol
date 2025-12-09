// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @dev Manages the registry of creators and handles the deployment of new Campaign contracts
 * with required access control and business logic parameters.
 */
contract CampaignFactory {
    // State Variables

    address[] public deployedCampaigns;
    // Creator Registry for Access Control
    mapping(address => bool) public isCreator; 

    // Events

    event campaignCreated(
        string title,
        uint requiredAmount,
        address indexed owner,
        address campaignAddress,
        string campaignImage,
        uint indexed timestamp,
        string indexed category
    );
    event CreatorRegistered(address indexed newCreator);

    // Modifiers 

    /**
     * @dev Restricts access to functions to only registered creators.
     */
    modifier onlyCreatorRegistry() {
        require(isCreator[msg.sender], "Factory: Caller is not a registered creator");
        _;
    }

    // Creator Registry Functions 

    /**
     * @dev Allows any address to register themselves as a platform creator.
     */
    function registerAsCreator() public {
        require(!isCreator[msg.sender], "Factory: Already registered as a creator");
        isCreator[msg.sender] = true;
        emit CreatorRegistered(msg.sender);
    }

    // Campaign Deployment Function

    /**
     * @dev Deploys a new Campaign contract. Restricted to registered creators.
     * @param campaignTitle Title of the campaign (for UI).
     * @param campaignRequiredAmount Funding goal (for UI).
     * @param campaignImage Image URL (for UI).
     * @param category Campaign category (for UI).
     * @param campaignStory Detailed story (for UI).
     * @param campaignDeadline Unix timestamp for the campaign's end (New logic parameter).
     * @param platformFeeAddress Address to receive the 5% platform fee (New logic parameter).
     */
    function createCampaign (
        string memory campaignTitle, 
        uint campaignRequiredAmount, 
        string memory campaignImage,
        string memory category, 
        string memory campaignStory,
        uint campaignDeadline,        
        address platformFeeAddress     
    ) public onlyCreatorRegistry  // Access restricted
    {
        // Input validation 
        require(bytes(campaignTitle).length > 0, "Title empty");
        require(campaignRequiredAmount > 0, "Amount zero");
        require(bytes(campaignImage).length > 0, "Image empty");
        require(bytes(campaignStory).length > 0, "Description empty");

        // Deploy the new Campaign contract
        Campaign newCampaign = new Campaign(
            campaignTitle, 
            campaignRequiredAmount, 
            campaignImage,
            campaignStory, 
            msg.sender,             // campaignOwner 
            category,
            campaignDeadline,       
            platformFeeAddress      
        );
        
        deployedCampaigns.push(address(newCampaign));

        // Emit event
        emit campaignCreated(
            campaignTitle, 
            campaignRequiredAmount, 
            msg.sender, 
            address(newCampaign), 
            campaignImage, 
            block.timestamp, 
            category
        );
    }
    
    /**
     * @dev Helper function to get all deployed campaign addresses.
     */
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}
