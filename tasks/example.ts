import { task } from "hardhat/config";

task("peer", "Peer contracts").setAction(async (taskArgs, hre) => {
    console.log(`The value of paramName is: ${taskArgs.paramName}`);
    // Your task logic here
});
