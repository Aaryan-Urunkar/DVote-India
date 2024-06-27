// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Election} from "../../src/Election.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";
import {Test , console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract ElectionTest is Test {

    event CandidateAdded(string indexed name , string indexed politicalParty);
    event VoterAdded(bytes32 indexed aadharNumberHashed , string name);
    event WinnerDeclared(string indexed winningCandidate , string indexed winningParty , uint256 maxVotes);
    event Tie(string[] indexed winningCandidates , string[] indexed winningParties);

    Election public election;

    string constant SAMPLE_VOTER_1= "VarunAaryanSwayamDevesh";
    string constant SAMPLE_VOTER_2="Aaryan";
    string constant SAMPLE_VOTER_3="Varun";
    string constant SAMPLE_VOTER_4='Devesh';
    string constant SAMPLE_VOTER_5="Swayam";

    string constant SAMPLE_CANDIDATE_="ABCD";
    string constant SAMPLE_CANDIDATE_2="EFGH";
    string constant SAMPLE_POLITICAL_PARTY_="SS";
    string constant SAMPLE_POLITICAL_PARTY_2="INC";
    string constant SAMPLE_AADHAR_NUMBER_1="317436889927";
    string constant SAMPLE_AADHAR_NUMBER_2="887436889927";
    string constant SAMPLE_AADHAR_NUMBER_3="517436889927";
    string constant SAMPLE_AADHAR_NUMBER_4="217436889927";
    string constant SAMPLE_AADHAR_NUMBER_5="317467889927";

    uint256 constant SAMPLE_BIRTH_DATE=13;
    uint256 constant SAMPLE_BIRTH_MONTH=9;
    uint256 constant SAMPLE_BIRTH_YEAR=2005;

    address owner;

    modifier AddCandidate {
        vm.prank(owner);
        election.addCandidate(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_);
        _;
    }


    function setUp() external {
        //Write the setup for your tests here
        DeployElection deployer= new DeployElection();
        //vm.prank(msg.sender);
        (election, ,owner) = deployer.run();
    }

    function test_DeployerIsOwner()external view{
        assertEq(election.getOwner() , owner);
    }

    function test_InitalElectionStateIsOpen() external view{
        assert(election.getElectionStatus() == Election.ElectionState.OPEN);
    }

    function test_Receive() external {
        address temp = makeAddr(SAMPLE_CANDIDATE_);
        vm.deal(temp , 1 ether);
        vm.prank(temp);
        vm.expectRevert(Election.IllegalTransfer.selector);
        payable(address(election)).transfer(0.5 ether);
    }

    ////////////////
    //endElection//
    //////////////

    function test_EndElectionSetsElectionStateEnded() external {
        vm.prank(owner);
        election.endElection();
        assert(election.getElectionStatus() == Election.ElectionState.ENDED);
    }

    function testFail_NonOwnerCannotEndElection() external {
        election.endElection();
    }

    /////////////////
    //addCandidate//
    ///////////////

    function testFail_NonOwnerCantAddCandidate() external {
        election.addCandidate(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_);
    }

    function test_AddingCandidateUpdatesCandidatesArray() external AddCandidate{
        assertEq(election.getCandidates().length , 1);
        assertEq(election.getCandidates()[0].name , SAMPLE_CANDIDATE_);
        assertEq(election.getCandidates()[0].politicalParty , SAMPLE_POLITICAL_PARTY_);
    }

    function test_AddingMultipleCandidatesOfSamePartyProhibited() external AddCandidate{
        vm.prank(owner);
        vm.expectRevert(Election.PartyAlreadyExists.selector);
        election.addCandidate(SAMPLE_CANDIDATE_2 , SAMPLE_POLITICAL_PARTY_);
    }

    function test_AddingCandidateAfterElectionEnded() external {
        vm.prank(owner);
        election.endElection();
        vm.prank(owner);
        vm.expectRevert(Election.ElectionNotOpen.selector);
        election.addCandidate(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_);
    }

    function test_AddCandidateEmitsEvent() external {
        vm.expectEmit(true , true , false, false , address(election));
        emit CandidateAdded(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_);
        vm.prank(owner);
        election.addCandidate(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_);
    }

    function test_AddCandidateSetsInitialVoteCountToZero()external AddCandidate{
        assertEq(election.getVotesPerCandidate(SAMPLE_CANDIDATE_) , 0);
    }

    ////////////
    //vote/////
    //////////

    function test_CannotVoteIfElectionEnded() external AddCandidate{
        vm.prank(owner);
        election.endElection();
        vm.expectRevert(Election.ElectionNotOpen.selector);
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
    }

    function test_CannotVoteForNonExistentCandidate() external AddCandidate{
        string memory nonExistent = "NonExistentCandidate";
        vm.prank(owner);
        vm.expectRevert(Election.CandidateDoesNotExist.selector);
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,nonExistent);
    }

    function test_VoterVotingUpdatesVoterArray() external AddCandidate{
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
        Election.Voter memory voter = election.getVoters()[0];
        assertEq(election.getVoters().length , 1);
        assertEq(voter.name , SAMPLE_VOTER_1);
        assertEq(voter.birthDate  ,SAMPLE_BIRTH_DATE);
        assertEq(voter.birthMonth , SAMPLE_BIRTH_MONTH);
        assertEq(voter.birthYear , SAMPLE_BIRTH_YEAR);
        assertEq(keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)) , voter.aadharNumberHashed);
    }

    function testFail_SameVoterVotesTwice() external AddCandidate{
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
    }

    function test_VotingIncrementsCandidateVotes() external AddCandidate{
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
        election.vote(SAMPLE_VOTER_2,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_2,SAMPLE_CANDIDATE_);
        assertEq(election.getVotesPerCandidate(SAMPLE_CANDIDATE_) , 2);
        
        vm.prank(owner);
        election.addCandidate( SAMPLE_CANDIDATE_2, SAMPLE_POLITICAL_PARTY_2);
        election.vote(SAMPLE_VOTER_3,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_3,SAMPLE_CANDIDATE_2);
        election.vote(SAMPLE_VOTER_4,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_4,SAMPLE_CANDIDATE_2);
        election.vote(SAMPLE_VOTER_5,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_5,SAMPLE_CANDIDATE_2);
        assertEq(election.getVotesPerCandidate(SAMPLE_CANDIDATE_2) , 3);
    }

    function test_VotingEmitsEvent() external AddCandidate {
        vm.expectEmit(true, false,false,false,address(election));
        emit VoterAdded( keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)) , SAMPLE_VOTER_1);
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
    }

    ////////////////////
    //declareWinner////
    //////////////////

    function test_OnlyOwnerCanCallDeclareWinner() external {
        vm.expectRevert(Election.NotOwner.selector);
        election.declareWinner();
    }

    function test_VotesCountIsUpdatedAndCorrectValuesReturned() external AddCandidate {
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
        election.vote(SAMPLE_VOTER_2,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_2,SAMPLE_CANDIDATE_);
    
        vm.prank(owner);
        election.addCandidate( SAMPLE_CANDIDATE_2, SAMPLE_POLITICAL_PARTY_2);
        election.vote(SAMPLE_VOTER_3,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_3,SAMPLE_CANDIDATE_2);
        election.vote(SAMPLE_VOTER_4,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_4,SAMPLE_CANDIDATE_2);
        election.vote(SAMPLE_VOTER_5,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_5,SAMPLE_CANDIDATE_2);
        vm.expectEmit(true, true , true, false ,address(election));
        emit WinnerDeclared(SAMPLE_CANDIDATE_2 , SAMPLE_POLITICAL_PARTY_2, election.getVotesPerCandidate(SAMPLE_CANDIDATE_2));

        vm.prank(owner);
        (string[] memory name, string[] memory party ,uint256[] memory maxVotes) = election.declareWinner();
        assertEq(keccak256(abi.encode(name[0])) , keccak256(abi.encode(SAMPLE_CANDIDATE_2)));
        assertEq(keccak256(abi.encode(party[0])) , keccak256(abi.encode(SAMPLE_POLITICAL_PARTY_2)));
        assertEq(maxVotes[0],3);

        assertEq(election.getCandidates().length , election.getVotesCount().length);
    }

    function test_DeclareWinnerEndsElection() external {
        vm.prank(owner);
        election.declareWinner();
        assert(election.getElectionStatus() == Election.ElectionState.ENDED);
    }

    function test_GetVotesCountWhenElectionIsOpen()external AddCandidate {
        election.vote(SAMPLE_VOTER_1,SAMPLE_BIRTH_DATE,SAMPLE_BIRTH_MONTH,SAMPLE_BIRTH_YEAR,SAMPLE_AADHAR_NUMBER_1,SAMPLE_CANDIDATE_);
        vm.expectRevert(Election.ElectionNotEnded.selector);
        election.getVotesCount();
    }

    function test_WhenTiedTieEventIsEmittedAndAllCandidatesAreReturned() external AddCandidate{
        vm.prank(owner);
        election.addCandidate(SAMPLE_CANDIDATE_2 , SAMPLE_POLITICAL_PARTY_2);
        election.vote(SAMPLE_VOTER_1 , SAMPLE_BIRTH_DATE , SAMPLE_BIRTH_MONTH , SAMPLE_BIRTH_YEAR , SAMPLE_AADHAR_NUMBER_1 , SAMPLE_CANDIDATE_2);
        election.vote(SAMPLE_VOTER_2 , SAMPLE_BIRTH_DATE , SAMPLE_BIRTH_MONTH , SAMPLE_BIRTH_YEAR , SAMPLE_AADHAR_NUMBER_2 , SAMPLE_CANDIDATE_);
        string[] memory winningCandidatesArray= new string[](election.getCandidates().length);
        
        winningCandidatesArray[0] = SAMPLE_CANDIDATE_;
        winningCandidatesArray[1] = SAMPLE_CANDIDATE_2;
        string[] memory winningPartiesArray= new string[](election.getCandidates().length);
        winningPartiesArray[0] = SAMPLE_POLITICAL_PARTY_;
        winningPartiesArray[1] = SAMPLE_POLITICAL_PARTY_2;  
        vm.prank(owner);
        vm.expectEmit(true , true , false, false, address(election));
        emit Tie(winningCandidatesArray , winningPartiesArray);
        
        (string[] memory winningCandidates, string[] memory winningParties, uint256[] memory maxVotesArray) = election.declareWinner();
        
        assertEq(maxVotesArray[0] , maxVotesArray[1]);
        assertEq(winningParties.length , 2);
        assertEq(winningCandidates.length , 2);
    }

}