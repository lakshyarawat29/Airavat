const { ethers } = require("ethers");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secrets" });

const NETWORKS = {
    Arbitrum: {
        RPC_URL: process.env.ARB_URL,  // Your Infura URL
        CONTRACT_ADDRESS:process.env.ARB_ZKCERTIFY_CONTRACT_ADDRESS  // Your Arbitrum contract
    },
    EDUCHAIN: {
        RPC_URL: process.env.EDU_URL,  // Your EDUCHAIN URL
        CONTRACT_ADDRESS: process.env.EDU_ZKCERTIFY_CONTRACT_ADDRESS // Your EDUCHAIN contract
    }
};

const ETH_SECRET_KEY = process.env.ETH_SECRET_KEY;

// Updated ABI to include the mintNFT function
const ZkCerifyABI = [
    "function mintNFT(bytes32 leaf, uint256 _attestationId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index, uint8 network, string memory tokenURI_) external"
];

async function sendAttestation(attestationData, networkChoice) {
    let provider;
    try {
        const networkConfig = NETWORKS[networkChoice];
        if (!networkConfig) {
            throw new Error("Invalid network choice");
        }

        // Initialize provider with connection timeout
        provider = new ethers.JsonRpcProvider(networkConfig.RPC_URL, undefined, {
            timeout: 30000,
            staticNetwork: true  // Prevent automatic network detection
        });

        const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);
        const contract = new ethers.Contract(networkConfig.CONTRACT_ADDRESS, ZkCerifyABI, wallet);

        // Send transaction
        const tx = await contract.mintNFT(
            ethers.hexlify(attestationData.leaf),
            BigInt(attestationData.attestationId),
            attestationData.proof.map(p => ethers.hexlify(p)),
            BigInt(attestationData.numberOfLeaves),
            BigInt(attestationData.leafIndex),
            networkChoice === 'EDUCHAIN' ? 0 : 1,
            "ipfs://bafybeidbe3l3uje46x7goznkhtqsz7ivew4yf466eu3tlir7opq37s4goq"
        );
        if(networkChoice === 'EDUCHAIN') {
            console.log(`Transaction sent on ${networkChoice}: https://edu-chain-testnet.blockscout.com/tx/${tx.hash}`);
        }
        else {
            console.log(`Transaction sent on ${networkChoice}: https://sepolia.etherscan.io/tx/${tx.hash}`);
        }
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        return receipt;
    } catch (error) {
        console.error(`Failed to send attestation on ${networkChoice}:`, error);
        throw error;
    } finally {
        // Cleanup provider connection
        if (provider) {
            await provider.destroy();
        }
    }
}

module.exports = { sendAttestation };