// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployElection is Script{
    function run() public returns(Election , uint256, address){
        
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key , address ownerAddress ) =  helperConfig.run();
        vm.startBroadcast(key);
        Election election = new Election();
        vm.stopBroadcast();
        return (election , key, ownerAddress);
    }
}