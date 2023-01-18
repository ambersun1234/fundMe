import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";

import { DevelopmentChains, ChainMapping } from "../helper-hardhat.config";

const deployMock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId!;

    if (DevelopmentChains.includes(ChainMapping[chainID])) {
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [18, 2000 * 1e8],
            log: true
        });
    }
};

deployMock.tags = ["all", "mock"];

export default deployMock;
