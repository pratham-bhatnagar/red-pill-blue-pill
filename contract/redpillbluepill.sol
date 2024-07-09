// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RedPillBluePill {
    address public owner;
    uint256 public contestCount;
    
    struct Contest {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 redVotes;
        uint256 blueVotes;
        uint256 totalPrize;
        uint256 voteCost;
        bool settled;
        address[] redVoters;
        address[] blueVoters;
    }
    
    mapping(uint256 => Contest) public contests;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    event NewContest(uint256 indexed id, uint256 startTime, uint256 endTime, uint256 voteCost);
    event NewVote(uint256 indexed contestId, address indexed voter, bool isRedPill);
    event ContestSettled(uint256 indexed contestId, string result, uint256 totalPrize, uint256 winnerPrize, uint256 ownerPrize);
    event PrizeTransferred(uint256 indexed contestId, address indexed recipient, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        contestCount = 0;
    }
    
    function createContest(uint256 _duration, uint256 _voteCost) external returns (uint256) {
        require(msg.sender == owner, "Only owner can create contests");
        require(_duration > 0, "Invalid contest duration");
        require(_voteCost > 0, "Invalid vote cost");
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;
        
        contestCount++;
        uint256 contestId = contestCount;
        
        contests[contestId] = Contest(contestId, startTime, endTime, 0, 0, 0, _voteCost, false, new address[](0), new address[](0));
        emit NewContest(contestId, startTime, endTime, _voteCost);
        
        return contestId;
    }
    
    function vote(uint256 _contestId, bool _isRedPill) external payable {
        require(_contestId > 0 && _contestId <= contestCount, "Invalid contest ID");
        Contest storage contest = contests[_contestId];
        require(msg.value == contest.voteCost, "Incorrect vote cost");
        require(block.timestamp >= contest.startTime && block.timestamp < contest.endTime, "Contest not active");
        require(!hasVoted[_contestId][msg.sender], "Already voted");
        
        if (_isRedPill) {
            contest.redVotes++;
            contest.redVoters.push(msg.sender);
        } else {
            contest.blueVotes++;
            contest.blueVoters.push(msg.sender);
        }
        
        contest.totalPrize += msg.value;
        hasVoted[_contestId][msg.sender] = true;
        
        emit NewVote(_contestId, msg.sender, _isRedPill);
    }
    
    function settleContest(uint256 _contestId) external {
        require(_contestId > 0 && _contestId <= contestCount, "Invalid contest ID");
        Contest storage contest = contests[_contestId];
        require(block.timestamp >= contest.endTime, "Contest still ongoing");
        require(!contest.settled, "Contest already settled");
        
        contest.settled = true;
        
        uint256 redVotes = contest.redVotes;
        uint256 blueVotes = contest.blueVotes;
        uint256 totalPrize = contest.totalPrize;
        
        if (redVotes == 0 && blueVotes == 0) {
            payable(owner).transfer(totalPrize);
            emit ContestSettled(_contestId, "TIE: House takes it all", totalPrize, 0, totalPrize);
            emit PrizeTransferred(_contestId, owner, totalPrize);
        } else if (redVotes == blueVotes) {
            payable(owner).transfer(totalPrize);
            emit ContestSettled(_contestId, "TIE: House takes it all", totalPrize, 0, totalPrize);
            emit PrizeTransferred(_contestId, owner, totalPrize);
        } else if (redVotes == 0 || blueVotes == 0) {
            payable(owner).transfer(totalPrize);
            emit ContestSettled(_contestId, "TIE: House takes it all", totalPrize, 0, totalPrize);
            emit PrizeTransferred(_contestId, owner, totalPrize);
        } else {
            string memory result;
            address[] storage winningVoters;
            uint256 winnerCount;
            
            if (redVotes < blueVotes) {
                result = "RED WON";
                winningVoters = contest.redVoters;
                winnerCount = redVotes;
            } else {
                result = "BLUE WON";
                winningVoters = contest.blueVoters;
                winnerCount = blueVotes;
            }
            
            uint256 winnerPrize = (totalPrize * winnerCount * 2) / (redVotes + blueVotes);
            uint256 ownerPrize = totalPrize - winnerPrize;
            
            payable(owner).transfer(ownerPrize);
            emit PrizeTransferred(_contestId, owner, ownerPrize);
            
            uint256 individualPrize = winnerPrize / winnerCount;
            
            for (uint256 i = 0; i < winningVoters.length; i++) {
                address voter = winningVoters[i];
                payable(voter).transfer(individualPrize);
                emit PrizeTransferred(_contestId, voter, individualPrize);
            }
            
            emit ContestSettled(_contestId, result, totalPrize, winnerPrize, ownerPrize);
        }
    }
}