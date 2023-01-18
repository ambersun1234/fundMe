import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { verify } from "../utils/verify";

import {
    ChainMapping,
    DevelopmentChains,
    NetworkConfig
} from "../helper-hardhat.config";

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId!;

    let ethUsdPriceFeedAddress: string;
    if (DevelopmentChains.includes(ChainMapping[chainID])) {
        const aggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = aggregator.address;
    } else {
        ethUsdPriceFeedAddress = NetworkConfig[chainID].ethUsdPriceFeed;
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1
    });

    if (!DevelopmentChains.includes(ChainMapping[chainID])) {
        await verify(fundMe.address, args);
    }
};

deployFundMe.tags = ["all", "fundMe"];

export default deployFundMe;
