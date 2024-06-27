// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script , console} from "forge-std/Script.sol";
import {DevOpsTools} from 'lib/foundry-devops/src/DevOpsTools.sol';
import {Election} from "../src/Election.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract AddCandidate is Script{

    string public constant CANDIDATE_NAME = "ABCD";
    string public constant PARTY ="SS";  
    
    function run() external {
        address recentElectionDeployment = DevOpsTools.get_most_recent_deployment("Election" , block.chainid);
        console.log(recentElectionDeployment);
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key , )= helperConfig.run();
        //vm.startBroadcast(key);
        addCandidate(recentElectionDeployment , CANDIDATE_NAME , PARTY , key);
        //vm.stopBroadcast();
    }

    function addCandidate(address election ,string memory name , string memory politicalParty, uint256 deployerKey) public{ 
        vm.startBroadcast(deployerKey);
        Election(payable(election)).addCandidate(name, politicalParty);
        vm.stopBroadcast();
    }
}

contract Vote is Script {

    string public constant SAMPLE_VOTER_1= "VarunAaryanSwayamDevesh";
    string public constant SAMPLE_AADHAR_NUMBER_1="317436889927";
    uint256 public constant SAMPLE_BIRTH_DATE=13;
    string public constant SAMPLE_CANDIDATE_="ABCD";
    uint256 public constant SAMPLE_BIRTH_MONTH=9;
    uint256 public constant SAMPLE_BIRTH_YEAR=2005;


    function run() external {
        address recentElectionDeployment = DevOpsTools.get_most_recent_deployment("Election" , block.chainid);
        //vm.startBroadcast();
        vote(recentElectionDeployment , SAMPLE_VOTER_1 , SAMPLE_BIRTH_DATE , SAMPLE_BIRTH_MONTH , SAMPLE_BIRTH_YEAR , SAMPLE_AADHAR_NUMBER_1 ,SAMPLE_CANDIDATE_ );
        //vm.stopBroadcast();
    }

    function vote(address election , string memory voterName, uint256 birthDate ,uint256 birthMonth ,uint256 birthYear , string memory aadharNumber , string memory candidateName ) public {
        vm.startBroadcast();
        Election(payable(election)).vote(voterName , birthDate , birthMonth , birthYear , aadharNumber , candidateName);
        vm.stopBroadcast();
    }
}

contract DeclareWinner is Script {
    function run() external returns(string memory, string memory , uint256){
        address recentElectionDeployment = DevOpsTools.get_most_recent_deployment("Election" , block.chainid);
        HelperConfig helperConfig = new HelperConfig();
        (uint256 key , )= helperConfig.run();
        //vm.startBroadcast(key);
        (string memory winningCandidate, string memory winningParty, uint256 maxVotes) = declareWinner(recentElectionDeployment , key);
        //vm.stopBroadcast();
        return (winningCandidate , winningParty , maxVotes);
    }

    function declareWinner(address election , uint256 deployerKey) public returns(string memory, string memory , uint256){
        vm.startBroadcast(deployerKey);
        (string memory winningCandidate, string memory winningParty, uint256 maxVotes) = Election(payable(election)).declareWinner();
        vm.stopBroadcast();
        return (winningCandidate , winningParty , maxVotes);
    }
}