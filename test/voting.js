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

  describe("Vote", ()=>{
    it("Can not vote if not member", async ()=>{
      await expect(voting.vote(2,3)).to.be.revertedWith(
        "You are not member, Please join to vote or create one"
      )
    })
    it("Can not vote if vote does not exist", async ()=>{
      await voting.join({value:1000000});
      await expect(voting.vote(0, 2)).to.be.revertedWith(
        "Vote does not exist"
      )
    })
    it("Can not vote twice", async ()=>{
      await voting.join({value:1000000})
      await voting.createVote("ex4", 2389387489, 4);
      await voting.vote(0, 1)
      await expect(voting.vote(0, 3)).to.be.revertedWith(
        "You already voted"
      )
    })
    it("Can not vote with invalid option", async ()=>{
      await voting.join({value:1000000})
      await voting.createVote("ex4", 2389387489, 4);
      await expect(voting.vote(0, 6)).to.be.revertedWith(
        "Invalid option"
      )
    })
    it("Can not vote if it is expired", async ()=>{
      await voting.join({value:1000000})
      await voting.createVote("ex4", 1712233230, 4);
      // need to increase block
      await expect(voting.vote(0, 2)).to.be.revertedWith(
        "Vote is expired"
      )
    })   
  })
  
})

// join(alreadyJoined, payToJoin),1712233230 createVote(isMember,correctOption,notPast), vote
// (isMember, votNotExist, alreadyVoted, invalidOption, voteExpired) didVote, getVote