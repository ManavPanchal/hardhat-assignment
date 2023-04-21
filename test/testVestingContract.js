const { expect}  = require("chai");
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const {time} = require("@nomicfoundation/hardhat-network-helpers")
const chai = require('chai');
chai.use(deepEqualInAnyOrder);

let owner, addr1, addr2, addrs;
let vestingContract, token1;
let cliff, slicePeriod, expiryTime, amount;

async function setData(){
    let token = await ethers.getContractFactory("Token");
    token1 = await token.deploy("tempToken1","TTK1");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    cliff = 0;
    slicePeriod = 10;
    expiryTime = 30;
    amount = 10;
}

async function lockToken(tokenAddress,_receivers){
    await vestingContract.lockVestingTokens(tokenAddress, owner.address, _receivers, cliff, amount, slicePeriod , expiryTime);
}

describe("testing vesting contract...", ()=>{
    
    setData();

    beforeEach(async ()=>{
        let contract = await ethers.getContractFactory("vestingContract");
        vestingContract = await contract.deploy();
        await token1.approve(vestingContract.address,1000);
    })


    describe("check locking function efficiency", ()=>{
        
        it("Should increment vestingId ", async()=>{
            const vestingId = await vestingContract.vestingCurrentId();
            await lockToken(token1.address,[addr1.address]);
            expect(Number(vestingId)+1).to.equal(Number(await vestingContract.vestingCurrentId()));
        })

        it("Should update the token balance of contract", async()=>{
            await lockToken(token1.address,[addr1.address]);
            expect(Number(await token1.balanceOf(vestingContract.address))).to.equal(amount*(expiryTime/slicePeriod));
        })

        it("Should update the vesting schedule", async()=>{
            await lockToken(token1.address,[addr1.address]);
            const schedule = await vestingContract.connect(addr1).viewVestingSchedule(0);
            expect([token1.address,amount,slicePeriod,expiryTime]).to.deep
                .equalInAnyOrder([schedule.tokenAddress,Number(schedule.tokenPerSlicePeriod),Number(schedule.slicePeriod),Number(schedule.expiryDate - schedule.startDate)])
        })

    })

    describe("Check withrawability of beneficiaries",()=>{

        beforeEach(async()=>{
            await lockToken(token1.address,[addr1.address]);
            await time.increase(10);
        })

        it("Should show correct withdrawable amount",async()=>{
            await vestingContract.connect(addr1).withdraw(amount,0); 
            await time.increase(10);
            const amountWithdrawnTillNow = await vestingContract.connect(addr1).amountWithdrawnTillNow(0)
            await vestingContract.connect(addr1).releaseToken(0);
            const schedule = await vestingContract.viewVestingSchedule(0);
            expect(await vestingContract.connect(addr1).checkWithdrawableAmount(0)).to.equal(Number(schedule.releasedToken)- Number(amountWithdrawnTillNow))
        })

        it("Should let only beneficiary to check withdrawable amount",async()=>{
            await expect(vestingContract.checkWithdrawableAmount(0)).to.revertedWith("Only beneficiary is allowed");
        })

        it("Should let only beneficiary to withdraw",async()=>{
            await expect(vestingContract.withdraw(amount,0)).to.revertedWith("Only beneficiary is allowed");
        })

        it("should relase the token during withdraw", async() =>{
            await time.increase(10);
            await vestingContract.connect(addr1).withdraw(10,0);
            const schedule = await vestingContract.viewVestingSchedule(0)
            expect(schedule.releasedToken).to.equal(amount*2)
        });

        it("Should not allow to vest before release time", async()=>{
            await vestingContract.connect(addr1).withdraw(amount,0);
            await expect(vestingContract.connect(addr1).withdraw(amount,0)).to.be.revertedWith("vesting tokens are not yet realeased");
        })
        
        it("Should transfer correct amount as it should be",async()=>{
            await time.increase(20);
            const balanceBeforeWithdraw = await token1.balanceOf(addr1.address);
            await vestingContract.connect(addr1).withdraw(amount,0);
            expect(Number(await token1.balanceOf(addr1.address))).to.equal(Number(balanceBeforeWithdraw)+amount)
        })

        it("Should update the contract balance",async()=>{
            const contractBalance = await token1.balanceOf(vestingContract.address);
            await vestingContract.connect(addr1).withdraw(amount,0);
            expect(Number(await token1.balanceOf(vestingContract.address))).to.equal(Number(contractBalance)-amount)
        })

        it("Should give error if beneficiary try to withdraw more than a withdrawable amount", async()=>{
            await expect( vestingContract.connect(addr1).withdraw(amount*2,0)).to.revertedWith("you don't have access to withdraw this much amount!, you can check withdrawable amount")
        })
        
        it("Should not allow the beneficiary to vest if alreadey withdrawn all relased token and contract is over", async()=>{
            await time.increase(expiryTime);
            vestingContract.connect(addr1).withdraw(amount*3,0)
            await expect(vestingContract.connect(addr1).withdraw(amount*3,0)).to.be.revertedWith("your vesting conrtact is over")
        })
    })

    describe("Check general accebility of functions",()=>{

        it("Should let only beneficiary to release Token", async()=>{
            await lockToken(token1.address,[addr1.address]);
            await expect(vestingContract.releaseToken(0)).to.be.revertedWith("Only beneficiary is allowed to release tokens");
        })

        it("Should not allow to do update the vesting schedule before cliff period is over", async()=>{
            await vestingContract.lockVestingTokens(token1.address, owner.address, [addr1.address], 10, amount, slicePeriod , expiryTime)
            await expect(vestingContract.connect(addr1).releaseToken(0)).to.be.revertedWith("vesting not even started yet");
        })

        it("Should give error on wrong vestingId",async()=>{
            await lockToken(token1.address,[addr1.address]);
            await expect(vestingContract.releaseToken(1)).to.be.revertedWith("Please enter valid vestingId");
        })

    })
})