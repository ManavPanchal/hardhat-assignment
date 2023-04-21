const { task } = require("hardhat/config");
require("dotenv").config

task("deployContract","will deploy the contract ot testnet")
    .setAction(async()=>{
    try{
        const provider = new ethers.providers.JsonRpcBatchProvider(process.env.ALCHEMY_URL)
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1,provider);
        const vestingContract = await ethers.getContractFactory("vestingContract");
        const connectWallet = await vestingContract.connect(wallet);
        const contract = await connectWallet.deploy();
        console.log(contract);
    }catch(err){
        console.error(err)
    }
})


module.exports = task("deployContract");