// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "./Price.sol";

error FundMe__NotOwner();

/** @title A contract for funding
 *  @author ambersun1234
 *  @notice This contract is to demo a samle funding contract
 */
contract FundMe {
    using Price for uint256;

    address private immutable owner;
    mapping(address => uint256) private donate_map;
    address[] private donate_list;
    AggregatorV3Interface private priceFeed;

    uint256 public constant minimum_donate_price = 50 * 1e18;

    modifier isOwner {
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function getDonatePerson(uint256 index) public view returns(address) {
        return donate_list[index];
    }

    function getDonateAmount(address funder) public view returns(uint256) {
        return donate_map[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return priceFeed;
    }

    function fund() public payable {
        require(msg.value.getEthPriceWei(priceFeed) > minimum_donate_price, "Not enough ETH to fund");

        if (donate_map[msg.sender] == 0) {
            donate_list.push(msg.sender);
        }
        donate_map[msg.sender] += msg.value;
    }

    function withdraw() public isOwner {
        initialize();
        bool isSuccess = payable(msg.sender).send(address(this).balance);
        require(isSuccess, "Withdraw failed");
    }

    function initialize() internal {
        address[] memory list = donate_list;
        for (uint256 index = 0; index < list.length; index++) {
            donate_map[list[index]] = 0;
        }
        donate_list = new address[](0);
    }
}
