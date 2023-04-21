const { task } = require("hardhat/config");

task("verifyContract"," will verify the contract that is deployed on any blockexplorer")
    .addParam("contractname", "name of the conrtact")
    .addParam("contractaddress","address of the contract that is deployed")
    .setAction(async(args,hre)=>{
        try {
            await hre.run("verify:verify",{
                address: args.contractaddress,
                contract:args.contractname,
                constructorArguments: []
            })
        } catch (error) {
            console.log(error);
        }
    })