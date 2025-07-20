// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AiravatLogger.sol";

contract AiravatLoggerTest is Test {
    AiravatLogger logger;

    address owner = address(0x1);
    address agent1 = address(0x2);
    address agent2 = address(0x3);
    address unassigned = address(0x4);

    function setUp() public {
        vm.prank(owner);
        logger = new AiravatLogger();
    }

    function testAssignAgentRole() public {
        vm.prank(owner);
        logger.assignAgent(agent1, AiravatLogger.AgentRole.RBA);

        assertEq(
            uint(logger.agentRoles(agent1)),
            uint(AiravatLogger.AgentRole.RBA)
        );
    }

    function testRevokeAgentRole() public {
        vm.startPrank(owner);
        logger.assignAgent(agent1, AiravatLogger.AgentRole.DRA);
        logger.revokeAgent(agent1);
        vm.stopPrank();

        assertEq(
            uint(logger.agentRoles(agent1)),
            uint(AiravatLogger.AgentRole.None)
        );
    }

    function testStoreLogByAssignedAgent() public {
        vm.prank(owner);
        logger.assignAgent(agent1, AiravatLogger.AgentRole.VRA);

        vm.prank(agent1);
        logger.storeLog("REQ123", 75, "APPROVED");

        (
            address storedAgent,
            ,
            bytes32 reqId,
            uint8 riskScore,
            string memory status,
            uint256 timestamp
        ) = logger.logs(0);

        assertEq(storedAgent, agent1);
        assertEq(reqId, keccak256(abi.encodePacked("REQ123")));
        assertEq(riskScore, 75);
        assertEq(status, "APPROVED");
        assertGt(timestamp, 0);
    }

    function testStoreLogFailsForUnassigned() public {
        vm.expectRevert("Not an assigned agent");
        vm.prank(unassigned);
        logger.storeLog("REQ123", 50, "DENIED");
    }

    function testAssignFailsWithNoneRole() public {
        vm.expectRevert("Invalid role");
        vm.prank(owner);
        logger.assignAgent(agent1, AiravatLogger.AgentRole.None);
    }

    function testOnlyOwnerCanAssign() public {
        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(unassigned);
        logger.assignAgent(agent1, AiravatLogger.AgentRole.RBA);
    }
}
