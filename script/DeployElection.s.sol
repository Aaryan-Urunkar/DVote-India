// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployElection is Script{
    uint256 constant public SAMPLE_REGION_CODE= 400060;
    function run() public returns(Election ,  address){
        
        HelperConfig helperConfig = new HelperConfig();
        ( , address ownerAddress ) =  helperConfig.run();
        vm.startBroadcast();
        Election election = new Election(SAMPLE_REGION_CODE, msg.sender);
        vm.stopBroadcast();
        return (election ,  ownerAddress);
    }

    function deployElection(uint256 regionCode , address adminAddress) external returns(Election , address){
        vm.startBroadcast();
        Election election = new Election(regionCode , adminAddress);
        vm.stopBroadcast();
        return (election ,  adminAddress);
    }
}