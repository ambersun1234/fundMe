// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library Price {
    function getEthUsdUnitPriceWEI(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        (,int256 currentPriceGWEI,,,) = priceFeed.latestRoundData();

        return uint256(currentPriceGWEI * 1e10);
    }

    function getEthPriceWei(uint256 amount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        return (getEthUsdUnitPriceWEI(priceFeed) * amount) / 1e18;
    }
}