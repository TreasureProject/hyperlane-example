import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { HypERC1155Collateral } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const [signer] = await hre.ethers.getSigners();

    if (!network.config.lzMailbox) {
        throw new Error("lzMailbox must be defined for the network");
    }

    const hypERC1155Collateral = await deploy("HypERC1155Collateral", {
        from: deployer,
        args: ["0xeC23817526072F71EdA9aa5EB0A8f070fA1f133c", network.config.lzMailbox],
        log: true,
        waitConfirmations: 2,
    });

    const HypERC1155CollateralFactory = await hre.ethers.getContractFactory("HypERC1155Collateral");

    const contract = HypERC1155CollateralFactory.attach(hypERC1155Collateral.address).connect(
        signer,
    ) as HypERC1155Collateral;

    console.log("Initializing");

    const init = await contract.initialize(
        hre.ethers.ZeroAddress,
        hre.ethers.ZeroAddress,
        deployer,
    );

    init.wait(1);

    console.log("done!");
};

func.tags = ["HypERC1155Collateral"];
export default func;
