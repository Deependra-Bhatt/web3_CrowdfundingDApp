//crowdfunding-app-prototype\contracts\Campaign.sol

// SPDX-License-Identifier: Unlicensed

pragma solidity >0.7.0 <=0.9.0;

contract CampaignFactory {
    
    address[] public deployedCampaigns;

    event campaignCreated(
        string title,
        uint requiredAmount,
        address indexed owner,
        address campaignAddress,
        string campaignImage,
        uint indexed timestamp,
        string indexed category
    );

    function createCampaign (
        string memory campaignTitle, 
        uint campaignRequiredAmount, 
        string memory campaignImage,
        string memory category, 
        string memory campaignStory
     ) public 
     {
        // Add these checks to expose errors clearly (if they weren't already added)
    require(bytes(campaignTitle).length > 0, "Title empty");
    require(campaignRequiredAmount > 0, "Amount zero");
    require(bytes(campaignImage).length > 0, "Image empty");
    require(bytes(campaignStory).length > 0, "Story empty");
        Campaign newCampaign = new Campaign(
            campaignTitle, 
            campaignRequiredAmount, 
            campaignImage,
            campaignStory, 
            msg.sender,
            category
            );
        
        deployedCampaigns.push(address(newCampaign));

        // calling event
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
}


contract Campaign {
    string public title;
    uint public requiredAmount;
    string public image;
    string public story;
    address payable public owner;
    uint public receivedAmount;
    string public category;

    event donated(
        address indexed donar, 
        uint indexed amount, 
        uint indexed timestamp
    );

    constructor(
        string memory campaignTitle, 
        uint campaignRequiredAmount, 
        string memory campaignImage, 
        string memory campaignStory,
        address campaignOwner,
        string memory campaignCategory // <--- ADDED: The missing 5th argument

     ) {
        title = campaignTitle;
        requiredAmount = campaignRequiredAmount;
        image = campaignImage;
        story = campaignStory;
        owner = payable(campaignOwner);
        category = campaignCategory; // <--- ADDED: Assign the category

    }

    function donate() public payable {
        require(requiredAmount > receivedAmount,"Required Amount Fulfilled");
        owner.transfer(msg.value);
        receivedAmount += msg.value;
        //requiredAmount -= msg.value;
        emit donated(msg.sender, msg.value, block.timestamp);
    }

}