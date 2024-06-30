// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {Test , console} from "forge-std/Test.sol";
import {DeployAddCandidate , DeployVote, DeployDeclareWinner , DeployGetElectionDetails } from "../../script/DeployInteractions.s.sol";
import {AddCandidate , Vote , DeclareWinner , GetElectionDetails} from "../../script/Interactions.s.sol";

contract DeployInteractions is Test{
    
    AddCandidate addCandidate;
    Vote vote;
    DeclareWinner declareWinner;
    GetElectionDetails getElectionDetails;

    function setUp() external {
        DeployAddCandidate deployAddCandidate = new DeployAddCandidate(); 
        addCandidate = deployAddCandidate.run();
        DeployVote deployVote = new DeployVote();
        vote = deployVote.run();
        DeployDeclareWinner deployDeclareWinner = new DeployDeclareWinner();
        declareWinner = deployDeclareWinner.run();
        DeployGetElectionDetails deployGetElectionDetails = new DeployGetElectionDetails();
        getElectionDetails = deployGetElectionDetails.run();
    }

    function testFail_DeploysAddressesAre0x00() external view{
        assertEq(address(addCandidate) , address(0));
        assertEq(address(vote) , address(0));
        assertEq(address(declareWinner) , address(0));
        assertEq(address(getElectionDetails) , address(0));
    }
}