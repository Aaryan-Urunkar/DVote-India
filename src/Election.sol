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
    event Tie(bytes32[] indexed winningCandidatesHashed, bytes32[] indexed winningPartiesHashed);
    event ElectionEnded();

    // Type declarations
    struct Candidate {
        bytes32 nameHashed;
        bytes32 politicalPartyHashed;
    }

    struct Voter {
        bytes32 nameHashed;
        uint256 birthDate;
        uint256 birthMonth;
        uint256 birthYear;
        bytes32 aadharNumberHashed; // keccak256 hash
        uint256 regionOfResidentship;
    }

    enum ElectionState {
        OPEN,
        ENDED
    }

    // State variables
    Candidate[] public candidates;
    mapping(bytes32 => bool) private alreadyVoted;
    address public immutable owner;
    mapping(bytes32 => uint256) public votesPerCandidate;
    ElectionState public electionStatus;
    uint256 public immutable region;

    // Constructor
    constructor(uint256 _region, address _owner) {
        owner = _owner;
        electionStatus = ElectionState.OPEN;
        region = _region;
    }

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // Functions
    /**
     * @notice Adds a new candidate to the election
     * @param candidateNameHashed Hashed name of the candidate
     * @param candidatePoliticalPartyHashed Hashed political party of the candidate
     */
    function addCandidate(bytes32 candidateNameHashed, bytes32 candidatePoliticalPartyHashed) external onlyOwner {
        if (electionStatus != ElectionState.OPEN) revert ElectionNotOpen();

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].politicalPartyHashed == candidatePoliticalPartyHashed) revert PartyAlreadyExists();
        }

        candidates.push(Candidate(candidateNameHashed, candidatePoliticalPartyHashed));
        votesPerCandidate[candidatePoliticalPartyHashed] = 0;

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
    ) external {
        if (electionStatus != ElectionState.OPEN) revert ElectionNotOpen();
        if (region != regionCode) revert VoterNotVotingFromResidentshipRegion();

        bool candidateExists = false;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].politicalPartyHashed == candidatePartyHashed) {
                candidateExists = true;
                break;
            }
        }
        if (!candidateExists) revert CandidateDoesNotExist();
        if (alreadyVoted[aadharNumberHashed]) revert VoterHasAlreadyVoted();

        alreadyVoted[aadharNumberHashed] = true;
        votesPerCandidate[candidatePartyHashed]++;

        emit VoterAdded(aadharNumberHashed, nameHashed);
    }

    /**
     * @notice Ends the election
     */
    function endElection() external onlyOwner {
        if (electionStatus != ElectionState.OPEN) revert ElectionNotOpen();
        electionStatus = ElectionState.ENDED;
        emit ElectionEnded();
    }

    /**
     * @notice Declares the winner of the election
     * @return winnerNameArray Array of winner names
     * @return winningPartyArray Array of winning parties
     * @return maxVotesArray Array of max votes
     */
    function declareWinner() external onlyOwner returns (bytes32[] memory, bytes32[] memory, bytes32[] memory) {
        if (electionStatus != ElectionState.ENDED) revert ElectionNotEnded();

        bytes32 winnerNameHashed;
        bytes32 winningPartyHashed;
        uint256 maxVotes = 0;
        bool tie = false;

        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 temp = votesPerCandidate[candidates[i].politicalPartyHashed];
            if (temp > maxVotes) {
                maxVotes = temp;
                winnerNameHashed = candidates[i].nameHashed;
                winningPartyHashed = candidates[i].politicalPartyHashed;
                tie = false;
            } else if (temp == maxVotes) {
                tie = true;
            }
        }

        uint256 noOfTiedCandidates = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (votesPerCandidate[candidates[i].politicalPartyHashed] == maxVotes) {
                noOfTiedCandidates++;
            }
        }

        bytes32[] memory maxVotesArray = new bytes32[](noOfTiedCandidates);
        bytes32[] memory winnerNameArray = new bytes32[](noOfTiedCandidates);
        bytes32[] memory winningPartyArray = new bytes32[](noOfTiedCandidates);
        uint256 arraysIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (votesPerCandidate[candidates[i].politicalPartyHashed] == maxVotes) {
                maxVotesArray[arraysIndex] = bytes32(maxVotes);
                winnerNameArray[arraysIndex] = candidates[i].nameHashed;
                winningPartyArray[arraysIndex] = candidates[i].politicalPartyHashed;
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
        return candidates;
    }

    /**
     * @notice Gets the election status
     * @return ElectionState Election status
     */
    function getElectionStatus() external view returns (ElectionState) {
        return electionStatus;
    }

    /**
     * @notice Gets the owner of the contract
     * @return Address of the owner
     */
    function getOwner() external view returns (address) {
        return owner;
    }

    /**
     * @notice Gets the votes per candidate
     * @param candidatePartyHashed Hashed political party of the candidate
     * @return uint256 Number of votes
     */
    function getVotesPerCandidate(bytes32 candidatePartyHashed) external view returns (uint256) {
        return votesPerCandidate[candidatePartyHashed];
    }

    /**
     * @notice Gets the region of the election
     * @return uint256 Region code
     */
    function getRegion() external view returns (uint256) {
        return region;
    }
}
