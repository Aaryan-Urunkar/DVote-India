// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script{

    uint256 private deployerKey;
    address publicAddress;

    uint256 public constant DEFAULT_ANVIL_PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public constant ANVIL_PUBLIC_KEY = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    constructor() {
        if(block.chainid == 31337){ //Anvil localhost
            deployerKey = DEFAULT_ANVIL_PRIVATE_KEY;
            publicAddress =  ANVIL_PUBLIC_KEY;
        } else if(block.chainid == 11155111){ //Sepolia testnet
            deployerKey = vm.envUint("PRIVATE_KEY");
            publicAddress = vm.envAddress("SEPOLIA_PUBLIC_KEY");
        }
    }

    function run() external view returns(uint256 , address){
        return (deployerKey , publicAddress);
    }
}