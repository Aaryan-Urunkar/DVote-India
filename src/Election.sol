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
    error CandidateAlreadyExists();
    error VoterHasAlreadyVoted();
    error ElectionNotOpen();
    error IllegalTransfer();

    //Events
    event CandidateAdded(string indexed name , string indexed politicalParty);
    event VoterAdded(bytes32 indexed aadharNumberHashed , string name);

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
    }

    enum ElectionState {
        OPEN , ENDED
    }

    //State variables
    Candidate[] public s_candidates;
    Voter[] private s_alreadyVoted;
    address i_owner;
    mapping(string => uint256) s_votesPerCandidate;
    ElectionState s_electionStatus;

    //constructor
    constructor(){
        i_owner = msg.sender;
        s_electionStatus  = ElectionState.OPEN;
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
    function addCandidate(string memory candidateName , string memory candidatePoliticalParty) private onlyOwner {
        if(s_electionStatus == ElectionState.ENDED){
            revert ElectionNotOpen();
        }
        uint256 startingIndex=0;
        Candidate memory temp;
        for(uint256 i=startingIndex ; i< s_candidates.length ; i++){
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

    function vote(string memory name , uint256 birthDate, uint256 birthMonth, uint256 birthYear , string memory aadharNumber, string memory candidateName) public {
        if(s_electionStatus == ElectionState.ENDED){
            revert ElectionNotOpen();
        }
        Voter memory newVoter = Voter({
            name : name,
            birthDate : birthDate,
            birthMonth : birthMonth,
            birthYear : birthYear,
            aadharNumberHashed : keccak256(abi.encode(aadharNumber))
        });
        uint256 startingIndex=0;
        Voter memory temp;
        for(uint256 i = startingIndex ; i< s_alreadyVoted.length ; i++){
            temp = s_alreadyVoted[i];
            if(temp.aadharNumberHashed == newVoter.aadharNumberHashed){
                revert VoterHasAlreadyVoted();
            }
        }
        s_alreadyVoted.push(newVoter);
        s_votesPerCandidate[candidateName] +=1; //Vote anonymity is maintained
        emit VoterAdded( newVoter.aadharNumberHashed , newVoter.name );
    }

    function endElection() private onlyOwner {
        s_electionStatus = ElectionState.ENDED;
    }

    function getCandidates() view public returns(Candidate[] memory){
        return s_candidates;
    }

    function getVoters() view private returns(Voter[] memory){
        return s_alreadyVoted;
    }

    function getElectionStatus() view public returns(ElectionState){
        return s_electionStatus;
    }

    function getOwner() view public returns(address){
        return i_owner;
    }
}