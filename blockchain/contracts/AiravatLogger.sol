// SPDX-License-Identifier: MIT
pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

contract AiravatLogger {
    struct LogEntry {
        address agent;
        bytes32 requestId;
        uint8 riskScore;
        string status;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event LogStored(
        uint256 indexed logIndex,
        address indexed agent,
        bytes32 requestId,
        uint8 riskScore,
        string status,
        uint256 timestamp
    );

    // Add a new log entry
    function storeLog(
        string calldata _requestId,
        uint8 _riskScore,
        string calldata _status
    ) external {
        bytes32 hashedId = keccak256(abi.encodePacked(_requestId));

        LogEntry memory entry = LogEntry({
            agent: msg.sender,
            requestId: hashedId,
            riskScore: _riskScore,
            status: _status,
            timestamp: now
        });

        logs.push(entry);

        emit LogStored(
            logs.length - 1,
            msg.sender,
            hashedId,
            _riskScore,
            _status,
            now
        );
    }

    function getLog(uint256 index) external view returns (LogEntry memory) {
        require(index < logs.length, "Invalid index");
        return logs[index];
    }

    function getLogCount() external view returns (uint256) {
        return logs.length;
    }
}
