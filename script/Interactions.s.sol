// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract AddCandidate is Script{

    function addCandidate(address election ,bytes32  name , bytes32  politicalParty) public{ 
        vm.startBroadcast();
        Election(payable(election)).addCandidate(name, politicalParty);
        vm.stopBroadcast();
    }
}

contract Vote is Script {

    function vote(address election , bytes32  voterName, bytes32  aadharNumber , bytes32 candidateName , uint256 regionCode) public {
        vm.startBroadcast();
        Election(payable(election)).vote(voterName , aadharNumber , candidateName , regionCode);
        vm.stopBroadcast();
    }
}

contract DeclareWinner is Script {

    function declareWinner(address election ) public returns(bytes32[]memory, bytes32[]memory , bytes32[] memory){
        vm.startBroadcast();
        (bytes32[] memory winningCandidates, bytes32[] memory winningParties, bytes32[] memory maxVotes) = Election(payable(election)).declareWinner();
        vm.stopBroadcast();
        return ( winningCandidates, winningParties, maxVotes );
    }
}

contract GetElectionDetails is Script{

    function getElectionCandidates(address election ) view public returns (Election.Candidate[] memory){
        Election.Candidate[] memory candidates =  Election(payable(election)).getCandidates();
        return candidates;
    }

    function getElectionStatus(address election ) view public returns(Election.ElectionState){
        Election.ElectionState state =  Election(payable(election)).getElectionStatus();
        return state;
    }

    function getOwner(address election) view public returns (address) {
        address ownerAddress = Election(payable(election)).getOwner();
        return ownerAddress;
    }

    function getVotesPerCandidate(address election , bytes32 candidatePoliticalParty)public  view returns(uint256){
        uint256 votes = Election(payable(election)).getVotesPerCandidate(candidatePoliticalParty);
        return votes;
    }
}