// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script } from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract DeployElection is Script{
    
    function run(uint256 sample_region_code, address adminAddress) public returns(Election ){

        vm.startBroadcast();
        Election election = new Election(sample_region_code, adminAddress);
        vm.stopBroadcast();
        return election ;
    }

    function deployElection(uint256 regionCode , address adminAddress) external returns(Election ){
        vm.startBroadcast();
        Election election = new Election(regionCode , adminAddress);
        vm.stopBroadcast();
        return election;
    }
}