/** 
 * Some invariants in our project:
 * 1. No one can vote once election has ended
 * 2. Voters from different regions ABSOLUTELY not allowed
 * 3. Candidates from same party absolutely not allowed
 */

// SPDX-License-Identifier:MIT
pragma solidity ^0.8.23;
import {Test , console } from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Election} from "../../src/Election.sol";
import {DeployElection} from "../../script/DeployElection.s.sol";
import {Handler} from "./Handler.t.sol";

contract Invariants is StdInvariant , Test {
    
    uint256 constant SAMPLE_REGION_CODE = 400155;
    Election election;
    Handler handler;
    address OWNER = makeAddr("owner");

    function setUp() public {
        DeployElection deployer = new DeployElection();
        election = Election(payable(deployer.run(SAMPLE_REGION_CODE , OWNER)));
        handler = new Handler(election , OWNER);
        targetContract(address(handler));
    }

    /*Run with fail_on_revert = false in foundry.toml 
        Resolves invariant no.2

        The reverts are only due to VoterNotVotingFromResidentshipRegion() and PartyAlreadyExists()
    */
    function invariant_noVotesFromCandidatesOfOtherRegions()external view{
        bool allCandidatesFromCorrectRegion = true;
        //Election.Voter[] memory voters = election.getVoters();
        uint256 length = election.getVoterTurnout();
        // Election.Voter memory temp;
        for(uint256 i = 0 ; i<length ; i++){
            temp = voters[i];
            if(temp.regionOfResidentship != SAMPLE_REGION_CODE){
                allCandidatesFromCorrectRegion = false;
            }
        }
        assert(allCandidatesFromCorrectRegion);
    }


}