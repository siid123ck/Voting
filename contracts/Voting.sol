// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;


contract Voting {
    uint nextVoteId; 
    uint votingFee = 1000000 wei;

    struct Vote{
        string uri;
        address owner;
        uint expireAt; 
        uint[] votes;
        mapping(address=>bool) isVoted;
        uint options;
    }

    mapping(uint=>Vote) votes;
    mapping(address=>bool) public members;
    
    event MemberJoined(address indexed member, uint indexed joinedAt);
    event VoteCreated(
        address indexed owner, 
        uint indexed voteId, 
        uint indexed joinedAt, 
        uint expireAt
    );

    event Voted(
        address indexed member,
        uint indexed voteId,
        uint indexed votedAt,
        uint  option
    );

    modifier isMember(){
        require(members[msg.sender], "You are not member, Please join to vote or create one");
        _;
    } 
    modifier canVote(uint voteId, uint option){ 
        require(voteId < nextVoteId, "Vote does not exist");
        require(!votes[voteId].isVoted[msg.sender], "You already voted");
        require(option < votes[voteId].options, "Invalid option");
        require(block.timestamp <= votes[voteId].expireAt, "Vote is expired already");
        _;
    }

    function join() payable external{
        require(!members[msg.sender], "You already joined");
        require(msg.value == votingFee, "You need to pay the fee to join");
        members[msg.sender] = true;
        emit MemberJoined(msg.sender, block.timestamp);
    }

    function createVote(
        string memory uri,
        uint expireAt, 
        uint options
    ) external isMember(){
        require(options > 1 && options < 5, "The options must be between 1 to 5");
        require(expireAt > block.timestamp, "Expire time can not be in past");
        uint voteId = nextVoteId;

        votes[voteId].uri = uri;
        votes[voteId].owner = msg.sender;
        votes[voteId].options = options;
        votes[voteId].expireAt = expireAt;
        votes[voteId].votes = new uint[](options);

        emit VoteCreated(msg.sender, voteId, block.timestamp, expireAt);
        nextVoteId++;
    }

    function  vote(uint voteId, uint option)
     isMember() canVote(voteId, option) external {
        votes[voteId].isVoted[msg.sender] = true;
        votes[voteId].votes[option]++;

        emit Voted(msg.sender, voteId, block.timestamp, option);
    }

    function getVote(uint voteId) public view returns(
        string memory, address, uint[] memory, uint){
        return (            
            votes[voteId].uri,
            votes[voteId].owner,
            votes[voteId].votes,
            votes[voteId].expireAt);
    }

    function didVote(address member, uint voteId) public view returns(bool){
        return votes[voteId].isVoted[member];
    }


}
