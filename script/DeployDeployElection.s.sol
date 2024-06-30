// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script} from "forge-std/Script.sol";
import {DeployElection} from  "./DeployElection.s.sol";

contract DeployDeployElection is Script {
    function run() external returns(DeployElection){
        vm.startBroadcast();
        DeployElection deployElection = new DeployElection();
        vm.stopBroadcast();
        return deployElection;
    }
}