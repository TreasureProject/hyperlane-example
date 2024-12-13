import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // Get the deployed ERC20 token address
    const myERC20 = await deployments.get("MyERC20");

    // Arbitrum Sepolia Hyperlane Mailbox address
    const MAILBOX_ADDRESS = "0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8";

    await deploy("MyCustomHypERC20Collateral", {
        from: deployer,
        args: [myERC20.address, MAILBOX_ADDRESS],
        log: true,
        waitConfirmations: 1,
    });
};

func.tags = ["HypERC20Collateral"];
export default func;
