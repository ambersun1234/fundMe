import { HardhatUserConfig } from "hardhat/config";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";

chai.use(solidity);

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.17" }]
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://localhost:8545",
            chainId: 31337
        }
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        noColors: true
    }
};

export default config;
