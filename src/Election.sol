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
    error VoterHasAlreadyVoted();
    error ElectionNotOpen();
    error CandidateDoesNotExist();
    error VoterNotVotingFromResidentshipRegion();

    // Events
    event CandidateAdded(bytes32 indexed nameHashed, bytes32 indexed politicalPartyHashed);
    event VoterAdded(bytes32 indexed aadharNumberHashed, bytes32 indexed nameHashed);
    event WinnerDeclared(bytes32 indexed winningCandidateHashed, bytes32 indexed winningPartyHashed, uint256 maxVotes);
    event Tie(bytes32[] winningCandidatesHashed, bytes32[] winningPartiesHashed);
    event ElectionEnded();
    event Voted(bytes32 indexed voterHashed, bytes32 indexed candidatePartyHashed);

    // Type declarations
    struct Candidate {
        bytes32 nameHashed;
        bytes32 politicalPartyHashed;
    }

    enum ElectionState {
        OPEN,
        ENDED
    }

    // State variables
    Candidate[] public s_candidates;
    mapping(bytes32 => bool) private s_alreadyVoted;
    mapping(bytes32 => uint256) public s_votesPerCandidate;
    ElectionState public s_electionStatus;
    uint256 public immutable i_region;
    address public immutable i_owner;
    uint256 public s_voterTurnout;

    // Constructor
    constructor(uint256 _region, address _owner) {
        i_owner = _owner;
        s_electionStatus = ElectionState.OPEN;
        i_region = _region;
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

    // Functions
    /**
     * @notice Adds a new candidate to the election
     * @param candidateNameHashed Hashed name of the candidate
     * @param candidatePoliticalPartyHashed Hashed political party of the candidate
     */
    function addCandidate(bytes32 candidateNameHashed, bytes32 candidatePoliticalPartyHashed) external onlyOwner onlyWhenOpen {
        for (uint256 i = 0; i < s_candidates.length; i++) {
            if (s_candidates[i].politicalPartyHashed == candidatePoliticalPartyHashed) revert PartyAlreadyExists();
        }

        s_candidates.push(Candidate(candidateNameHashed, candidatePoliticalPartyHashed));
        s_votesPerCandidate[candidatePoliticalPartyHashed] = 0;

        emit CandidateAdded(candidateNameHashed, candidatePoliticalPartyHashed);
    }

    /**
     * @notice Votes for a candidate
     * @param nameHashed Hashed name of the voter
     * @param aadharNumberHashed Hashed Aadhar number of the voter
     * @param candidatePartyHashed Hashed political party of the candidate
     * @param regionCode Region code of the voter
     */
    function vote(
        bytes32 nameHashed,
        bytes32 aadharNumberHashed,
        bytes32 candidatePartyHashed,
        uint256 regionCode
    ) external onlyWhenOpen {
        if (i_region != regionCode) revert VoterNotVotingFromResidentshipRegion();
        uint256 length = s_candidates.length;
        bool candidateExists = false;
        for (uint256 i = 0; i < length; i++) {
            if (s_candidates[i].politicalPartyHashed == candidatePartyHashed) {
                candidateExists = true;
                break;
            }
        }
        if (!candidateExists) revert CandidateDoesNotExist();
        if (s_alreadyVoted[aadharNumberHashed]) revert VoterHasAlreadyVoted();

        s_alreadyVoted[aadharNumberHashed] = true;
        s_votesPerCandidate[candidatePartyHashed]++;
        s_voterTurnout++;
        emit VoterAdded(aadharNumberHashed, nameHashed);
        emit Voted(aadharNumberHashed, candidatePartyHashed);
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
    function declareWinner() external onlyOwner returns (bytes32[] memory, bytes32[] memory, bytes32[] memory) {
        if (s_electionStatus != ElectionState.ENDED) revert ElectionNotEnded();

        bytes32 winnerNameHashed;
        bytes32 winningPartyHashed;
        uint256 maxVotes = 0;
        bool tie = false;

        for (uint256 i = 0; i < s_candidates.length; i++) {
            uint256 temp = s_votesPerCandidate[s_candidates[i].politicalPartyHashed];
            if (temp > maxVotes) {
                maxVotes = temp;
                winnerNameHashed = s_candidates[i].nameHashed;
                winningPartyHashed = s_candidates[i].politicalPartyHashed;
                tie = false;
            } else if (temp == maxVotes) {
                tie = true;
            }
        }
        uint256 length = s_candidates.length;
        uint256 noOfTiedCandidates = 0;
        for (uint256 i = 0; i < length; i++) {
            if (s_votesPerCandidate[s_candidates[i].politicalPartyHashed] == maxVotes) {
                noOfTiedCandidates++;
            }
        }

        bytes32[] memory maxVotesArray = new bytes32[](noOfTiedCandidates);
        bytes32[] memory winnerNameArray = new bytes32[](noOfTiedCandidates);
        bytes32[] memory winningPartyArray = new bytes32[](noOfTiedCandidates);
        uint256 arraysIndex = 0;

        for (uint256 i = 0; i < length; i++) {
            if (s_votesPerCandidate[s_candidates[i].politicalPartyHashed] == maxVotes) {
                maxVotesArray[arraysIndex] = bytes32(maxVotes);
                winnerNameArray[arraysIndex] = s_candidates[i].nameHashed;
                winningPartyArray[arraysIndex] = s_candidates[i].politicalPartyHashed;
                arraysIndex++;
            }
        }

        if (tie && noOfTiedCandidates > 1) {
            emit Tie(winnerNameArray, winningPartyArray);
        } else {
            emit WinnerDeclared(winnerNameHashed, winningPartyHashed, maxVotes);
        }

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
     * @param candidatePartyHashed Hashed political party of the candidate
     * @return uint256 Number of votes
     */
    function getVotesPerCandidate(bytes32 candidatePartyHashed) external view returns (uint256) {
        return s_votesPerCandidate[candidatePartyHashed];
    }

    /**
     * @notice Gets the region of the election
     * @return uint256 Region code
     */
    function getRegion() external view returns (uint256) {
        return i_region;
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
