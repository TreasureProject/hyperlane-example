import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // Sepolia Hyperlane Mailbox address
    const MAILBOX_ADDRESS = "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766";

    await deploy("MyCustomHypERC20", {
        from: deployer,
        args: [18, MAILBOX_ADDRESS],
        log: true,
        waitConfirmations: 1,
    });
};

func.tags = ["HypERC20"];
export default func;
