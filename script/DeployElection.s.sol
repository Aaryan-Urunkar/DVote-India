// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "../lib/forge-std/src/Script.sol";
import {Election} from "../src/Election.sol";

contract DeployElection is Script{
    function run() public returns(Election){
        vm.prank(msg.sender);
        Election election = new Election();
        return election;
    }
}