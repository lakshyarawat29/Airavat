// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AuditLog.sol";

contract AuditLogTest is Test {
    DataAccessLogger logger;
    // Add the event definition for testing
    event LogCreated(
        uint indexed logId,
        string userId,
        string organization,
        string dataType,
        string purpose,
        string accessLevel,
        string status,
        bool userConsent,
        bool dataMinimized,
        bool zkProofUsed,
        uint16 retentionDays,
        uint256 timestamp
    );

    function setUp() public {
        logger = new DataAccessLogger();
    }

    function testCreateLogAndRetrieve() public {
        string memory userId = "user123";
        string memory organization = "RBI";
        string memory dataType = "PAN";
        string memory purpose = "KYC Verification";
        string memory accessLevel = "High";
        string memory status = "Granted";
        bool userConsent = true;
        bool dataMinimized = true;
        bool zkProofUsed = true;
        uint16 retentionDays = 30;

        logger.createLog(
            userId,
            organization,
            dataType,
            purpose,
            accessLevel,
            status,
            userConsent,
            dataMinimized,
            zkProofUsed,
            retentionDays
        );

        uint count = logger.getLogCount();
        assertEq(count, 1);

        DataAccessLogger.LogEntry memory logEntry = logger.getLog(0);

        assertEq(logEntry.userId, userId);
        assertEq(logEntry.organization, organization);
        assertEq(logEntry.dataType, dataType);
        assertEq(logEntry.purpose, purpose);
        assertEq(logEntry.accessLevel, accessLevel);
        assertEq(logEntry.status, status);
        assertEq(logEntry.userConsent, userConsent);
        assertEq(logEntry.dataMinimized, dataMinimized);
        assertEq(logEntry.zkProofUsed, zkProofUsed);
        assertEq(logEntry.retentionDays, retentionDays);
        assertTrue(logEntry.timestamp > 0);
    }

    function testEventEmission() public {
        vm.expectEmit(true, false, false, false);
        emit LogCreated(
            0,
            "user123",
            "RBI",
            "PAN",
            "KYC Verification",
            "High",
            "Granted",
            true,
            true,
            true,
            30,
            block.timestamp
        );

        logger.createLog(
            "user123",
            "RBI",
            "PAN",
            "KYC Verification",
            "High",
            "Granted",
            true,
            true,
            true,
            30
        );
    }

    function test_RevertWhen_GetLogInvalidIndex() public {
        vm.expectRevert();
        logger.getLog(0);
    }
}
