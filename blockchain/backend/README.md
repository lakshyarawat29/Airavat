# ZK CIBIL Verification Backend

A zero-knowledge proof system for verifying CIBIL scores without revealing the actual score.

## Features

- **Zero-Knowledge Proofs**: Verify CIBIL scores ≥ 700 without revealing actual scores
- **zkVerify Integration**: Uses zkVerify Volta testnet for proof verification
- **Simple API**: Single endpoint `/verify` that takes only `userId`
- **Fast Response**: Returns 1/0 based on threshold verification

## API Usage

### Verify CIBIL Score

**POST** `/verify`

```json
{
  "userId": "user1"
}
```

**Response:**
```json
{
  "success": true,
  "result": 1,
  "userId": "user1",
  "timestamp": "2025-07-05T..."
}
```

- `result: 1` = CIBIL score ≥ 700
- `result: 0` = CIBIL score < 700

## Environment Variables

Set these in your deployment platform:

```env
ZKV_SEED_PHRASE=your_zkverify_seed_phrase
DOMAIN_ID=1
PORT=4000
```

## Deployment

1. Set environment variables in your deployment platform
2. Deploy this repository
3. The app will start on the specified PORT

## Technology Stack

- **Node.js** + **Express** - Web server
- **snarkjs** - Zero-knowledge proof generation
- **zkverifyjs** - Blockchain proof verification
- **circomlibjs** - Cryptographic operations

## Local Development

```bash
npm install
npm start
```

Server runs on `http://localhost:4000`
