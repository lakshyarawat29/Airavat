require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Read ABI + bytecode
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../artifacts/AiravatLogger.sol/AiravatLogger.json'),
      'utf8'
    )
  );

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  console.log('⏳ Deploying contract...');
  const contract = await factory.deploy();
  await contract.deployed();

  console.log(`✅ Contract deployed at: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
