// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Test , console} from "forge-std/Test.sol";
import {AddCandidate , Vote , DeclareWinner , GetElectionDetails} from "../../script/Interactions.s.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";
import {Election} from "../../src/Election.sol";
import {DeployDeployElection} from "../../script/DeployDeployElection.s.sol";



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
    uint256 constant public SAMPLE_REGION_CODE= 400060;



    AddCandidate addCandidate;

    modifier AddingCandidate {
        addCandidate = new AddCandidate();
        addCandidate.addCandidate(address(election), SAMPLE_CANDIDATE_, SAMPLE_POLITICAL_PARTY_) ;
        _;
    }

    function setUp() external {
        DeployDeployElection deploydeployElection = new DeployDeployElection();
        DeployElection deployer= deploydeployElection.run();
        // (election , deployerKey  , owner ) = deployer.run();
        address electionAddress = deployer.run(SAMPLE_REGION_CODE , msg.sender);
        election  = Election(payable(electionAddress));
        console.log(msg.sender);
        console.log(election.getOwner());
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
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        assertEq(election.getVoters()[0].name , SAMPLE_VOTER_1);
        assertEq(election.getVoters()[0].aadharNumberHashed , keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)));
    }

    function test_AddingCandidateAndVotingFailure1 () external AddingCandidate{
        Vote vote = new Vote();
        vm.expectRevert(Election.CandidateDoesNotExist.selector);
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);            
    }

    function test_AddingCandidateAndVotingFailure2() external AddingCandidate{
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        addCandidate.addCandidate(address(election), SAMPLE_CANDIDATE_2, SAMPLE_POLITICAL_PARTY_2);
        vm.expectRevert(Election.VoterHasAlreadyVoted.selector);
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
    }

    


    ////////////////////
    //declareWinner////
    //////////////////

    function test_AddingCandidatesAndVotingAndDeclaringWinner() external AddingCandidate{
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2);
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_3, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_3, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_4, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_4, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_5, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_5, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);

        DeclareWinner declareWinner = new DeclareWinner();
        vm.expectEmit(true , true, true, false, address(election));
        emit WinnerDeclared(SAMPLE_CANDIDATE_ , SAMPLE_POLITICAL_PARTY_ , election.getVotesPerCandidate(SAMPLE_CANDIDATE_));
        (string[] memory winnerName, string[] memory winningParty, uint256[] memory maxVotes) = declareWinner.declareWinner(address(election) );
        assertEq(winnerName[0] , SAMPLE_CANDIDATE_);
        assertEq(winningParty[0] , SAMPLE_POLITICAL_PARTY_);
        assertEq(maxVotes[0] , election.getVotesPerCandidate(SAMPLE_POLITICAL_PARTY_));
    } 

    function test_VerifyingAppropriateResultOnTie() external AddingCandidate{
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2);
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_3, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_3, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_4, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_4, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
    
        DeclareWinner declareWinner = new DeclareWinner();
        (string[] memory winningCandidates, string[] memory winningParties, uint256[] memory maxVotesArray) = declareWinner.declareWinner(address(election) );
        
        assertEq(maxVotesArray[0] , maxVotesArray[1]);
        assertEq(winningParties.length , 2);
        assertEq(winningCandidates.length , 2);
    }

    ////////////////////////
    //GetElectionDetails///
    //////////////////////

    function test_GetOwnerReturnsRightAnswerOrWrong() external {
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        address ownerReturned = getElectionDetails.getOwner(address(election));
        assertEq(msg.sender , ownerReturned);
    }
    
    function test_GetVotersReturnsAllVoters() external AddingCandidate{
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        Election.Voter[] memory voters = getElectionDetails.getVoters(address(election));
        assertEq(voters.length ,2);
        assertEq(voters[0].name , SAMPLE_VOTER_1);
        assertEq(voters[0].regionOfResidentship , SAMPLE_REGION_CODE);
        assertEq(voters[0].aadharNumberHashed , keccak256(abi.encode(SAMPLE_AADHAR_NUMBER_1)));
        assertEq(getElectionDetails.getVotesPerCandidate(address(election) , SAMPLE_POLITICAL_PARTY_) ,2);
    }

    function test_GetElectionCandidates() external AddingCandidate{
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2);
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        assertEq(getElectionDetails.getElectionCandidates(address(election)).length , 2);
    }

    function test_GetElectionStatus() external AddingCandidate{
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        assert(getElectionDetails.getElectionStatus(address(election)) == election.getElectionStatus());
        DeclareWinner declareWinner = new DeclareWinner();
        declareWinner.declareWinner(address(election) );
        assert(getElectionDetails.getElectionStatus(address(election)) == election.getElectionStatus());
    }

    function test_GetVotersAfterElectionEnds() external AddingCandidate {
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        addCandidate.addCandidate(address(election),SAMPLE_CANDIDATE_2,SAMPLE_POLITICAL_PARTY_2);
        Vote vote = new Vote();
        vote.vote(address(election), SAMPLE_VOTER_1, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_1, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_2, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_2, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_3, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_3, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_4, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_4, SAMPLE_POLITICAL_PARTY_2 , SAMPLE_REGION_CODE);
        vote.vote(address(election), SAMPLE_VOTER_5, SAMPLE_BIRTH_DATE, SAMPLE_BIRTH_MONTH, SAMPLE_BIRTH_YEAR, SAMPLE_AADHAR_NUMBER_5, SAMPLE_POLITICAL_PARTY_ , SAMPLE_REGION_CODE);
        DeclareWinner declareWinner = new DeclareWinner();
        (, ,uint256[] memory mva) = declareWinner.declareWinner(address(election) );
        assertEq(mva[0] ,3);
        uint256[] memory votesCount = getElectionDetails.getVotesCount(address(election));
        assertEq(votesCount.length ,2);
        assertEq(votesCount[0] , 3);
        assertEq(votesCount[1] , 2);
    }
            // owner
        function test_OwnerIsSetCorrectly() external {
            GetElectionDetails getElectionDetails = new GetElectionDetails();
            address ownerReturned = getElectionDetails.getOwner(address(election));
            assertEq(ownerReturned, msg.sender);
        }

        //incrementation checks
        function test_NumberOfCandidatesIncremented() external AddingCandidate {
            assertEq(election.getCandidates().length, 1);
            addCandidate.addCandidate(address(election), SAMPLE_CANDIDATE_2, SAMPLE_POLITICAL_PARTY_2);
            assertEq(election.getCandidates().length, 2);
        }

       
}