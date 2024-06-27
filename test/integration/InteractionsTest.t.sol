// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Test , console} from "forge-std/Test.sol";
import {AddCandidate , Vote , DeclareWinner} from "../../script/Interactions.s.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";
import {Election} from "../../src/Election.sol";
import {DevOpsTools} from 'lib/foundry-devops/src/DevOpsTools.sol';

contract InteractionsTest is Test {

    event VoterAdded(bytes32 indexed aadharNumberHashed , string name);
    event WinnerDeclared(string indexed winningCandidate , string indexed winningParty , uint256 maxVotes);

    Election election;

    string constant SAMPLE_CANDIDATE_="ABCD";
    string constant SAMPLE_CANDIDATE_2="EFGH";
    string constant SAMPLE_POLITICAL_PARTY_="SS";
    string constant SAMPLE_POLITICAL_PARTY_2="INC";
    string constant SAMPLE_VOTER_1= "VarunAaryanSwayamDevesh";
    string constant SAMPLE_VOTER_2="Aaryan";
    string constant SAMPLE_VOTER_3="Varun";
    string constant SAMPLE_VOTER_4='Devesh';
    string constant SAMPLE_VOTER_5="Swayam";
    string constant SAMPLE_AADHAR_NUMBER_1="317436889927";
    string constant SAMPLE_AADHAR_NUMBER_2="887436889927";
    string constant SAMPLE_AADHAR_NUMBER_3="517436889927";
    string constant SAMPLE_AADHAR_NUMBER_4="217436889927";
    string constant SAMPLE_AADHAR_NUMBER_5="317467889927";
    uint256 constant SAMPLE_BIRTH_DATE=13;
    uint256 constant SAMPLE_BIRTH_MONTH=9;
    uint256 constant SAMPLE_BIRTH_YEAR=2005;

    address owner;
    uint256 deployerKey;
    AddCandidate addCandidate;

    modifier AddingCandidate {
        addCandidate = new AddCandidate();
        addCandidate.addCandidate(address(election), SAMPLE_CANDIDATE_, SAMPLE_POLITICAL_PARTY_ ,deployerKey);
        _;
    }

    function setUp() external {
        DeployElection deployer= new DeployElection();
        (election , deployerKey  , owner ) = deployer.run();
    }

    ///////////////////
    //AddCandidate////
    /////////////////

    function test_AddingCandidateManuallyAndVerifyingCountAndDetails() external AddingCandidate{
        assertEq(election.getCandidates()[0].name , SAMPLE_CANDIDATE_);
        assertEq(election.getCandidates().length, 1);
        assertEq(election.getCandidates()[0].politicalParty , SAMPLE_POLITICAL_PARTY_);
    }

    


    //////////////
    //Vote///////
    ////////////

    function test_AddingCandidateAndVotingSuccessfully () external AddingCandidate{
        Vote vote = new Vote();
        vm.expectEmit(true, false, false, false, address(election));
        emit VoterAdded( keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)) , SAMPLE_CANDIDATE_);
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_);
        assertEq(election.getVoters()[0].name , SAMPLE_VOTER_1);
        assertEq(election.getVoters()[0].aadharNumberHashed , keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)));
    }

    function test_AddingCandidateAndVotingFailure1 () external AddingCandidate{
        Vote vote = new Vote();
        vm.expectRevert(Election.CandidateDoesNotExist.selector);
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_2);            
    }

    function test_AddingCandidateAndVotingFailure2() external AddingCandidate{
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_);
        addCandidate.addCandidate(address(election), SAMPLE_CANDIDATE_2, SAMPLE_POLITICAL_PARTY_2, deployerKey);
        vm.expectRevert(Election.VoterHasAlreadyVoted.selector);
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_2);
    }

    


    ////////////////////
    //declareWinner////
    //////////////////

    function test_AddingCandidatesAndVotingAndDeclaringWinner() external AddingCandidate{
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2, deployerKey);
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_CANDIDATE_);
        vote.vote(address(election), SAMPLE_VOTER_3, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_3, SAMPLE_CANDIDATE_2);
        vote.vote(address(election), SAMPLE_VOTER_4, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_4, SAMPLE_CANDIDATE_2);
        vote.vote(address(election), SAMPLE_VOTER_5, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_5, SAMPLE_CANDIDATE_);

        DeclareWinner declareWinner = new DeclareWinner();
        vm.expectEmit(true , true, true, false, address(election));
        emit WinnerDeclared(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_ , election.getVotesPerCandidate(SAMPLE_CANDIDATE_));
        (string[] memory winnerName, string[] memory winningParty, uint256[] memory maxVotes) = declareWinner.declareWinner(address(election) , deployerKey);
        assertEq(winnerName[0] , SAMPLE_CANDIDATE_);
        assertEq(winningParty[0] , SAMPLE_POLITICAL_PARTY_);
        assertEq(maxVotes[0] , election.getVotesPerCandidate(SAMPLE_CANDIDATE_));
    } 

    function test_VerifyingAppropriateResultOnTie() external AddingCandidate{
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2, deployerKey);
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_CANDIDATE_);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_CANDIDATE_);
        vote.vote(address(election), SAMPLE_VOTER_3, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_3, SAMPLE_CANDIDATE_2);
        vote.vote(address(election), SAMPLE_VOTER_4, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_4, SAMPLE_CANDIDATE_2);
    
        DeclareWinner declareWinner = new DeclareWinner();
        (string[] memory winningCandidates, string[] memory winningParties, uint256[] memory maxVotesArray) = declareWinner.declareWinner(address(election) , deployerKey);
        
        assertEq(maxVotesArray[0] , maxVotesArray[1]);
        assertEq(winningParties.length , 2);
        assertEq(winningCandidates.length , 2);
    }
    
}