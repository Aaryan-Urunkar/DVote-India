// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script} from "forge-std/Script.sol";
import {AddCandidate , Vote , DeclareWinner , GetElectionDetails} from "./Interactions.s.sol";

contract DeployAddCandidate is Script {
    function run() external returns(AddCandidate){
        vm.startBroadcast();
        AddCandidate addCandidate = new AddCandidate();
        vm.stopBroadcast();
        return (addCandidate);
    }
}

contract DeployVote is Script {
    function run() external returns(Vote){
        vm.startBroadcast();
        Vote vote = new Vote();
        vm.stopBroadcast();
        return (vote);
    }
}

contract DeployDeclareWinner is Script {
    function run() external returns(DeclareWinner){
        vm.startBroadcast();
        DeclareWinner declareWinner = new DeclareWinner();
        vm.stopBroadcast();
        return (declareWinner);
    }
}

contract DeployGetElectionDetails is Script {
    function run() external returns(GetElectionDetails){
        vm.startBroadcast();
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        vm.stopBroadcast();
        return (getElectionDetails);
    }
}