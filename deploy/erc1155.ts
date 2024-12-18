import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TOKEN_MAPPING } from "../config";
import { HypERC1155 } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const [signer] = await hre.ethers.getSigners();

    const networkConfig = TOKEN_MAPPING.find((n) => n.srcChain === network.name);
    if (!networkConfig) {
        throw new Error(`No config found for ${network.name}`);
    }

    console.log(networkConfig);

    if (!network.config.lzMailbox) {
        throw new Error("lzMailbox must be defined for the network");
    }

    const hypERC1155 = await deploy("HypERC1155", {
        from: deployer,
        args: [network.config.lzMailbox],
        log: true,
        waitConfirmations: 1,
    });

    const HypERC1155Factory = await hre.ethers.getContractFactory("HypERC1155");
    const contract = HypERC1155Factory.attach(hypERC1155.address).connect(signer) as HypERC1155;

    await contract.initialize(
        "ipfs://bafkreihyxwx3vqlmvt5d3spuvkgjztcih4sva2xhoytbzdnrfjwq3roneq",
        "HyperlaneERC1155",
        "HYPER",
        hre.ethers.ZeroAddress,
        hre.ethers.ZeroAddress,
        deployer,
    );
};

func.tags = ["HypERC1155"];
export default func;