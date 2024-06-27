// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {DevOpsTools} from 'lib/foundry-devops/src/DevOpsTools.sol';
import {Election} from "../src/Election.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract AddCandidate is Script{

    function addCandidate(address election ,string memory name , string memory politicalParty, uint256 deployerKey) public{ 
        vm.startBroadcast(deployerKey);
        Election(payable(election)).addCandidate(name, politicalParty);
        vm.stopBroadcast();
    }
}

contract Vote is Script {

    function vote(address election , string memory voterName, uint256 birthDate ,uint256 birthMonth ,uint256 birthYear , string memory aadharNumber , string memory candidateName ) public {
        vm.startBroadcast();
        Election(payable(election)).vote(voterName , birthDate , birthMonth , birthYear , aadharNumber , candidateName);
        vm.stopBroadcast();
    }
}

contract DeclareWinner is Script {

    function declareWinner(address election , uint256 deployerKey) public returns(string memory, string memory , uint256){
        vm.startBroadcast(deployerKey);
        (string memory winningCandidate, string memory winningParty, uint256 maxVotes) = Election(payable(election)).declareWinner();
        vm.stopBroadcast();
        return (winningCandidate , winningParty , maxVotes);
    }
}