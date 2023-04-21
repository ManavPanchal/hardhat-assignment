const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const provider = new ethers.providers.JsonRpcBatchProvider("https://polygon-mumbai.g.alchemy.com/v2/ey1xNY1tJfEF4sBMGDEIJd63y5BwLQ_w");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1,provider);
  const vestingContract = await ethers.getContractFactory("IncrementDecrement");
  const connectWallet = await vestingContract.connect(wallet);
  const contract = await connectWallet.deploy();
  await contract.wait();
  console.log(contract);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
