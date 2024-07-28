// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**  
 * @title An election contract
 * @notice This contract is a decentralized election voting campaign
 */
contract Election {
    // Errors
    error NotOwner();
    error PartyAlreadyExists();
    error ElectionNotEnded();
    error ElectionAlreadyStarted();
    error VoterHasAlreadyVoted();
    error ElectionNotOpen();
    error CandidateDoesNotExist();
    error CandidateCannotBeRemoved();
    error CandidateNotFound();

    // Events
    event CandidateAdded(string indexed name, string indexed politicalParty);
    event CandidateRemoved(string indexed name, string indexed politicalParty);
    event VoterAdded(string indexed aadharNumber, string indexed name);
    event WinnerDeclared(string indexed winningCandidate, string indexed winningParty, uint256 maxVotes);
    event Tie(string[] winningCandidates, string[] winningParties);
    event ElectionStarted();
    event ElectionEnded();
    event Voted(string indexed voter, string indexed candidateParty);

    // Type declarations
    struct Candidate {
        string name;
        string politicalParty;
        uint256 votes; 
    }

    enum ElectionState {
        OPEN,
        ENDED
    }

    // State variables
    Candidate[] public s_candidates;
    mapping(string => bool) private s_alreadyVoted;
    mapping(string => uint256) public s_votesPerCandidate;
    ElectionState public s_electionStatus;
    address public immutable i_owner;
    uint256 public s_voterTurnout;
    // State variables to store winner details
    string[] private winnerNameArray;
    string[] private winningPartyArray;
    uint256[] private maxVotesArray;

    // Constructor
    constructor(address _owner) {
        i_owner = _owner;
        s_electionStatus = ElectionState.ENDED; // Initial state set to ENDED
    }

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    modifier onlyWhenOpen() {
        if (s_electionStatus != ElectionState.OPEN) revert ElectionNotOpen();
        _;
    }

    modifier onlyWhenEnded() {
        if (s_electionStatus != ElectionState.ENDED) revert ElectionNotEnded();
        _;
    }

    // Functions
    /**
     * @notice Adds a new candidate to the election
     * @param name Name of the candidate
     * @param politicalParty Political party of the candidate
     */
    function addCandidate(string calldata name, string calldata politicalParty) external onlyOwner {
        for (uint256 i = 0; i < s_candidates.length; i++) {
            if (keccak256(abi.encodePacked(s_candidates[i].politicalParty)) == keccak256(abi.encodePacked(politicalParty))) revert PartyAlreadyExists();
        }

        s_candidates.push(Candidate(name, politicalParty, 0)); 

        emit CandidateAdded(name, politicalParty);
    }

    /**
     * @notice Removes a candidate from the election
     * @param politicalParty Political party of the candidate to be removed
     */
    function removeCandidate(string calldata politicalParty) external onlyOwner onlyWhenEnded {
        bool candidateFound = false;
        uint256 indexToRemove = s_candidates.length;

        for (uint256 i = 0; i < s_candidates.length; i++) {
            if (keccak256(abi.encodePacked(s_candidates[i].politicalParty)) == keccak256(abi.encodePacked(politicalParty))) {
                candidateFound = true;
                indexToRemove = i;
                break;
            }
        }

        if (!candidateFound) revert CandidateNotFound();

        if (s_candidates.length > 0 && indexToRemove < s_candidates.length) {
            s_candidates[indexToRemove] = s_candidates[s_candidates.length - 1];
            s_candidates.pop();
        }

        delete s_votesPerCandidate[politicalParty];

        emit CandidateRemoved(s_candidates[indexToRemove].name, politicalParty);
    }


    /**
     * @notice Starts the election
     */
    function startElection() external onlyOwner {
        if (s_electionStatus == ElectionState.OPEN) revert ElectionAlreadyStarted();
        s_electionStatus = ElectionState.OPEN;
        emit ElectionStarted();
    }

    /**
     * @notice Votes for a candidate
     * @param name Name of the voter
     * @param aadharNumber Aadhar number of the voter
     * @param candidateParty Political party of the candidate
     */
    function vote(
        string calldata name,
        string calldata aadharNumber,
        string calldata candidateParty
    ) external onlyWhenOpen {
        uint256 length = s_candidates.length;
        bool candidateExists = false;
        for (uint256 i = 0; i < length; i++) {
            if (keccak256(abi.encodePacked(s_candidates[i].politicalParty)) == keccak256(abi.encodePacked(candidateParty))) {
                candidateExists = true;
                s_candidates[i].votes++; // Increment the vote count
                s_votesPerCandidate[candidateParty]++;
                break;
            }
        }
        if (!candidateExists) revert CandidateDoesNotExist();
        if (s_alreadyVoted[aadharNumber]) revert VoterHasAlreadyVoted();

        s_alreadyVoted[aadharNumber] = true;
        s_voterTurnout++;
        emit VoterAdded(aadharNumber, name);
        emit Voted(aadharNumber, candidateParty);
    }

    /**
     * @notice Ends the election
     */
    function endElection() external onlyOwner onlyWhenOpen {
        s_electionStatus = ElectionState.ENDED;
        emit ElectionEnded();
    }

    /**
     * @notice Declares the winner of the election
     * @return winnerNameArray Array of winner names
     * @return winningPartyArray Array of winning parties
     * @return maxVotesArray Array of max votes
     */
    function declareWinner() external onlyOwner onlyWhenEnded returns (string[] memory, string[] memory, uint256[] memory) {
        string memory winnerName;
        string memory winningParty;
        uint256 maxVotes = 0;
        bool tie = false;

        for (uint256 i = 0; i < s_candidates.length; i++) {
            uint256 temp = s_votesPerCandidate[s_candidates[i].politicalParty];
            if (temp > maxVotes) {
                maxVotes = temp;
                winnerName = s_candidates[i].name;
                winningParty = s_candidates[i].politicalParty;
                tie = false;
            } else if (temp == maxVotes) {
                tie = true;
            }
        }

        uint256 length = s_candidates.length;
        uint256 noOfTiedCandidates = 0;
        for (uint256 i = 0; i < length; i++) {
            if (s_votesPerCandidate[s_candidates[i].politicalParty] == maxVotes) {
                noOfTiedCandidates++;
            }
        }

        // Update state variables
        winnerNameArray = new string[](noOfTiedCandidates);
        winningPartyArray = new string[](noOfTiedCandidates);
        maxVotesArray = new uint256[](noOfTiedCandidates);
        uint256 arraysIndex = 0;

        for (uint256 i = 0; i < length; i++) {
            if (s_votesPerCandidate[s_candidates[i].politicalParty] == maxVotes) {
                winnerNameArray[arraysIndex] = s_candidates[i].name;
                winningPartyArray[arraysIndex] = s_candidates[i].politicalParty;
                maxVotesArray[arraysIndex] = maxVotes;
                arraysIndex++;
            }
        }

        if (tie && noOfTiedCandidates > 1) {
            emit Tie(winnerNameArray, winningPartyArray);
        } else {
            emit WinnerDeclared(winnerName, winningParty, maxVotes);
        }
        return (winnerNameArray, winningPartyArray, maxVotesArray);
    }

    function getWinnerDetails() public view returns (string[] memory, string[] memory, uint256[] memory) {
        return (winnerNameArray, winningPartyArray, maxVotesArray);
    }

    /**
     * @notice Gets the candidates
     * @return Array of candidates
     */
    function getCandidates() external view returns (Candidate[] memory) {
        return s_candidates;
    }

    /**
     * @notice Gets the election status
     * @return ElectionState Election status
     */
    function getElectionStatus() external view returns (ElectionState) {
        return s_electionStatus;
    }

    /**
     * @notice Gets the votes per candidate
     * @param candidateParty Political party of the candidate
     * @return uint256 Number of votes
     */
    function getVotesPerCandidate(string calldata candidateParty) external view returns (uint256) {
        return s_votesPerCandidate[candidateParty];
    }

    /**
     * @notice Gets the owner of the contract
     * @return Address of the owner
     */
    function getOwner() external view returns (address) {
        return i_owner;
    }

    /**
     * @notice Gets the total voter turnout of the election at a given moment
     * @return Returns the total voter turnout as a uint256
     */
    function getVoterTurnout() external view returns(uint256) {
        return s_voterTurnout;
    }
}

