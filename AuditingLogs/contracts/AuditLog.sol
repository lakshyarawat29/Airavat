// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataAccessLogger {

    struct LogEntry {
        string userId;
        string organization;
        string dataType;
        string purpose;
        string accessLevel;
        string status;
        bool userConsent;
        bool dataMinimized;
        bool zkProofUsed;
        uint16 retentionDays;
        uint256 timestamp;
    }

    LogEntry[] private logs;

    event LogCreated(
        uint indexed logId,
        string indexed userId,      // <-- indexed userId for filtering
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

    function createLog(
        string calldata userId,
        string calldata organization,
        string calldata dataType,
        string calldata purpose,
        string calldata accessLevel,
        string calldata status,
        bool userConsent,
        bool dataMinimized,
        bool zkProofUsed,
        uint16 retentionDays
    ) external {
        LogEntry memory newLog = LogEntry({
            userId: userId,
            organization: organization,
            dataType: dataType,
            purpose: purpose,
            accessLevel: accessLevel,
            status: status,
            userConsent: userConsent,
            dataMinimized: dataMinimized,
            zkProofUsed: zkProofUsed,
            retentionDays: retentionDays,
            timestamp: block.timestamp
        });

        logs.push(newLog);

        emit LogCreated(
            logs.length - 1,
            userId,
            organization,
            dataType,
            purpose,
            accessLevel,
            status,
            userConsent,
            dataMinimized,
            zkProofUsed,
            retentionDays,
            block.timestamp
        );
    }

    function getLog(uint index) external view returns (LogEntry memory) {
        require(index < logs.length, "Invalid log index");
        return logs[index];
    }

    function getLogCount() external view returns (uint) {
        return logs.length;
    }
}
