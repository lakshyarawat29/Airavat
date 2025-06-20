// SPDX-License-Identifier: MIT
pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;


// Minimal Ownable implementation for Solidity 0.5.11
contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract AiravatLogger is Ownable {
    enum AgentRole { None, VRA, RBA, TMA, DRA, ZKBA, BBA, OCA, TLSA }

    struct LogEntry {
        address agent;
        AgentRole role;
        bytes32 requestId;
        uint8 riskScore;
        string status;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    mapping(address => AgentRole) public agentRoles;

    event LogStored(
        uint256 indexed logIndex,
        address indexed agent,
        AgentRole role,
        bytes32 requestId,
        uint8 riskScore,
        string status,
        uint256 timestamp
    );

    event AgentAssigned(address indexed agent, AgentRole role);
    event AgentRevoked(address indexed agent);

    // --- MODIFIERS ---
    modifier onlyAssignedAgent() {
        require(agentRoles[msg.sender] != AgentRole.None, "Not an assigned agent");
        _;
    }

    // --- OWNER FUNCTIONS ---

    function assignAgent(address _agent, AgentRole _role) external onlyOwner {
        require(_role != AgentRole.None, "Invalid role");
        agentRoles[_agent] = _role;
        emit AgentAssigned(_agent, _role);
    }

    function revokeAgent(address _agent) external onlyOwner {
        agentRoles[_agent] = AgentRole.None;
        emit AgentRevoked(_agent);
    }

    // --- PUBLIC FUNCTION (RESTRICTED) ---

    function storeLog(
        string calldata _requestId,
        uint8 _riskScore,
        string calldata _status
    ) external onlyAssignedAgent {
        bytes32 hashedId = keccak256(abi.encodePacked(_requestId));
        AgentRole role = agentRoles[msg.sender];

        LogEntry memory entry = LogEntry({
            agent: msg.sender,
            role: role,
            requestId: hashedId,
            riskScore: _riskScore,
            status: _status,
            timestamp: block.timestamp
        });

        logs.push(entry);

        emit LogStored(
            logs.length - 1,
            msg.sender,
            role,
            hashedId,
            _riskScore,
            _status,
            block.timestamp
        );
    }

    // --- READ FUNCTIONS ---

    function getLog(uint256 index) external view returns (LogEntry memory) {
        require(index < logs.length, "Invalid index");
        return logs[index];
    }

    function getLogCount() external view returns (uint256) {
        return logs.length;
    }
}
