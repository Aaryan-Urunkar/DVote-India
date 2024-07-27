// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script } from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract DeployElection is Script{
    
    event CreatedNewElection(address electionAddress);

    function run(address adminAddress) public returns(address){

        vm.startBroadcast();
        Election election = new Election(adminAddress);
        vm.stopBroadcast();
        emit CreatedNewElection(address(election));
        return address(election) ;
    }
}