// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract AddCandidate is Script{

    function addCandidate(address election ,string memory name , string memory politicalParty) public{ 
        vm.startBroadcast();
        Election(payable(election)).addCandidate(name, politicalParty);
        vm.stopBroadcast();
    }
}

contract Vote is Script {

    function vote(address election , string memory voterName, uint256 birthDate ,uint256 birthMonth ,uint256 birthYear , string memory aadharNumber , string memory candidateName , uint256 regionCode) public {
        vm.startBroadcast();
        Election(payable(election)).vote(voterName , birthDate , birthMonth , birthYear , aadharNumber , candidateName , regionCode);
        vm.stopBroadcast();
    }
}

contract DeclareWinner is Script {

    function declareWinner(address election ) public returns(string[] memory, string[] memory , uint256[] memory){
        vm.startBroadcast();
        (string[] memory winningCandidates, string[] memory winningParties, uint256[] memory maxVotes) = Election(payable(election)).declareWinner();
        vm.stopBroadcast();
        return ( winningCandidates, winningParties, maxVotes );
    }
}

contract GetElectionDetails is Script{

    function getElectionCandidates(address election ) view public returns (Election.Candidate[] memory){
        Election.Candidate[] memory candidates =  Election(payable(election)).getCandidates();
        return candidates;
    }

    function getVoters(address election ) view public returns(Election.Voter[] memory){
        Election.Voter[] memory voters =  Election(payable(election)).getVoters();
        return voters;
    }

    function getElectionStatus(address election ) view public returns(Election.ElectionState){
        Election.ElectionState state =  Election(payable(election)).getElectionStatus();
        return state;
    }

    function getVotesCount(address election) view public returns (uint256[] memory){
        uint256[] memory votersCount =  Election(payable(election)).getVotesCount();
        return votersCount;
    }

    function getOwner(address election) view public returns (address) {
        address ownerAddress = Election(payable(election)).getOwner();
        return ownerAddress;
    }

    function getVotesPerCandidate(address election , string memory candidatePoliticalParty)public  view returns(uint256){
        uint256 votes = Election(payable(election)).getVotesPerCandidate(candidatePoliticalParty);
        return votes;
    }
}