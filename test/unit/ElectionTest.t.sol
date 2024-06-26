// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Election} from "../../src/Election.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";
import {Test , console} from "../../lib/forge-std/src/Test.sol";

contract ElectionTest is Test {

    event CandidateAdded(string indexed name , string indexed politicalParty);
    event VoterAdded(bytes32 indexed aadharNumberHashed , string name);

    Election public election;

    string sampleVoter1= "VarunAaryanSwayamDevesh";
    string sampleVoter2="Aaryan";
    string sampleVoter3="Varun";
    string sampleVoter4='Devesh';
    string sampleVoter5="Swayam";

    string sampleCandidate="ABCD";
    string sampleCandidate2="EFGH";
    string samplePoliticalParty="SS";
    string samplePoliticalParty2="INC";
    string sampleAadharNumber1="317436889927";
    string sampleAadharNumber2="887436889927";
    string sampleAadharNumber3="517436889927";
    string sampleAadharNumber4="217436889927";
    string sampleAadharNumber5="317467889927";

    uint256 sampleBirthDate=13;
    uint256 sampleBirthMonth=9;
    uint256 sampleBirthYear=2005;

    modifier AddCandidate {
        vm.prank(msg.sender);
        election.addCandidate(sampleCandidate , samplePoliticalParty);
        _;
    }


    function setUp() external {
        //Write the setup for your tests here
        DeployElection deployer= new DeployElection();
        vm.prank(msg.sender);
        election = deployer.run();
    }

    function test_DeployerIsOwner()external view{
        assertEq(election.getOwner() , msg.sender);
    }

    function test_InitalElectionStateIsOpen() external view{
        assert(election.getElectionStatus() == Election.ElectionState.OPEN);
    }

    function test_Receive() external {
        address temp = makeAddr(sampleCandidate);
        vm.deal(temp , 1 ether);
        vm.prank(temp);
        vm.expectRevert(Election.IllegalTransfer.selector);
        payable(address(election)).transfer(0.5 ether);
    }

    ////////////////
    //endElection//
    //////////////

    function test_EndElectionSetsElectionStateEnded() external {
        vm.prank(msg.sender);
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
        election.addCandidate(sampleCandidate , samplePoliticalParty);
    }

    function test_AddingCandidateUpdatesCandidatesArray() external AddCandidate{
        assertEq(election.getCandidates().length , 1);
        assertEq(election.getCandidates()[0].name , sampleCandidate);
        assertEq(election.getCandidates()[0].politicalParty , samplePoliticalParty);
    }

    function test_AddingMultipleCandidatesOfSamePartyProhibited() external AddCandidate{
        vm.prank(msg.sender);
        vm.expectRevert(Election.PartyAlreadyExists.selector);
        election.addCandidate(sampleCandidate2 , samplePoliticalParty);
    }

    function test_AddingCandidateAfterElectionEnded() external {
        vm.prank(msg.sender);
        election.endElection();
        vm.prank(msg.sender);
        vm.expectRevert(Election.ElectionNotOpen.selector);
        election.addCandidate(sampleCandidate , samplePoliticalParty);
    }

    function test_AddCandidateEmitsEvent() external {
        vm.expectEmit(true , true , false, false , address(election));
        emit CandidateAdded(sampleCandidate , samplePoliticalParty);
        vm.prank(msg.sender);
        election.addCandidate(sampleCandidate , samplePoliticalParty);
    }

    function test_AddCandidateSetsInitialVoteCountToZero()external AddCandidate{
        assertEq(election.getVotesPerCandidate(sampleCandidate) , 0);
    }

    ////////////
    //vote/////
    //////////

    function test_CannotVoteIfElectionEnded() external AddCandidate{
        vm.prank(msg.sender);
        election.endElection();
        vm.expectRevert(Election.ElectionNotOpen.selector);
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
    }

    function test_CannotVoteForNonExistentCandidate() external AddCandidate{
        string memory nonExistent = "NonExistentCandidate";
        vm.prank(msg.sender);
        vm.expectRevert(Election.CandidateDoesNotExist.selector);
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,nonExistent);
    }

    function test_VoterVotingUpdatesVoterArray() external AddCandidate{
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
        Election.Voter memory voter = election.getVoters()[0];
        assertEq(election.getVoters().length , 1);
        assertEq(voter.name , sampleVoter1);
        assertEq(voter.birthDate  ,sampleBirthDate);
        assertEq(voter.birthMonth , sampleBirthMonth);
        assertEq(voter.birthYear , sampleBirthYear);
        assertEq(keccak256(abi.encode(sampleAadharNumber1)) , voter.aadharNumberHashed);
    }

    function testFail_SameVoterVotesTwice() external AddCandidate{
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
    }

    function test_VotingIncrementsCandidateVotes() external AddCandidate{
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
        election.vote(sampleVoter2,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber2,sampleCandidate);
        assertEq(election.getVotesPerCandidate(sampleCandidate) , 2);
        
        vm.prank(msg.sender);
        election.addCandidate( sampleCandidate2, samplePoliticalParty2);
        election.vote(sampleVoter3,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber3,sampleCandidate2);
        election.vote(sampleVoter4,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber4,sampleCandidate2);
        election.vote(sampleVoter5,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber5,sampleCandidate2);
        assertEq(election.getVotesPerCandidate(sampleCandidate2) , 3);
    }

    function test_VotingEmitsEvent() external AddCandidate {
        vm.expectEmit(true, false,false,false,address(election));
        emit VoterAdded( keccak256(abi.encode(sampleAadharNumber1)) , sampleVoter1);
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
    }

    ////////////////////
    //declareWinner////
    //////////////////

    function test_OnlyOwnerCanCallDeclareWinner() external {
        vm.expectRevert(Election.NotOwner.selector);
        election.declareWinner();
    }

    function test_VotesCountIsUpdatedAndCorrectValuesReturned() external AddCandidate {
        election.vote(sampleVoter1,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber1,sampleCandidate);
        election.vote(sampleVoter2,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber2,sampleCandidate);
    
        vm.prank(msg.sender);
        election.addCandidate( sampleCandidate2, samplePoliticalParty2);
        election.vote(sampleVoter3,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber3,sampleCandidate2);
        election.vote(sampleVoter4,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber4,sampleCandidate2);
        election.vote(sampleVoter5,sampleBirthDate,sampleBirthMonth,sampleBirthYear,sampleAadharNumber5,sampleCandidate2);
        vm.prank(msg.sender);
        (string memory name, string memory party,uint256 maxVotes) = election.declareWinner();
        assertEq(keccak256(abi.encode(name)) , keccak256(abi.encode(sampleCandidate2)));
        assertEq(keccak256(abi.encode(party)) , keccak256(abi.encode(samplePoliticalParty2)));
        assertEq(maxVotes,3);

        assertEq(election.getCandidates().length , election.getVotesCount().length);
    }

    function test_DeclareWinnerEndsElection() external {
        vm.prank(msg.sender);
        election.declareWinner();
        assert(election.getElectionStatus() == Election.ElectionState.ENDED);
    }

}