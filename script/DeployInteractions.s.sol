// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script} from "forge-std/Script.sol";
import {AddCandidate , Vote , DeclareWinner , GetElectionDetails} from "./Interactions.s.sol";
import {HelperConfig}from './HelperConfig.s.sol';

contract DeployAddCandidate is Script {
    function run() external returns(AddCandidate){
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key ,  ) =  helperConfig.run();
        vm.startBroadcast(key);
        AddCandidate addCandidate = new AddCandidate();
        vm.stopBroadcast();
        return (addCandidate);
    }
}

contract DeployVote is Script {
    function run() external returns(Vote){
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key ,  ) =  helperConfig.run();
        vm.startBroadcast(key);
        Vote vote = new Vote();
        vm.stopBroadcast();
        return (vote);
    }
}

contract DeployDeclareWinner is Script {
    function run() external returns(DeclareWinner){
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key ,  ) =  helperConfig.run();
        vm.startBroadcast(key);
        DeclareWinner declareWinner = new DeclareWinner();
        vm.stopBroadcast();
        return (declareWinner);
    }
}

contract DeployGetElectionDetails is Script {
    function run() external returns(GetElectionDetails){
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key ,  ) =  helperConfig.run();
        vm.startBroadcast(key);
        GetElectionDetails getElectionDetails = new GetElectionDetails();
        vm.stopBroadcast();
        return (getElectionDetails);
    }
}