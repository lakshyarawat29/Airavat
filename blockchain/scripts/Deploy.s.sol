// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AiravatLogger.sol";

contract DeployAiravatLogger is Script {
    function run() external {
        vm.startBroadcast();

        AiravatLogger logger = new AiravatLogger();
        console.log("Contract deployed to:", address(logger));

        vm.stopBroadcast();
    }
}
