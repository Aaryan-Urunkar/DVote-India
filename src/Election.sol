// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

/**  
 * @title An election contract
 * @author Aaryan Urunkar, Varun Jhaveri, Swayam Kelkar , Devesh Acharya 
 * @notice This contract is a decentralized election voting campaign
*/

contract Election {
    //Errors
    error NotOwner();
    error PartyAlreadyExists();
    error ElectionNotEnded();
    error VoterHasAlreadyVoted();
    error ElectionNotOpen();
    error IllegalTransfer();
    error CandidateDoesNotExist();
    error VoterNotVotingFromResidentshipRegion();

    //Events
    event CandidateAdded(string indexed name , string indexed politicalParty);
    event VoterAdded(bytes32 indexed aadharNumberHashed , string name);
    event WinnerDeclared(string indexed winningCandidate , string indexed winningParty , uint256 maxVotes);
    event Tie(string[] indexed winningCandidates , string[] indexed winningParties);

    //Type declarations
    struct Candidate {
        string name;
        string politicalParty;
    }

    struct Voter {
        string name;
        uint256 birthDate;
        uint256 birthMonth;
        uint256 birthYear;
        bytes32 aadharNumberHashed; //keccak256 hash
        uint256 regionOfResidentship;
    }

    enum ElectionState {
        OPEN , ENDED
    }

    //State variables
    Candidate[] public s_candidates;
    Voter[] private s_alreadyVoted;
    address immutable i_owner;
    mapping(string => uint256) s_votesPerCandidate;
    ElectionState s_electionStatus;
    uint256[] public s_votesCount;
    uint256 immutable i_region; 

    //constructor
    constructor(uint256 region , address owner){
        i_owner = owner;
        s_electionStatus  = ElectionState.OPEN;
        i_region = region;
    }

    //modifiers
    modifier onlyOwner {
        if(msg.sender != i_owner){
            revert NotOwner();
        }
        _;
    }

    //fallback and receive
    receive() external payable{
        revert IllegalTransfer();
    }

    fallback() external {
      revert IllegalTransfer();  
    }

    //functions (getters at the end)
    function addCandidate(string calldata candidateName , string calldata candidatePoliticalParty) external onlyOwner {
        if(s_electionStatus == ElectionState.ENDED){
            revert ElectionNotOpen();
        }
        uint256 startingIndex=0;
        uint256 noOfCandidates = s_candidates.length;
        Candidate memory temp;
        for(uint256 i=startingIndex ; i< noOfCandidates ; i++){
            temp = s_candidates[i];
            if(keccak256(bytes(temp.politicalParty)) == keccak256(bytes(candidatePoliticalParty))){
                revert PartyAlreadyExists();
            } 
        }
        s_candidates.push(Candidate({
            name:candidateName ,
            politicalParty : candidatePoliticalParty
        }));
        s_votesPerCandidate[candidateName] = 0;
        emit CandidateAdded(candidateName , candidatePoliticalParty);
    }

    function vote(string calldata name , uint256 birthDate, uint256 birthMonth, uint256 birthYear , string calldata aadharNumber, string calldata candidateName , uint256 regionCode) public {
        if(s_electionStatus == ElectionState.ENDED){
            revert ElectionNotOpen();
        }
        if(i_region != regionCode){
            revert VoterNotVotingFromResidentshipRegion();
        }
        uint256 startingIndex=0;
        uint256 noOfCandidates = s_candidates.length;
        bool candidateExists = false;
        for(uint256 i = startingIndex ; i<noOfCandidates ;i++){
            if(keccak256(bytes(candidateName)) == keccak256(bytes(s_candidates[i].name))){
                candidateExists = true;
            }
        }
        if(!candidateExists){
            revert CandidateDoesNotExist();
        }
        Voter memory newVoter = Voter({
            name : name,
            birthDate : birthDate,
            birthMonth : birthMonth,
            birthYear : birthYear,
            aadharNumberHashed : keccak256(abi.encode(aadharNumber)),
            regionOfResidentship : regionCode
        });
        startingIndex=0;
        uint256 votersLength = s_alreadyVoted.length;
        Voter memory temp;
        for(uint256 i = startingIndex ; i< votersLength ; i++){
            temp = s_alreadyVoted[i];
            if(temp.aadharNumberHashed == newVoter.aadharNumberHashed){
                revert VoterHasAlreadyVoted();
            }
        }
        s_alreadyVoted.push(newVoter);
        s_votesPerCandidate[candidateName] +=1; //Vote anonymity is maintained
        emit VoterAdded( newVoter.aadharNumberHashed , newVoter.name );
    }

    function endElection() public onlyOwner {
        s_electionStatus = ElectionState.ENDED;
    }

    function declareWinner() public onlyOwner returns(string[] memory, string[] memory , uint256[] memory) {
        endElection();
        delete s_votesCount;
        string memory winnerName="";
        string memory winningParty="";
        uint256 maxVotes=0;
        uint256 startingIndex=0;
        uint256 temp=0;
        uint256 noOfCandidates = s_candidates.length;
        bool tie = false;
        Candidate memory candidate;
        for(uint256 i = startingIndex ; i < noOfCandidates ;i++){
            candidate = s_candidates[i];
            temp = getVotesPerCandidate(candidate.name);
            if(temp > maxVotes) {
                maxVotes = temp;
                winnerName = candidate.name;
                winningParty= candidate.politicalParty;
            } else if(temp == maxVotes){
                tie=true;
            }
            s_votesCount.push(temp);
        }
        uint256[] memory maxVotesArray;
        string[] memory winnerNameArray;
        string[] memory winningPartyArray;
        if(tie){
            uint256 noOfTiedCandidates = 0;
            for(uint256 i=0;i<noOfCandidates;i++){
                if(getVotesPerCandidate(s_candidates[i].name) == maxVotes){
                    noOfTiedCandidates++;
                }
            }
            maxVotesArray = new uint256[](noOfTiedCandidates);
            winnerNameArray = new string[](noOfTiedCandidates);
            winningPartyArray = new string[](noOfTiedCandidates);
            uint256 arraysIndex = 0;
            //Candidate memory tempCandidate;
            for(uint256 i=0;i<noOfCandidates;i++){
                candidate = s_candidates[i];
                if(getVotesPerCandidate(candidate.name) == maxVotes){
                    maxVotesArray[arraysIndex] = maxVotes;
                    winnerNameArray[arraysIndex] = candidate.name;
                    winningPartyArray[arraysIndex] = candidate.politicalParty;
                    arraysIndex++;
                }
            }
            emit Tie(winnerNameArray, winningPartyArray);
            return (winnerNameArray, winningPartyArray , maxVotesArray);

        } else {
            emit WinnerDeclared(winnerName , winningParty , maxVotes);
            maxVotesArray = new uint256[](1);
            maxVotesArray[0] = maxVotes;
            winnerNameArray = new string[](1);
            winnerNameArray[0] = winnerName;
            winningPartyArray = new string[](1);
            winningPartyArray[0] = winningParty;
            return (winnerNameArray , winningPartyArray , maxVotesArray);
        }
    }

    function getCandidates() view public returns(Candidate[] memory){
        return s_candidates;
    }

    function getVoters() view external returns(Voter[] memory){
        return s_alreadyVoted;
    }

    function getElectionStatus() view public returns(ElectionState){
        return s_electionStatus;
    }

    function getOwner() view public returns(address){
        return i_owner;
    }

    function getVotesPerCandidate(string memory candidateName) view public returns(uint256){
        return s_votesPerCandidate[candidateName];
    }

    function getVotesCount() view public returns(uint256[] memory){
        if(s_electionStatus == ElectionState.OPEN){
            revert ElectionNotEnded();
        }
        return s_votesCount;
    }

    function getRegionCode() public view returns(uint256){
        return i_region;
    }
}