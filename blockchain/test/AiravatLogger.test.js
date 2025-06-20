const { expect } = require('chai');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Set up local provider (you can change this to match your dev setup)
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

describe('AiravatLogger', function () {
  let contract;
  let owner;
  let agent1;
  let abi;
  let bytecode;

  before(async () => {
    const accounts = await provider.listAccounts();
    owner = provider.getSigner(accounts[0]);
    agent1 = provider.getSigner(accounts[1]);

    // Load ABI and Bytecode
    const artifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../artifacts/AiravatLogger.json'),
        'utf8'
      )
    );
    abi = artifact.abi;
    bytecode = artifact.bytecode;

    const factory = new ethers.ContractFactory(abi, bytecode, owner);
    contract = await factory.deploy();
    await contract.deployed();
  });

  it('should assign an agent with a role', async () => {
    const agent1Addr = await agent1.getAddress();
    const tx = await contract.connect(owner).assignAgent(agent1Addr, 1); // 1 = VRA
    await tx.wait();

    const role = await contract.agentRoles(agent1Addr);
    expect(role).to.equal(1); // VRA
  });

  it('should allow assigned agent to store log', async () => {
    const agent1Addr = await agent1.getAddress();

    const tx = await contract
      .connect(agent1)
      .storeLog('REQ123', 42, 'approved');

    await tx.wait();

    const logCount = await contract.getLogCount();
    expect(logCount).to.equal(1);

    const log = await contract.getLog(0);
    expect(log.agent).to.equal(agent1Addr);
    expect(log.riskScore).to.equal(42);
    expect(log.status).to.equal('approved');
  });

  it('should reject log from unassigned agent', async () => {
    const attacker = provider.getSigner(9); // random unassigned address

    await expect(
      contract.connect(attacker).storeLog('REQ999', 90, 'denied')
    ).to.be.revertedWith('Not an assigned agent');
  });

  it('should allow owner to revoke agent', async () => {
    const agent1Addr = await agent1.getAddress();

    const tx = await contract.connect(owner).revokeAgent(agent1Addr);
    await tx.wait();

    const role = await contract.agentRoles(agent1Addr);
    expect(role).to.equal(0); // None

    // Attempting to log again should now fail
    await expect(
      contract.connect(agent1).storeLog('REQ777', 99, 'denied')
    ).to.be.revertedWith('Not an assigned agent');
  });
});
