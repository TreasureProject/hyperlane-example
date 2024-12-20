import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MyERC1155 } from "../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const [signer] = await hre.ethers.getSigners();

    const NAME = "CollateralTest";
    const SYMBOL = "CLT";
    const BASE_URI = "ipfs://bafkreihyxwx3vqlmvt5d3spuvkgjztcih4sva2xhoytbzdnrfjwq3roneq";

    const myERC1155 = await deploy("MyERC1155", {
        from: deployer,
        args: [NAME, SYMBOL, BASE_URI],
        log: true,
        waitConfirmations: 1,
    });

    const MyERC1155Factory = await hre.ethers.getContractFactory("MyERC1155");
    const contract = MyERC1155Factory.attach(myERC1155.address).connect(signer) as MyERC1155;

    console.log("minting");

    const mint = await contract.mint(deployer, 1n, 100n, "0x");

    mint.wait(1);
};

func.tags = ["MyERC1155"];
export default func;
