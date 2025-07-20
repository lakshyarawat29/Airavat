# Zero-Knowledge Proof API

A comprehensive REST API for generating and verifying zero-knowledge proofs for CIBIL score verification. This system allows users to prove that their CIBIL score meets a certain threshold without revealing the actual score.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# zkVerify Configuration
ZKV_SEED_PHRASE=your_seed_phrase_here
DOMAIN_ID=1

# Blockchain Configuration
ARB_URL=your_arbitrum_rpc_url
ARB_ZKCERTIFY_CONTRACT_ADDRESS=your_arbitrum_contract_address
EDU_URL=your_educhain_rpc_url
EDU_ZKCERTIFY_CONTRACT_ADDRESS=your_educhain_contract_address
ETH_SECRET_KEY=your_ethereum_private_key
```

### 3. Start the Server
```bash
npm start
```

The API will be available at `http://localhost:4000`.

## 📋 API Endpoints

### Core Proof Operations

#### 1. Generate Proof
**POST** `/proof/generate`

Generate a zero-knowledge proof for a user's CIBIL score.

```json
{
  "userId": "user1",
  "threshold": 700
}
```

#### 2. Verify Proof
**POST** `/proof/verify`

Verify a zero-knowledge proof.

```json
{
  "proof": { /* proof object */ },
  "publicSignals": [ /* public signals array */ ]
}
```

#### 3. Generate and Verify
**POST** `/proof/generate-and-verify`

Generate and verify a proof in one step.

```json
{
  "userId": "user1",
  "threshold": 700
}
```

#### 4. Get Available Users
**GET** `/proof/users`

Get a list of available users for testing.

### Blockchain Integration

#### 5. Complete Verification
**POST** `/verify`

Generate proof, verify it, and send attestation to blockchain.

```json
{
  "userId": "user1",
  "network": "EDUCHAIN"
}
```

## 🔧 Usage Examples

### Using cURL

```bash
# Get available users
curl -X GET http://localhost:4000/proof/users

# Generate and verify proof
curl -X POST http://localhost:4000/proof/generate-and-verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "threshold": 700
  }'

# Complete verification with blockchain
curl -X POST http://localhost:4000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "network": "EDUCHAIN"
  }'
```

### Using JavaScript Client

```javascript
const client = new ZKProofClient('http://localhost:4000');

// Get available users
const users = await client.getUsers();

// Generate and verify proof
const result = await client.generateAndVerify('user1', 700);

// Complete verification with blockchain
const receipt = await client.completeVerification('user1', 'EDUCHAIN');
```

### Using Node.js

```javascript
const ZKProofClient = require('./client');

async function example() {
  const client = new ZKProofClient();
  
  try {
    const result = await client.generateAndVerify('user1', 700);
    console.log('Proof verified:', result.verification.valid);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

## 🧪 Testing

### Run All Tests
```bash
node test_api.js test
```

### Run Individual Tests
```bash
# Get users
node test_api.js users

# Generate proof
node test_api.js generate user1 700

# Generate and verify
node test_api.js generate-and-verify user1 700
```

### Run JavaScript Client Example
```bash
node client.js
```

## 🏗️ Architecture

The system consists of several key components:

1. **Proof Generation** (`generateProof.js`): Creates zero-knowledge proofs using circom circuits
2. **Proof Verification** (`verifyProof.js` & `zkverify.js`): Verifies proofs using snarkjs and zkVerify
3. **Blockchain Integration** (`sendAttestation.js`): Sends attestations to Ethereum-compatible networks
4. **API Routes** (`proofRoutes.js`): RESTful endpoints for proof operations
5. **Client Library** (`client.js`): JavaScript client for easy integration

## 📊 Data Flow

```
User Input → Proof Generation → Proof Verification → Blockchain Attestation
    ↓              ↓                    ↓                    ↓
  User ID      ZK Proof            Verification         Transaction
 Threshold    Public Signals       Result               Hash
```

## 🔐 Security Features

- **Zero-Knowledge**: Actual CIBIL scores are never revealed
- **Merkle Tree**: User data is organized in a cryptographic Merkle tree
- **Groth16**: Uses secure zk-SNARK proof system
- **Blockchain**: Immutable attestations on Ethereum-compatible networks

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ZKV_SEED_PHRASE` | Seed phrase for zkVerify | Yes |
| `DOMAIN_ID` | Domain ID for zkVerify | Yes |
| `ARB_URL` | Arbitrum RPC URL | Yes |
| `ARB_ZKCERTIFY_CONTRACT_ADDRESS` | Arbitrum contract address | Yes |
| `EDU_URL` | EDUCHAIN RPC URL | Yes |
| `EDU_ZKCERTIFY_CONTRACT_ADDRESS` | EDUCHAIN contract address | Yes |
| `ETH_SECRET_KEY` | Ethereum private key | Yes |

### Supported Networks

- **EDUCHAIN**: Educational blockchain network
- **Arbitrum**: Ethereum Layer 2 scaling solution

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "type": "ERROR_TYPE"
}
```

### Error Types

- `THRESHOLD_NOT_MET`: CIBIL score below threshold
- `USER_NOT_FOUND`: User ID not found
- `VALIDATION_ERROR`: Invalid input parameters
- `PROOF_GENERATION_ERROR`: Error during proof generation
- `PROOF_VERIFICATION_ERROR`: Error during verification

## 📁 File Structure

```
app/
├── src/
│   ├── index.js              # Main server file
│   ├── generateProof.js      # Proof generation logic
│   ├── verifyProof.js        # Proof verification logic
│   ├── zkverify.js           # zkVerify integration
│   └── sendAttestation.js    # Blockchain integration
├── routes/
│   ├── proofRoutes.js        # Proof API routes
│   └── verifyRoutes.js       # Legacy verification routes
├── client.js                 # JavaScript client library
├── test_api.js               # API testing script
├── API_DOCUMENTATION.md      # Detailed API docs
└── README.md                # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the API documentation
2. Run the test suite
3. Check the server logs
4. Create an issue on GitHub

## 🔗 Related Projects

- [Circom](https://github.com/iden3/circom) - Circuit compiler
- [snarkjs](https://github.com/iden3/snarkjs) - JavaScript implementation of zk-SNARKs
- [zkVerify](https://zkverify.io/) - Proof verification service
