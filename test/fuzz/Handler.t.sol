// SPDX-License-Identifier:MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Election} from "../../src/Election.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";

contract Handler is Test {
    Election election;
    uint256 votes_count;
    uint256 constant SAMPLE_REGION_CODE = 400155;
    address OWNER;

    constructor(Election _election , address _owner) {
        election = _election;
        OWNER = _owner;
        votes_count = 0;
    }

    function Vote(
        uint256 _regionSeed,
        bytes32 name,
        bytes32 aadharNumber,
        bytes32 candidateParty
    ) public {
        uint256 voterRegion= _getRegionFromSeed(_regionSeed);
        vm.prank(OWNER);
        election.addCandidate(bytes32(abi.encodePacked(candidateParty)),bytes32(candidateParty));
        election.vote( bytes32(name), bytes32(aadharNumber) , bytes32(candidateParty) , voterRegion );
        votes_count++;
    }

    function declareWinner() public {
        vm.prank(OWNER);
        election.declareWinner();
    }

    ////////////////////////////
    /////Private getters///////
    //////////////////////////

    function _getRegionFromSeed(uint256 _regionSeed) public pure returns(uint256){
        uint256 random_region_code = 56;
        if(_regionSeed %2 == 0){
            return SAMPLE_REGION_CODE;
        } else  {
            return random_region_code;
            // return SAMPLE_REGION_CODE;
        }
    }
}
