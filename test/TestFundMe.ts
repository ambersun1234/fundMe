import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers, deployments } from "hardhat";

import { FundMe, MockV3Aggregator } from "../typechain-types";

describe("FundMe", () => {
    const notEnoughETH: string = "Not enough ETH to fund";

    let fundMe: FundMe;
    let aggregator: MockV3Aggregator;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
        deployer = (await ethers.getSigners())[0];
        await deployments.fixture(["all"]);

        fundMe = await ethers.getContract("FundMe", deployer);
        aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("Constructor", () => {
        it("Should set aggregator correctly", async () => {
            assert.equal(await fundMe.getPriceFeed(), aggregator.address);
        });

        it("Should set owner properly", async () => {
            assert.equal(await fundMe.getOwner(), deployer.address);
        });
    });

    describe("Fund", () => {
        it("Should fail if not enough ETH", async () => {
            await expect(fundMe.fund({ value: 0 })).to.be.revertedWith(
                notEnoughETH
            );
        });

        it("Should add funder to donate map", async () => {
            const sendValue = ethers.utils.parseEther("1");
            await fundMe.fund({ value: sendValue });
            const donateValue = await fundMe.getDonateAmount(deployer.address);
            assert.equal(donateValue.toString(), sendValue.toString());
        });

        it("Should add funder to donate list", async () => {
            const sendValue = ethers.utils.parseEther("1");
            await fundMe.fund({ value: sendValue });
            const person = await fundMe.getDonatePerson(0);
            assert.equal(person, deployer.address);
        });

        it("Should have more eth if person donate multiple times", async () => {
            const sendValue = ethers.utils.parseEther("1");
            await fundMe.fund({ value: sendValue });
            await fundMe.fund({ value: sendValue });
            await fundMe.fund({ value: sendValue });
            const finalValue = BigNumber.from(3).mul(sendValue);

            const donateValue = await fundMe.getDonateAmount(deployer.address);
            assert.equal(donateValue.toString(), finalValue.toString());
        });

        it("Shouldn't add funder to list multiple time if donate times > 1", async () => {
            const sendValue = ethers.utils.parseEther("1");
            await fundMe.fund({ value: sendValue });
            await fundMe.fund({ value: sendValue });
            await fundMe.fund({ value: sendValue });

            const person = await fundMe.getDonatePerson(0);
            assert.equal(person, deployer.address);
            await expect(fundMe.getDonatePerson(1)).to.be.reverted;
        });
    });

    describe("Withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: ethers.utils.parseEther("2") });
        });

        it("Should let owner withdraw", async () => {
            const nobody = (await ethers.getSigners())[2];
            const nobodyContract = await fundMe.connect(nobody);
            await expect(nobodyContract.withdraw()).to.be.reverted;
        });

        it("Should withdraw all money", async () => {
            const walletPrice = await ethers.provider.getBalance(
                fundMe.address
            );
            const deployerPrice = await ethers.provider.getBalance(
                deployer.address
            );

            const tx = await fundMe.withdraw();
            const receipt = await tx.wait(1);
            const { gasUsed, effectiveGasPrice } = receipt;
            const gasPrice = gasUsed.mul(effectiveGasPrice);

            const newWalletPrice = await ethers.provider.getBalance(
                fundMe.address
            );
            const newDeployerPrice = await ethers.provider.getBalance(
                deployer.address
            );

            assert.equal(newWalletPrice.toString(), "0");
            assert.equal(
                walletPrice.add(deployerPrice).toString(),
                newDeployerPrice.add(gasPrice).toString()
            );
        });

        it("Should allow withdraw with multiple funders", async () => {
            const sendValue = ethers.utils.parseEther("1");
            const signers = await ethers.getSigners();

            for (let i = 1; i < 10; i++) {
                const contract = fundMe.connect(signers[i]);
                await contract.fund({ value: sendValue });
            }

            const walletPrice = await ethers.provider.getBalance(
                fundMe.address
            );
            const deployerPrice = await ethers.provider.getBalance(
                deployer.address
            );

            const tx = await fundMe.withdraw();
            const receipt = await tx.wait(1);
            const { gasUsed, effectiveGasPrice } = receipt;
            const gasPrice = gasUsed.mul(effectiveGasPrice);

            const newWalletPrice = await ethers.provider.getBalance(
                fundMe.address
            );
            const newDeployerPrice = await ethers.provider.getBalance(
                deployer.address
            );

            assert.equal(newWalletPrice.toString(), "0");
            assert.equal(
                walletPrice.add(deployerPrice).toString(),
                newDeployerPrice.add(gasPrice).toString()
            );
        });

        it("Should have multiple funders in donate_map", async () => {
            const sendValue = ethers.utils.parseEther("1");
            const signers = await ethers.getSigners();

            for (let i = 1; i < 10; i++) {
                const contract = fundMe.connect(signers[i]);
                await contract.fund({ value: sendValue });
            }

            for (let i = 1; i < 10; i++) {
                const price = await fundMe.getDonateAmount(signers[i].address);
                assert.equal(
                    price.toString(),
                    ethers.utils.parseEther("1").toString()
                );
            }
        });

        it("Should clean whole donate map and list after withdraw", async () => {
            const sendValue = ethers.utils.parseEther("1");
            const signers = await ethers.getSigners();

            for (let i = 1; i < 10; i++) {
                const contract = fundMe.connect(signers[i]);
                await contract.fund({ value: sendValue });
            }

            await fundMe.withdraw();

            await expect(fundMe.getDonatePerson(0)).to.be.reverted;
            for (let i = 1; i < 10; i++) {
                const price = await fundMe.getDonateAmount(signers[i].address);
                assert.equal(price.toString(), "0");
            }
        });
    });
});
