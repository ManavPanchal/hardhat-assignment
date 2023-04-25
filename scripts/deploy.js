const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const vestingContract = await ethers.getContractFactory("Token");
  const contract = await vestingContract.deploy("MyToken","MTK");
  console.log(`Contract Address : ${contract.address}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
