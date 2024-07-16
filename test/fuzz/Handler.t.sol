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
        string calldata name,
        uint256 birthDate,
        uint256 birthMonth,
        uint256 birthYear,
        string calldata aadharNumber,
        string calldata candidateParty
    ) public {
        birthDate = bound(birthDate , 1, 31);
        birthMonth = bound(birthMonth , 1, 12);
        birthYear = bound(birthYear, 1947, 2006);

        uint256 voterRegion= _getRegionFromSeed(_regionSeed);
        vm.prank(OWNER);
        election.addCandidate(string(abi.encodePacked(candidateParty)),candidateParty);
        election.vote( name, birthDate , birthMonth , birthYear , aadharNumber , candidateParty , voterRegion );
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
