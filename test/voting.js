const { ethers } = require("hardhat");
const {expect} = require("chai")

describe("Voting", ()=>{
  let owner1, owner2, owner3, voting;
  beforeEach(async ()=>{
     [owner1, owner2, owner3] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
     voting = await Voting.deploy();
  })

  describe("join as member", ()=>{
    it("Can not join twice", async ()=>{
      await voting.join({value:"1000000"})
      await expect(voting.join({value:"1000000"})).to.be.revertedWith("You already joined")
    })

    it("Can not join if not paying", async ()=>{
      await expect(voting.join()).to.be.revertedWith("You need to pay the fee to join");
    })

    it("Can join if not already joined", async ()=>{
      await expect(voting.join({value:"1000000"})).to.emit(voting, "MemberJoined")
    })
  })
})

// join(alreadyJoined, payToJoin), createVote(isMember,correctOption,notExpired), vote
// (isMember, canVote) didVote, getVote