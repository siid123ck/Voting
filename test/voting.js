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

  describe("Create a vote", ()=>{
    it("Can not create if not a member", async ()=>{
      await expect(voting.createVote("ex1", 1834587, 3)).to.be.revertedWith(
        "You are not member, Please join to vote or create one"
      )
    })
    it("Can not create if invalid option", async ()=>{
      await voting.join({value:"1000000"});
      await expect(voting.createVote("ex2", 2983489, 1)). to.be.revertedWith(
        "The options must be between 1 to 5"
      )
      await expect(voting.createVote("ex2", 2983489, 6)). to.be.revertedWith(
        "The options must be between 1 to 5"
      )
    })
    it("Can not create if expiry is in past", async ()=>{
      await voting.join({value:"1000000"})
      await expect(voting.createVote("ex3", 29393344, 3)).to.be.revertedWith(
        "Expire time can not be in past"
      )
    })
    it("Can create a vote", async ()=>{
      await voting.join({value:1000000})
      await expect(voting.createVote("ex4", 3289783452, 3)).to.emit(voting, "VoteCreated")
    })

  })
})

// join(alreadyJoined, payToJoin), createVote(isMember,correctOption,notPast), vote
// (isMember, canVote) didVote, getVote