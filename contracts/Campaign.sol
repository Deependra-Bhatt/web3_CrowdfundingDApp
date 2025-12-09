// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title Campaign
 * @dev Manages the crowdfunding campaign, holding funds in escrow and enforcing business logic.
 */
contract Campaign {

    // State Variables
    string public title;
    uint public requiredAmount; 
    string public image;
    string public story;
    address payable public immutable owner;
    uint public receivedAmount;
    uint public escrowBalance; // Current funds available in escrow (used for refunds/withdrawals)
    string public category;
    address public immutable platformFeeAddress;
    uint public deadline;
    
    // Control Flags
    bool public deadlineExtended = false;
    bool public withdrawn = false;

    // Data Structures
    mapping(address => uint) public contributors;

    // Constants (4% fee)
    uint public constant PLATFORM_FEE_PERCENTAGE = 4;

    // STRUCT FOR FRONTEND SUMMARY 
    struct CampaignDetails {
        address owner;
        uint requiredAmount;
        uint receivedAmount;   
        uint escrowBalance;    
        uint deadline;
        string title;
        string imageURI;
        string story;
        string category;
        address platformFeeAddress;
        bool deadlineExtended;
        bool withdrawn;
    }

    // Events
    event Donation(address indexed donor, uint amount, uint timestamp);
    event FundsWithdrawn(uint amountToOwner, uint feeAmount);
    event Refunded(address indexed contributor, uint amount);
    event DeadlineExtended(uint newDeadline);

    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == owner, "Campaign: Must be the campaign owner");
        _;
    }

    modifier notWithdrawn() {
        require(!withdrawn, "Campaign: Funds already withdrawn or refunded");
        _;
    }

    // Constructor
    constructor(
        string memory campaignTitle, 
        uint campaignRequiredAmount, 
        string memory campaignImage, 
        string memory campaignStory,
        address campaignOwner,
        string memory campaignCategory,
        uint campaignDeadline, 
        address _platformFeeAddress 
    ) {
        // Ensuring Max initial deadline of 60 days (2 months)
        require(campaignDeadline > block.timestamp, "Campaign: Deadline must be in the future");
        require(campaignDeadline <= block.timestamp + 60 days, "Campaign: Initial deadline max 60 days");
        require(_platformFeeAddress != address(0), "Campaign: Fee address must be valid");
        require(campaignRequiredAmount > 0, "Campaign: Required amount must be positive");

        // UI Variables
        title = campaignTitle;
        requiredAmount = campaignRequiredAmount;
        image = campaignImage;
        story = campaignStory;
        owner = payable(campaignOwner);
        category = campaignCategory;
        receivedAmount = 0;
        escrowBalance = 0;
        deadline = campaignDeadline;
        platformFeeAddress = _platformFeeAddress;
    }

    // Core Functions

    // VIEW FUNCTION FOR FRONTEND 
    /**
     * @dev Fetches all primary campaign data in a single view call for the frontend.
     * @return CampaignDetails A struct containing all essential state variables.
     */
    function getCampaignSummary() public view returns (CampaignDetails memory) {
        return CampaignDetails(
            owner,
            requiredAmount,
            receivedAmount,
            escrowBalance,
            deadline,
            title,
            image, 
            story, 
            category,
            platformFeeAddress,
            deadlineExtended,
            withdrawn
        );
    }
    
    /**
     * @dev Allows users to donate ETH. Funds are held in **escrow** (the contract's balance).
     */
    function donate() public payable notWithdrawn {
        require(msg.value > 0, "Campaign: Must send ETH");
        require(block.timestamp < deadline, "Campaign: Deadline has passed");
        // To restrict overfunding, the below line can be enabled if desired:
        // require(requiredAmount > escrowBalance, "Campaign: OverFunding is not allowed");
        
        // Effects (Update State - CEI Pattern)
        contributors[msg.sender] += msg.value;
        receivedAmount += msg.value;
        escrowBalance += msg.value;
        
        emit Donation(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Allows the creator to withdraw funds and fees after the goal is met.
     * Uses escrowBalance (current available funds) to decide if withdrawal is allowed.
     */
    function withdrawFunds() public onlyCreator notWithdrawn {
        // Can withdraw if Goal Met AND Deadline Passed (standard)
        require(escrowBalance >= requiredAmount, "Campaign: Funding goal not met (available funds)");
        require(block.timestamp >= deadline, "Campaign: Deadline has not passed yet"); 

        // Effects (Update State - CEI Pattern)
        withdrawn = true;

        uint totalFunds = escrowBalance;
        // Calculate fee
        uint feeAmount = totalFunds * PLATFORM_FEE_PERCENTAGE / 100;
        uint amountToOwner = totalFunds - feeAmount;

        // Updating escrow BEFORE interactions
        escrowBalance = 0;

        // 1. Send fee to platformFeeAddress
        (bool feeSuccess, ) = platformFeeAddress.call{value: feeAmount}("");
        require(feeSuccess, "Campaign: Fee transfer failed");

        // 2. Send remaining to owner
        (bool ownerSuccess, ) = owner.call{value: amountToOwner}("");
        require(ownerSuccess, "Campaign: Owner transfer failed");

        emit FundsWithdrawn(amountToOwner, feeAmount);
    }

    /**
     * @dev Allows contributors to claim a refund if the goal was not met and the deadline passed.
     * Refunds decrement escrowBalance but DO NOT decrement receivedAmount (historical).
     */
    function refund() public notWithdrawn {
        require(block.timestamp >= deadline, "Campaign: Deadline has not passed");
        require(escrowBalance < requiredAmount, "Campaign: Funding goal was met, no refund needed");

        uint amountToRefund = contributors[msg.sender];
        require(amountToRefund > 0, "Campaign: No contribution found or already refunded");

        // Effects (Update State - CEI Pattern)
        // Set contribution to zero BEFORE the transfer (prevents reentrancy)
        contributors[msg.sender] = 0;
        // Decrease current escrow only
        escrowBalance -= amountToRefund;

        // Interactions (Send amount)
        (bool success, ) = msg.sender.call{value: amountToRefund}("");
        require(success, "Campaign: Refund transfer failed");

        emit Refunded(msg.sender, amountToRefund);
    }

    /**
     * @dev Allows the creator to extend the deadline once by a maximum of 7 days (1 week).
     */
    function extendDeadline(uint256 _newDeadline) public onlyCreator {
        require(block.timestamp < deadline, "Campaign: Deadline has already passed");
        require(!deadlineExtended, "Campaign: Deadline can only be extended once");
        require(_newDeadline > block.timestamp, "Campaign: New deadline must be in the future");
        
        // Enforce the maximum 7-day extension from the CURRENT deadline
        uint256 maxExtension = deadline + 7 days;
        require(_newDeadline <= maxExtension, "Campaign: Extension cannot exceed 7 days past the current deadline");

        // Update State
        deadlineExtended = true;
        deadline = _newDeadline; 

        emit DeadlineExtended(deadline);
    }

    // Fallback function to allow ETH to be sent without explicitly calling donate()
    receive() external payable {
        donate();
    }
}
