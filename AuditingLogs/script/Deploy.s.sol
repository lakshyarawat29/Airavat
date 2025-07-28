// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";      // import console for logging
import "../contracts/AuditLog.sol";  // make sure the file name is correct

contract DeployAuditLog is Script {
    function run() external {
        vm.startBroadcast();

        DataAccessLogger logger = new DataAccessLogger();

        console.log("Contract deployed at:", address(logger));

        vm.stopBroadcast();
    }
}
