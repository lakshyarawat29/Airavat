require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const AiravatLoggerJson = require('../artifacts/AiravatLogger.sol/AiravatLogger.json');

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Owner wallet, same private key you use now
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    AiravatLoggerJson.abi,
    ownerWallet
  );

  const agentAddress = ownerWallet.address; // Use your backend wallet address here if different
  const AgentRole_BBA = 6; // From your enum in contract

  const tx = await contract.assignAgent(agentAddress, AgentRole_BBA);
  console.log('Transaction sent, hash:', tx.hash);
  await tx.wait();
  console.log('Agent assigned successfully!');
}

main().catch(console.error);