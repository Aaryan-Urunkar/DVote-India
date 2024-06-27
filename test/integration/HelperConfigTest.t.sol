// SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;
import {Test} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract HelperConfigTest is Test {

    HelperConfig helperConfig;

    function setUp() external {

    }

    function test_WhenChainIdIs31337() external{
        vm.chainId(31337);
        helperConfig = new HelperConfig();
        (uint256 deployerKey , address owner) = helperConfig.run();
        assertEq(deployerKey , helperConfig.DEFAULT_ANVIL_PRIVATE_KEY());
        assertEq(owner , helperConfig.ANVIL_PUBLIC_KEY());
    }

    function test_WhenChainIdIs11155111() external{
        vm.chainId(11155111);
        helperConfig = new HelperConfig();
        (uint256 deployerKey , address owner) = helperConfig.run();
        assertEq(deployerKey , vm.envUint("PRIVATE_KEY"));
        assertEq(owner , vm.envAddress("SEPOLIA_PUBLIC_KEY"));
    }
}