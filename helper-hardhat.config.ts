interface NetworkConfigItemInterface {
    name: string;
    ethUsdPriceFeed: string;
}

interface NetworkConfigInterface {
    [key: number]: NetworkConfigItemInterface;
}

interface ChainMappingInterface {
    [key: number]: string;
}

export const DevelopmentChains = ["hardhat", "localhost"];

export const ChainMapping: ChainMappingInterface = {
    31337: "hardhat",
    5: "goerli"
};

export const NetworkConfig: NetworkConfigInterface = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }
};
