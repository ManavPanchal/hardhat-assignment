const { task } = require("hardhat/config");
require("dotenv").config

task("deployContract","will deploy the contract ot testnet")
    .setAction(async()=>{
    try{
        const vestingContract = await ethers.getContractFactory("vestingContract");
        const contract = await vestingContract.deploy();
        console.log(`Contract Address : ${contract.address}`);
        
    }catch(err){
        console.error(err)
    }
})


module.exports = task("deployContract");