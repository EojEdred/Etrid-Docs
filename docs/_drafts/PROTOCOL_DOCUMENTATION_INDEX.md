# Ëtrid Protocol Documentation Index
## Complete Technical Reference & Implementation Guide

**Version**: 1.0.0  
**Status**: Draft (repo-aligned)  
**Last Updated**: October 2025 (repo-aligned)  
**Maintained By**: Ëtrid Foundation  
**License**: GPLv3 (Open Source)

---

## Canonical Sources (Repo)

- System architecture: `docs/architecture.md`
- DETR P2P spec: `docs/***needtoupdateETRID_DETR_P2P_SPECIFICATION.md`
- DETR P2P implementation: `01-detr-p2p/ARCHITECTURE.md`
- Multichain/bridge docs: `modules/multichain/`
- Specifications: `docs/specifications/`

## TABLE OF CONTENTS

1. [Master Architecture Overview](#1-master-architecture-overview)
2. [DETR p2p - Multi-Protocol Network Layer](#2-detr-p2p---multi-protocol-network-layer)
3. [OpenDID - Decentralized Identity System](#3-opendid---decentralized-identity-system)
4. [Blockchain Security & Cryptography](#4-blockchain-security--cryptography)
5. [Account System & Key Types](#5-account-system--key-types)
6. [Multichain Architecture](#6-multichain-architecture)
7. [Native Currency System](#7-native-currency-system)
8. [Transaction Model & Execution](#8-transaction-model--execution)
9. [ËtwasmVM - Smart Contract Runtime](#9-ëtwasmvm---smart-contract-runtime)
10. [FODDoS ASF Consensus Algorithm](#10-foddos-asf-consensus-algorithm)
11. [Foundation & Governance Framework](#11-foundation--governance-framework)
12. [Peer Roles & Incentive Structure](#12-peer-roles--incentive-structure)
13. [Consensus Day - Democratic Governance](#13-consensus-day---democratic-governance)
14. [Client Implementations](#14-client-implementations)
15. [Integration & Deployment Guide](#15-integration--deployment-guide)

---

## 1. MASTER ARCHITECTURE OVERVIEW

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ËTRID MULTICHAIN PLATFORM (E³20)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 1: NETWORK & TRANSPORT                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ DETR p2p     │  │ AEComms      │  │ StoréD       │           │  │
│  │  │ (DHT, P2P)   │  │ (ECIES enc.) │  │ (Merkle DAG) │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 2: IDENTITY & SECURITY                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ OpenDID      │  │ Blockchain   │  │ Key Mgmt     │           │  │
│  │  │ (Self-sov.)  │  │ Security     │  │ (BIP39/44)   │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 3: ACCOUNT & STATE                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ Account Types│  │ State Root   │  │ Trie System  │           │  │
│  │  │ (EBCA/RCA)   │  │ (Merkle)     │  │ (Nested)     │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 4: EXECUTION & COMPUTATION                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ Transactions │  │ ËtwasmVM     │  │ VMw Gas      │           │  │
│  │  │ (4 types)    │  │ (WASM runtime)│  │ (Metering)   │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 5: CONSENSUS & FINALITY                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ ASF Consensus│  │ BFT Committee│  │ PPFA Rotation│           │  │
│  │  │ (4-phase)    │  │ (66% quorum) │  │ (8-validator)│           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 6: CHAINS & FINALITY                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ FlareChain   │  │ PBCs         │  │ State        │           │  │
│  │  │ (Main chain) │  │ (Sidechains) │  │ Channels     │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 ▲                                       │
│                                 │                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              LAYER 7: GOVERNANCE & ECONOMICS                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ Consensus Day│  │ Distribution │  │ Foundation   │           │  │
│  │  │ (Voting)     │  │ Pay (Rewards)│  │ (DAO)        │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 E³20 Core Systems Checklist

| # | System | Status | Specification |
|---|--------|--------|--------------|
| 1 | DETR p2p | 🟡 Implemented (integration in progress) | Section 2.0 |
| 2 | OpenDID | ✅ Implemented in repo | Section 3.0 |
| 3 | Blockchain Security | ✅ Implemented in repo | Section 4.0 |
| 4 | Accounts | ✅ Implemented in repo | Section 5.0 |
| 5 | Multichain | 🟡 Implemented in repo (deployment pending) | Section 6.0 |
| 6 | Native Currency | ✅ Implemented in repo | Section 7.0 |
| 7 | Transactions | 🟡 Implemented in repo | Section 8.0 |
| 8 | ËtwasmVM | 🟡 Implemented in repo (integration pending) | Section 9.0 |
| 9 | Consensus | ✅ Implemented in repo | Section 10.0 |
| 10 | Foundation | 🟡 Implemented in repo | Section 11.0 |
| 11 | Peer Roles | 🟡 Documented; runtime integration pending | Section 12.0 |
| 12 | Governance | ✅ Implemented in repo (Consensus Day) | Section 13.0 |
| 13 | Clients | 🟡 Partial (tools + SDKs in progress) | Section 14.0 |

**Note**: Status reflects code presence in repo, not live network deployment.

---

## 2. DETR p2p - MULTI-PROTOCOL NETWORK LAYER

### 2.1 Overview

**DETR** = Decentralized, Encrypted, Trustless, Resilient Peer-to-Peer

DETR p2p is the foundational networking layer enabling all ËTRID communication. It combines multiple protocols for different networking needs:

- **Node discovery + peer lifecycle** (DPeers + detrp2p)
- **Encrypted transport** (AEComms)
- **Network transport + routing** (DETRP2P)
- **Message definitions + finality bridge** (Etrid Protocol)
- **Flow control** (Fluent)
- **Peer storage** (StoréD)

### 2.2 DPeers Protocol (Node Discovery)

**Purpose**: Enable nodes to discover each other without central servers

**Protocol**: S/Kademlia DHT (Simplified Kademlia Distributed Hash Table)

**Key Features**:
- Decentralized node discovery
- Sybil resistance planned (PoW admission not enforced yet)
- K-buckets for neighbor routing (K=20)
- XOR metric distance for node selection
- Exponential backoff for dead node retry

**Message Types**:

```
PING:
  - sender_id: [u8; 32]
  - nonce: u64
  - target_network: "mainnet" | "testnet" | "devnet"

PONG:
  - nonce: u64
  - responder_endpoints: Vec<SocketAddr>
  - height: u32 (current block height)

FIND_NODE:
  - search_id: [u8; 32]
  - k: u32 (usually 20)

NODES:
  - search_id: [u8; 32]
  - results: Vec<(NodeId, SocketAddr)>
```

**Algorithm**:

```rust
fn find_node(target_id: NodeId, timeout: Duration) -> Vec<Node> {
    let mut results = Vec::new();
    let mut visited = HashSet::new();
    let mut queue = PriorityQueue::new(); // Ordered by distance to target
    
    // Start with k closest known nodes
    for node in self.k_buckets.closest_to(target_id, 20) {
        queue.push(node);
    }
    
    while !queue.is_empty() && elapsed < timeout {
        let node = queue.pop();
        if visited.contains(&node.id) { continue; }
        visited.insert(node.id);
        
        // Send FIND_NODE message
        let response = send_find_node(node, target_id, timeout);
        
        // Add results to queue (sorted by distance)
        for neighbor in response.results {
            if !visited.contains(&neighbor.id) {
                queue.push(neighbor);
            }
        }
        
        // Collect results
        if distance(neighbor.id, target_id) < distance(best_node, target_id) {
            results.push(neighbor);
        }
    }
    
    results.sort_by_key(|n| distance(n.id, target_id));
    results[0..20].to_vec()
}
```

**Sybil Resistance (Planned)**:
- PoW admission is a target design; not enforced in current repo
- Current mitigation relies on Kademlia bucket diversity + reputation metadata

### 2.3 AEComms Protocol (Encrypted Transport)

**Purpose**: Secure communication between peers

**Protocol**: ECIES (Elliptic Curve Integrated Encryption Scheme) over TCP

**Connection Handshake**:

```
Peer A                          Peer B
|                               |
|------------ HELLO ------------>|
| ephemeral_pubkey_A            |
| signature_A                   |
|                               |
|<----------- HELLO -------------|
| ephemeral_pubkey_B            |
| signature_B                   |
|                               |
[Establish shared secret via ECDH]
|                               |
|---- ENCRYPTED MESSAGE ------->|
| nonce_counter                 |
| ciphertext (ChaCha20)         |
| hmac (Poly1305)               |
|                               |
```

**Message Encryption**:

```rust
struct EncryptedMessage {
    nonce_counter: u64,
    ciphertext: Vec<u8>,
    hmac_tag: [u8; 16],
}

fn encrypt_message(
    plaintext: &[u8],
    shared_secret: &[u8; 32],
    nonce_counter: u64,
) -> EncryptedMessage {
    // Derive keys from shared secret
    let (cipher_key, hmac_key) = hkdf_sha256(shared_secret);
    
    // Encrypt with ChaCha20
    let nonce = format!("{:064b}", nonce_counter).as_bytes()[..12].to_vec();
    let ciphertext = chacha20_poly1305_encrypt(&plaintext, cipher_key, &nonce);
    
    // Compute HMAC
    let hmac_tag = hmac_sha256(&ciphertext, &hmac_key);
    
    EncryptedMessage {
        nonce_counter,
        ciphertext,
        hmac_tag,
    }
}
```

**Sybil Attack Prevention**:
- Rate limiting: Max 100 connections per peer
- Connection scoring: Track peer reliability
- Reputation: Peers with >80% successful message delivery get priority
- Backoff: Failed peers exponentially increase retry delay

### 2.4 DETRP2P Protocol (Peer Tethering)

**Purpose**: Maintain stable peer connections for application session negotiation

**Key Concepts**:
- **Tether**: Long-lived connection between two peers (30+ minutes)
- **Backbone Network**: Set of all active tethers forms the network spine
- **Bootstrap Nodes**: Well-known, always-on nodes for new peers joining

**Tethering Algorithm**:

```
1. Node joins network
2. Connect to 3-5 bootstrap nodes via DPeers discovery
3. Ask each bootstrap node for K (20) other nodes
4. Evaluate potential tethe candidates:
   - Latency < 100ms (preferred)
   - Stable uptime (>99%)
   - Different geographic region
   - Non-overlapping peer sets
5. Establish 4 tethers to highest-scoring nodes
6. Maintain tethers with periodic keep-alives (every 30 seconds)
7. If tether dies: Replace with new candidate from known set
```

**Failure Recovery**:
- Unresponsive tether: Wait 60 seconds, then replace
- Network partition: Use alternative routes via other tethers
- Byzantine peer: Remove after 3 bad messages, blacklist for 24 hours

### 2.5 Etrid Protocol (Message Definitions + Finality Bridge)

**Purpose**: Define P2P message types, serialization formats, and the finality gadget bridge.

**Implementation**:
- `01-detr-p2p/etrid-protocol/src/lib.rs`
- `01-detr-p2p/etrid-protocol/gadget-network-bridge/src/lib.rs`

**Scope**:
- Consensus and finality messages (votes, certificates)
- Network notifications (announcements, heartbeats)
- Serialization formats shared across DETR P2P layers

**Block Sync**:
- Full block sync RPCs are a planned extension; current implementation focuses on message definitions and gadget bridging.

### 2.6 Fluent Protocol (Private Channels)

**Purpose**: Secure, private communication for sensitive operations (voting, DMs)

**Features**:
- End-to-end encryption (sender → receiver only)
- No relay servers required
- Messages disappear after read
- Zero-knowledge proofs for sender identity (optional)

**Message Format**:

```rust
struct FLuentMessage {
    recipient_id: [u8; 32],
    content_hash: [u8; 32],
    encrypted_content: Vec<u8>,
    sender_proof: Vec<u8>,   // Zero-knowledge proof of identity
    ttl: u32,                 // Seconds until auto-delete
    sender_anonymous: bool,   // If true, recipient can't identify sender
}
```

### 2.7 StoréD Protocol (Distributed Storage)

**Purpose**: Distribute data across network nodes for redundancy

**Data Format**:
- Files split into chunks (512 KB each)
- Each chunk stored with Merkle-DAG proof
- Data replication factor: 3 (stored on 3 different nodes)
- Nodes incentivized to keep data (rewards for storage)

**Storage Pricing**:
- Providers set their own price (market-driven)
- Default: ~1 VMw per GB per day
- Payment via smart contracts

**Data Retrieval**:
```
Client requests data
→ DHT returns 3 node locations
→ Client downloads from fastest node
→ Verify Merkle proof
→ Store locally
```

---

## 3. OPENDID - DECENTRALIZED IDENTITY SYSTEM

### 3.1 Overview

**OpenDID** = Ëtrid Open Decentralized Identification System

Self-sovereign identity protocol allowing users to:
- Generate their own identifiers without central authority
- Issue credentials about themselves
- Share proofs without revealing underlying identity
- Interoperate with W3C DID standard

### 3.2 DID Structure

**Format**: `did:etrid:<identifier>:<key-type>`

**Example**: `did:etrid:1AbC...DeF:ed25519`

**Components**:
- **Scheme**: `did` (W3C standard)
- **Method**: `etrid` (ËTRID-specific)
- **Identifier**: On-chain account ID (BLAKE2b hash)
- **Key type**: `ed25519`, `sphincs`, etc.

### 3.3 Credential Issuance

**Verifiable Credential (VC) Format**:

```json
{
  "@context": "https://w3c-ccg.github.io/vc/core/1.0",
  "type": ["VerifiableCredential", "ÉTRIDUserCredential"],
  "issuer": "did:etrid:foundation",
  "credentialSubject": {
    "id": "did:etrid:user123",
    "name": "Alice",
    "uniqueHuman": true,
    "reputation": 95
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-10-20T12:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:etrid:foundation#key-1",
    "signatureValue": "..."
  }
}
```

**Credential Types**:
- **Unique Human**: Proves KYC/person (not bot)
- **Developer**: Proves code commit history
- **Validator**: Proves node uptime
- **DAO Member**: Proves stake in DAO

### 3.4 Presentation & Verification

**Verifiable Presentation (VP)** (Selective Disclosure):

```json
{
  "@context": "https://w3c-ccg.github.io/vc/core/1.0",
  "type": "VerifiablePresentation",
  "verifiableCredential": [
    { "credential1": "..." },
    { "credential2": "..." }
  ],
  "holder": "did:etrid:user123",
  "proof": {
    "type": "Ed25519Signature2020",
    "challenge": "nonce123",
    "created": "2025-10-20T12:00:01Z",
    "proofPurpose": "authentication",
    "verificationMethod": "did:etrid:user123#key-1",
    "signatureValue": "..."
  }
}
```

**Zero-Knowledge Proofs**:
- User can prove "reputation > 50" without revealing actual reputation
- Uses range proofs (lattice-based)
- Privacy-preserving for Consensus Day voting

### 3.5 Sybil Resistance

**Proof-of-Uniqueness**:
- Combine multiple signals:
  - Phone verification (optional)
  - Email verification (optional)
  - Real-world ID verification (for institutional use)
  - Historical transaction behavior
- Assign uniqueness score (0-100)
- Sybil attack → Low score → Reduced voting power

---

## 4. BLOCKCHAIN SECURITY & CRYPTOGRAPHY

### 4.1 Hash Functions

**SHA-3 (Keccak)**:
- 256-bit output (32 bytes)
- Used for: Block hashes, transaction hashes, Merkle roots
- Resistance: Preimage, second-preimage, collision

**BLAKE2b**:
- 512-bit output (64 bytes, truncated to 32 bytes often)
- Used for: Account creation (BLAKE2b(pubkey)), key derivation
- Advantages: Faster than SHA-3, parallel-friendly

### 4.2 Digital Signatures

**EdDSA (Ed25519)** - Primary

```
Keypair:
  - Private key: 32 bytes (secret seed)
  - Public key: 32 bytes (point on curve)

Signature:
  - R: 32 bytes (commitment)
  - S: 32 bytes (scalar)
  - Total: 64 bytes

Properties:
  - Deterministic (no randomness needed)
  - Fast verification (~1 ms)
  - Small key/signature size
```

**SPHINCS+ (Stateless Hash-Based)** - Post-Quantum Alternative

```
Keypair:
  - Private key: 64 bytes
  - Public key: 32 bytes

Signature:
  - Size: ~17 KB (larger but quantum-resistant)
  - Verification: ~50 ms (slower)
  - Generation: ~1 second (much slower)

Use Case:
  - Critical infrastructure (Foundation keys)
  - Long-term archives
  - Gradual migration (10+ year process)
```

### 4.3 Key Derivation

**HKDF-Blake2b**:
```
PRK = HMAC-Blake2b(salt, input_key_material)
OKM = HMAC-Blake2b(PRK, info || 0x01)
```

**BIP39 Mnemonic** (12-24 words):
```
entropy (128-256 bits)
→ BIP39 seed (512 bits)
→ BIP44 hierarchical path
→ Final keypair
```

**Example Path**: `m/44'/60'/0'/0/0`
- 44': BIP44 standard
- 60': Ethereum-compatible chain (ËTRID uses this)
- 0': Account 0
- 0': External address chain
- 0: Address #0

### 4.4 Encryption

**ECIES (for peer-to-peer)**:
```
1. Sender generates ephemeral keypair (eph_priv, eph_pub)
2. Compute shared secret: ECDH(eph_priv, recipient_pub)
3. Derive encryption key: KDF(shared_secret)
4. Encrypt: ChaCha20(plaintext, key)
5. Authenticate: Poly1305(ciphertext, key)
6. Send: (eph_pub || ciphertext || tag)
```

### 4.5 Post-Quantum Roadmap

**Phase 1 (Years 1-3)**: Ed25519 + SPHINCS+ hybrid
- Critical keys signed with both algorithms
- Validators accept both signature types
- No consensus disruption

**Phase 2 (Years 3-5)**: Gradual migration to SPHINCS+
- New keys default to SPHINCS+
- Old Ed25519 keys still valid (non-critical)
- Incentive program to upgrade

**Phase 3 (Years 5+)**: Full SPHINCS+ adoption
- Ed25519 deprecated (not removed)
- Network prepares for quantum era
- Archive nodes keep Ed25519 support for history verification

---

## 5. ACCOUNT SYSTEM & KEY TYPES

### 5.1 Account Types Overview

| Account Type | Abbreviation | Description | Stake | Can Vote |
|--------------|--------------|-------------|-------|----------|
| External Blockchain Account | EBCA | Non-ËTRID keypair (MetaMask, etc.) | ❌ | ❌ |
| Root Chain Account | RCA | Generated by ËTRID Key Gen Protocol | ✅ | ✅ |
| Root Chain Withdrawal | RCWA | RCA subset for receiving only | ❌ | ❌ |
| Side Chain Account | SCA | Account on specific PBC | ✅ | ⚠️ * |
| Smart Side Chain Account | SSCA | Contract-governed account | ⚠️ * | ❌ |

\* Depends on PBC configuration

### 5.2 Address Format (SS58)

**SS58** (Substrate Secure 58):
- Similar to Bitcoin Base58
- Includes checksum for typo detection
- Human-readable network prefix

**Address Structure**:
```
[network_byte] [account_id (32 bytes)] [checksum (2 bytes)]
↓
Base58 encoding
```

**Prefixes**:
- FlareChain: `1` (e.g., `1DeQnkhdyoYGjGpkkzZbRGJGnmL8SthKV8u3q`)
- PBC-EDSC: `3` (e.g., `3EdWjSi1YvL2a8GYr2yQ98YbGbBLNhqhwXc8n`)
- Private testnet: `2`

**Checksum Calculation**:
```rust
fn ss58_checksum(address_bytes: &[u8]) -> [u8; 2] {
    let hash = blake2b_256(&address_bytes);
    [hash[0], hash[1]]
}
```

### 5.3 Key Generation

**RCA Generation Process**:

```
User Input:
  - Mnemonic (12, 15, 18, 21, or 24 words)
  - Passphrase (optional)

BIP39 Seed:
  - PBKDF2(mnemonic, passphrase, 2048 iterations)

BIP44 Derivation:
  - m/44'/60'/0'/0/n
  - Final path yields keypair (priv, pub)

Account ID:
  - BLAKE2b(public_key)

Address:
  - SS58(network_id, account_id, checksum)
```

### 5.4 Account State

**Account Storage**:

```rust
pub struct Account {
    nonce: u32,                 // Transaction counter
    balance: u128,              // ÉTR balance in Wei
    code_hash: [u8; 32],        // Hash of deployed code (if contract)
    storage_root: [u8; 32],     // Merkle root of account storage
}
```

**Total Account Size**: 32 + 16 + 32 + 32 = 112 bytes

**On-Chain Storage**: Organized as Merkle Patricia Trie

---

## 6. MULTICHAIN ARCHITECTURE

### 6.1 Chain Hierarchy

```
┌─────────────────────────┐
│   FLARECHAIN (Main)     │
│  - World State (root)   │
│  - Finality Authority   │
│  - 12s blocks           │
│  - ~1,000 TPS           │
└────┬────────────────────┘
     │
     ├─→ ┌──────────────────────────┐
     │   │ PBC-EDSC                 │
     │   │ - Stablecoin operations  │
     │   │ - 4s blocks              │
     │   │ - Checkpoints to FC      │
     │   └──────────────────────────┘
     │
     ├─→ ┌──────────────────────────┐
     │   │ PBC-AI                   │
     │   │ - AI Governance          │
     │   │ - Proof aggregation      │
     │   └──────────────────────────┘
     │
     └─→ ┌──────────────────────────┐
         │ PBC-* (Community)        │
         │ - Custom applications    │
         │ - Community governance   │
         └──────────────────────────┘

[State Channels Layer - Below All Chains]
  - Lightning Bloc network
  - Instant micropayments
  - Batch settlement daily
```

### 6.2 FlareChain Specification

**Network Parameters**:
- Block time: 12 seconds
- Finality time: ~5 minutes (25 validator slots)
- Max block size: 4 MB
- Max gas per block: 50 million gas units
- Max transactions per block: 10,000

**State Management**:
- State root: Merkle Patricia Trie
- Account trie: Maps addresses → account state
- Storage trie: Maps storage keys → values (per contract)
- Empty accounts: Auto-deleted after state updates

### 6.3 Partition Burst Chains (PBCs)

**Definition**: Specialized sidechains for specific use cases

**PBC-EDSC Specification**:
- Block time: 4 seconds (faster than main)
- Validator count: 8 (PPFA rotation)
- State checkpoint: Every 100 blocks to FlareChain
- Finality: ~3 minutes
- Throughput: ~5,000 TPS

**PBC Requirements** (for any new PBC):
1. Define governance (who votes on upgrades?)
2. Set economic model (fees, rewards)
3. Choose validator set (initial 8-100 validators)
4. Implement checkpoint protocol
5. Integrate with FlareChain via DETRP2P

### 6.4 State Channels (Lightning Bloc)

**Purpose**: Off-chain micropayment network

**Channel Design**:
```
Alice opens channel with Bob:
  - Alice deposits 1,000 ÉTR
  - Bob deposits 1,000 ÉTR
  - Channel state: Alice=1,000, Bob=1,000

Alice pays Bob 10 ÉTR:
  - Update state: Alice=990, Bob=1,010
  - Both sign state update
  - No blockchain interaction (instant)

After 1,000 transactions:
  - Alice + Bob close channel
  - Final state posted to FlareChain
  - Settlement: Alice gets 990, Bob gets 1,010
  - (All updates in 1 transaction on-chain)
```

**Fee Structure**:
- No on-chain fees during channel operation
- Micropayments enabled: 0.0001 ÉTR possible
- Channel settlement: ~0.1 ÉTR fee to close

**Dispute Resolution**:
- If Alice disagrees with final state
- Submit dispute on FlareChain with signed state
- Smart contract judges based on signatures
- Fraudster penalized (loses deposit)

---

## 7. NATIVE CURRENCY SYSTEM

### 7.1 ÉTR Token Specification

**Basic Properties**:
- Symbol: ÉTR
- Name: Ëtrid Coin
- Decimals: 18
- Total Initial Supply: 1,000,000,000 ÉTR (1 billion)
- Smallest unit: 1 Wei = 0.000000000000000001 ÉTR

**Distribution**:
```
Circulating (10%):      100 Million ÉTR
Founder Allocation (5%): 50 Million ÉTR (subject to clawback)
Foundation (10%):       100 Million ÉTR
Locked Growth (75%):    750 Million ÉTR
```

**Annual Emission**:
- Voted on Consensus Day (Dec 1st each year)
- No hard cap in code (only governance cap)
- Example Year 1: 50 Million ÉTR (5% annual)

### 7.2 ËDSC Stablecoin Specification

**Basic Properties**:
- Symbol: ËDSC
- Name: Ëtrid Dollar Stablecoin
- Decimals: 18
- Peg: 1 ËDSC = 1.00 USD
- Acceptable range: 0.98 - 1.02 USD
- Total supply cap: 50 Billion ËDSC
- Initial circulation: 5 Billion ËDSC

**Collateralization**:
```
Minimum: 110% (1.10 USD reserve per ËDSC)
Optimal: 120-130% (1.20-1.30 USD reserve per ËDSC)
Emergency: 90% (triggers circuit breaker pause)
```

**Reserve Breakdown**:
- On-chain (FlareChain vault): 40-50%
  - USDC (Ethereum/Polygon): 30%
  - ÉTR (locked): 10%
  - T-Bills (tokenized): 5%

- Custodian-held (BitGo/Anchorage): 50-60%
  - USD cash: 40%
  - US Treasury bills: 10%
  - Money market funds: 5%

### 7.3 VMw Gas Token

**Specification**:
- Symbol: VMw (Virtual Machine Watts)
- Name: Computation Gas
- Decimals: 12 (not standardized, internal use)
- Conversion: 1 VMw ≈ 0.001 ÉTR (market-determined)
- Behavior: Permanently burned (deflationary)

**Gas Costs** (per operation):

| Operation | Cost | Example |
|-----------|------|---------|
| Transaction encoding | 0.001 VMw/byte | 128-byte tx = 0.128 VMw |
| Simple transfer | 0.5-1.0 VMw | ~0.001 ÉTR |
| Account creation | 1.0 VMw | ~0.001 ÉTR |
| Storage write (32 bytes) | 64 VMw | ~0.064 ÉTR |
| Smart contract call | 100-10,000 VMw | Depends on execution |
| Cross-chain message | 256+ VMw | Base + payload size |

**Dynamic Pricing**:
- Base price: Calculated from block space demand
- If blocks >80% full: Price increases 20%
- If blocks <20% full: Price decreases 20%
- Minimum price: Never below 0.0001 ÉTR per gas unit

---

## 8. TRANSACTION MODEL & EXECUTION

### 8.1 Transaction Types

**Type 1: Regular Transaction** (Value Transfer)
```rust
pub struct RegularTransaction {
    from: AccountId,
    to: AccountId,
    value: u128,           // ÉTR amount in Wei
    nonce: u32,
    gas_price: u128,
    gas_limit: u32,
    data: Option<Vec<u8>>, // Can include memo
}
```

**Type 2: Smart Contract Call**
```rust
pub struct SmartContractCall {
    from: AccountId,
    contract: AccountId,
    value: u128,           // ÉTR value sent with call
    nonce: u32,
    gas_price: u128,
    gas_limit: u32,
    function_selector: [u8; 4],  // First 4 bytes of ABI
    input_data: Vec<u8>,         // Function arguments
}
```

**Type 3: Staking Transaction**
```rust
pub struct StakingTransaction {
    stake_holder: AccountId,
    action: StakingAction,  // Stake | Unstake | Claim
    amount: u128,
    nonce: u32,
    node_id: Option<[u8; 32]>,  // For validator operations
}
```

**Type 4: Cross-Chain Message**
```rust
pub struct CrossChainMessage {
    from: AccountId,
    target_chain: ChainId,
    target_account: AccountId,
    payload: Vec<u8>,
    callback: Option<[u8; 32]>,  // For async responses
}
```

### 8.2 Transaction Validation

**Validation Checklist**:
1. ✅ Properly encoded (no extra bytes)
2. ✅ Valid signature (EdDSA verification)
3. ✅ Nonce matches sender's current nonce
4. ✅ Gas limit ≥ intrinsic gas (minimum required)
5. ✅ Account balance ≥ (value + gas_limit × gas_price)
6. ✅ Timestamp within acceptable range (±15 minutes)
7. ✅ Chain ID matches current network (prevents replay)

**Intrinsic Gas**:
```
base_gas = 21,000 (always required)
data_gas = 16 per zero byte, 4 per non-zero byte
call_gas = 9,000 (if calling contract)
create_gas = 32,000 (if creating contract)

total_intrinsic = base_gas + data_gas + call_gas
```

### 8.3 Transaction Execution

**Execution State Machine**:

```
INPUT: Transaction
   ↓
[Validation]
   ✓ All checks pass
   ✗ Validation fails → REJECT
   ↓
[Nonce Check & Increment]
   ✓ nonce == account.nonce
   ✓ Increment: account.nonce += 1
   ↓
[Balance Deduction]
   ✓ Balance -= value + gas_limit × gas_price
   ✓ Refund buffer allocated
   ↓
[Execution]
   - If regular tx: Transfer value
   - If contract call: Execute WASM bytecode
   - If staking: Update validator set
   - If cross-chain: Queue message
   ↓
[Gas Metering]
   ✓ Track gas used during execution
   ✗ Out of gas: REVERT (keep gas payment)
   ↓
[State Changes Commit]
   ✓ Update accounts, storage, state root
   ✗ Revert: Restore pre-transaction state (keep gas)
   ↓
[Refund Calculation]
   unused_gas = gas_limit - gas_used
   refund_amount = unused_gas × gas_price
   ↓
[Final Balance Update]
   Balance += refund_amount
   ↓
OUTPUT: Transaction receipt
  - Status: Success (1) or Failure (0)
  - Gas used
  - Log entries
  - New state root
```

### 8.4 Meta-State (Transaction Effects)

**During Execution**:

| State Item | Purpose |
|-----------|---------|
| Suicide set | Accounts marked for deletion |
| Log series | Events emitted by contracts |
| Refund balance | Gas refunds to be returned |
| TIA set | Accounts affected by transaction |

**After Execution**:

| State Item | Format |
|-----------|--------|
| Post-transaction state | New account balances + storage |
| Gas used | Exact gas consumed |
| Log sets | B+ tree hash of all logs |
| Bloom filter | Efficient log lookup |
| Transaction result | 1 (success) or 0 (failure) |

### 8.5 State Root Derivation

**Merkle Patricia Trie**:
```
Each account stored at path: BLAKE2b(account_id) (truncated)

Account structure:
{
  nonce: u32,
  balance: u128,
  code_hash: [u8; 32],
  storage_root: [u8; 32],
}

State root = Merkle root of all accounts
```

**Proof of Inclusion**:
- Merkle proof for any account included in header
- Verifiers can validate account state without full chain
- Light clients reconstruct state root from proofs

---

## 9. ËTWASMVM - SMART CONTRACT RUNTIME

### 9.1 Overview

**ËtwasmVM** = Ëtrid WebAssembly Virtual Machine

Turing-complete WASM runtime optimized for blockchain with:
- Gas metering
- Sandboxed execution
- State storage management
- Cross-contract composition

### 9.2 WASM Instruction Set

**Supported**:
- All core WASM instructions (i32, i64, f32, f64)
- 256-bit integer operations (via library)
- Memory access (linear memory model)
- Call stack (up to 1,024 frames)
- Table operations (function indirection)

**Custom Instructions**:
- `call_value`: Transfer ÉTR with call
- `storage_write`: Persistent key-value store
- `storage_read`: Read from contract storage
- `emit_log`: Emit event for indexing
- `call_other_contract`: Cross-contract composition
- `seal_call`: Call other WASM contracts safely

### 9.3 Memory Model

**Linear Memory**:
- Single 4 GB address space
- Byte-addressed
- Cleared after each transaction
- No persistence (use storage instead)

**Stack**:
- 256-bit words
- Max depth: 1,024 items
- Overflow/underflow: Trap (fail execution)

**Storage**:
- Persistent key-value store
- Keys: 256-bit (32 bytes)
- Values: Variable length
- Rent: 0.1 VMw per byte per day

### 9.4 Gas Metering

**Instruction Costs** (in gas units):

| Operation | Cost |
|-----------|------|
| Arithmetic (add, sub, mul) | 1 |
| Memory access (read) | 3 |
| Memory access (write) | 5 |
| Storage read | 100 |
| Storage write | 500 |
| Call to another contract | 10,000 |
| Loop iteration | 100 |
| Function call | 50 |

**Gas Limit Per Block**: 50 Million gas units

### 9.5 Contract Deployment

**Deployment Process**:

```
Developer:
  1. Write contract in Rust/C++
  2. Compile to WASM
  3. Submit DeployContract transaction
     - code: Vec<u8> (WASM bytecode)
     - gas_limit: u32

Network:
  4. Validate WASM bytecode
  5. Execute contract constructor (if exists)
  6. Store code at new address
  7. Initialize storage
  8. Return new contract address

Output:
  - Contract address (derived from deployer + nonce)
  - Code hash: BLAKE2b(bytecode)
  - Storage root: Empty trie
```

### 9.6 Contract Interaction

**Calling a Contract**:

```
User calls `transfer(recipient: Address, amount: u128)`:
  1. Load contract code
  2. Instantiate WASM runtime with function selector
  3. Execute bytecode in sandbox
  4. Track gas usage
  5. Apply state changes (storage writes)
  6. Emit events (logs)
  7. Return output or error
  8. Charge gas (success) or refund (failure)
```

**Function Selector**:
- First 4 bytes of ABI hash
- Example: `transfer(address,uint256)` → SHA3 → first 4 bytes

---

## 10. FODDOS ASF CONSENSUS ALGORITHM

### 10.1 Overview

**FODDoS ASF** = Free and Open Decentralized Democracy of Stakeholders - Ascending Scale of Finality

Byzantine Fault Tolerant (BFT) consensus algorithm with:
- 4-phase voting (Prepare → Pre-Commit → Commit → Decide)
- Leader-based block proposal
- Stake-weighted voting
- Probabilistic finality

### 10.2 Validator Set

**Selection**:
- Top 100 validators by stake elected for each epoch
- Minimum stake: 1 ÉTR (Flare Nodes)
- Minimum stake: 64 ÉTR (Validity Nodes on PBCs)
- Epoch duration: 256 blocks (~51 minutes)

**Rotating Validator Set** (PPFA):
- Partition Proof of Authority
- 8 validators per PBC
- Rotate every 256 blocks
- Selected from pool based on stake

### 10.3 Consensus Protocol

**Phase 1: Prepare**
```
Leader selected: round_leader = (round_number) mod (validator_count)

Leader broadcasts:
{
  block: {
    height: u32,
    timestamp: u64,
    transactions: Vec<Tx>,
    parent_hash: [u8; 32],
  },
  qc: QuorumCertificate,  // From previous round
}

Validators validate block:
  - Transactions are valid
  - Block builds on valid chain
  - Timestamp reasonable
  - Leader is legitimate

If valid: Send "Prepare OK" vote
```

**Phase 2: Pre-Commit**
```
Leader collects Prepare OK votes:
  - Need ≥66% validators' prepare votes
  - Create PrepareQuorumCertificate (PrepareQC)

Leader broadcasts PrepareQC:
{
  block_hash: [u8; 32],
  round: u64,
  signatures: BTreeSet<Signature>,  // >= 66%
}

Validators verify PrepareQC:
  - Validate all signatures
  - Count: >= 66% of active validators

If valid: Send "Pre-Commit OK" vote
```

**Phase 3: Commit**
```
Leader collects Pre-Commit OK votes:
  - Need ≥66% pre-commit votes
  - Create CommitQuorumCertificate (CommitQC)

Leader broadcasts CommitQC:
{
  block_hash: [u8; 32],
  round: u64,
  signatures: BTreeSet<Signature>,  // >= 66%
}

Validators verify CommitQC:
  - Validate all signatures
  - Lock: This block is now locked (cannot reorg past it)

If valid: Send "Decide OK" vote
```

**Phase 4: Decide**
```
Leader collects Decide OK votes:
  - Need ≥66% decide votes
  - Create FinalityQuorumCertificate (FinalityQC)

Leader broadcasts FinalityQC:
{
  block_hash: [u8; 32],
  round: u64,
  signatures: BTreeSet<Signature>,  // >= 66%
}

Validators verify FinalityQC:
  - Validate all signatures
  - **FINALIZE**: Block is now final, no reorg possible

Network:
  - Advance to next block
  - Increment round number
  - Validators may start producing transactions
```

### 10.4 Finality Guarantee

**Property**: Once a block reaches "Decide" phase with 66% signatures, it is:
- Finalized (no reorg)
- Confirmed on-chain
- Irreversible

**Timing**:
- Prepare: 1 slot (12 seconds)
- Pre-Commit: 1 slot (12 seconds)
- Commit: 1 slot (12 seconds)
- Decide: 1 slot (12 seconds)
- **Total finality: ~48 seconds** (4 blocks)

**Practical finality**: ~5 minutes (25 blocks) for high confidence

### 10.5 Byzantine Fault Tolerance

**Assumptions**:
- <33% validators are Byzantine (faulty/malicious)
- 66% validators are honest
- Honest validators follow protocol

**Attack Prevention**:

**Double-Signing Attack**:
```
Attacker tries to validate 2 conflicting chains:
  Chain A: Block 1A → Block 2A → Block 3A
  Chain B: Block 1B → Block 2B → Block 3B

Byzantine validator signs PrepareQC for both Block 3A and Block 3B.

Defense:
  - If validator signs 2 conflicting blocks in same round:
    - SLASH: Lose 100% of annual rewards
    - REMOVAL: Ejected from validator set for 1 year
    - Proof: Double-signed blocks published on-chain
```

**Equivocation Attack**:
```
Attacker submits contradictory votes in same phase.

Defense:
  - All validator votes are signed and on-chain
  - Contradictory signatures = proof of equivocation
  - Automatic slashing

**Finality Reversion Attack**:
```
Attacker tries to build alternative chain after finality.

Defense:
  - Once block is finalized, consensus rules forbid:
    - Building on any parent besides finalized block
    - Accepting votes for older chains
  - Cannot happen if <33% validators are Byzantine
```

### 10.6 Validator Incentives & Penalties

**Rewards**:
- Per block produced: 0.01% of annual mint
- Per vote: 0.001% of annual mint (scaled by validator count)

**Penalties**:
- Missing block/vote: -0.1% of annual rewards
- Double-signing: -100% of annual rewards + removal
- Equivocation: -50% of annual rewards + temporary removal
- Uptime <95%: -25% of annual rewards

---

## 11. FOUNDATION & GOVERNANCE FRAMEWORK

### 11.1 Legal Structure

**Entity**: Delaware Non-Profit Corporation

**Governance**:
- Board: 9 Decentralized Directors (non-hierarchical)
- Committees: Technical, Legal, Community, Security
- Meetings: Monthly (public)
- Decision-making: Majority vote on board, appeals to Consensus Day

### 11.2 Decentralized Director Roles

**Required**:
- ≥128 ÉTR stake (locked during term)
- Operate Flare Node (for connectivity)
- 1-year term (Dec 1 - Nov 30)
- Max 3 consecutive terms

**Duties**:
- Oversee FlareChain security
- Review and approve major protocol upgrades
- Manage Foundation budget ($X million/year)
- Coordinate with validators and community
- Represent ËTRID in legal/regulatory matters
- Respond to security incidents

**Compensation**:
- Salary: (V% × annual mint) / 9
- FLARE rewards: Full block rewards (operates Flare Node)
- Clawback: Full forfeiture for misconduct

**Removal**:
- 2 missed meetings: Automatic removal
- Misconduct: 5/9 vote to remove
- Appeal: Community Consensus Day vote (66% override)

### 11.3 Budget Allocation

**Annual Budget Structure** (Example):

| Category | % of Mint | Amount (if 50M ÉTR mint) |
|----------|-----------|-------------------------|
| Development | 20% | 10M ÉTR |
| Security Audits | 5% | 2.5M ÉTR |
| Community Grants | 10% | 5M ÉTR |
| Legal & Compliance | 3% | 1.5M ÉTR |
| Operations | 2% | 1M ÉTR |
| **Total** | **40%** | **20M ÉTR** |

**Remaining 60%**: Distributed to validators, stakers, voters

### 11.4 Intellectual Property

**License**: GPLv3
- Code remains open-source forever
- Derivatives must be open-source
- Commercial use allowed
- No patents

**Trademarks**:
- ËTRID™, ËDSC™, FODDoS™ managed by Foundation
- Community can use with attribution

**Contributor Agreement**:
- All contributors sign CLA
- Retain copyright, Foundation gets license
- Contributions licensed under GPLv3

---

## 12. PEER ROLES & INCENTIVE STRUCTURE

### 12.1 Peer Hierarchy

```
┌─────────────────────────────────────────┐
│         COMMON PEERS                    │
│    (No stake, view-only)                │
│    - Can use wallets                    │
│    - Cannot vote                        │
│    - Cannot receive rewards             │
└────────────────┬────────────────────────┘
                 │
                 ├─ Stake ≥1 ÉTR
                 ▼
┌─────────────────────────────────────────┐
│     COMMON STAKE PEERS                  │
│    (Voting members)                     │
│    - Can vote in Consensus Day          │
│    - Receive staking rewards            │
│    - Can campaign for DD                │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────────┐
         │                    │
    Operate 1 Node        Stake 64 ÉTR
         │                    │
         ▼                    ▼
┌────────────────┐    ┌──────────────────┐
│  FLARE NODE    │    │  VALIDITY NODE   │
│                │    │  (PBC Validator) │
│ - Block relay  │    │  - Produce blocks│
│ - Full client  │    │  - Fast finality │
│ - Rewards: Z%  │    │  - Rewards: W%   │
└────────────────┘    └──────────────────┘
```

### 12.2 Flare Node Operators

**Requirements**:
- 4-core CPU, 16 GB RAM, 500 GB SSD minimum
- 99%+ uptime target
- Run Ëtrcpp client software
- Optional: ≥1 ÉTR stake for rewards

**Rewards**:
- Z% of annual mint, distributed by block uptime
- Example: 30% × 50M mint = 15M ÉTR
- Divided among ~100 active Flare Nodes
- 150k ÉTR per node per year (if full participation)

**Penalties**:
- Missing block: -0.1% of annual rewards
- Consensus failure: -1% of annual rewards
- 3 strikes: Removal for 1 year

### 12.3 Validity Node Operators (PBC)

**Requirements**:
- PBC-specific hardware (varies)
- 64 ÉTR stake (locked during rotation)
- PBC governance approval (usually consensus)
- 8-validator rotation per PBC

**Rewards**:
- W% of annual mint / (8 validators × active PBCs)
- Example: 20% × 50M mint / 64 = 156k ÉTR per year (single PBC)
- Plus transaction fees (PBC-specific)

**Rotation Schedule**:
- Every 256 blocks (~51 minutes on main)
- PBC validators selected randomly from active pool
- Weighted by stake (higher stake = higher probability)

### 12.4 Community Developers

**Bug Bounty Program**:
- Low: 0.1-1 ÉTR
- Medium: 1-5 ÉTR
- High: 5-50 ÉTR
- Critical: 50-500 ÉTR
- Foundation Treasury funds

**Audit Rewards**:
- Independent audit: 100-500 ÉTR
- Academic research: 25-200 ÉTR per paper
- Documentation: 5-50 ÉTR

**Track Record Program**:
- Veteran developers (10+ merged PRs): Priority for work
- Salary scale: Full-time positions available
- Grants: Up to 100 ÉTR for major features

---

## 13. CONSENSUS DAY - DEMOCRATIC GOVERNANCE

### 13.1 Annual Vote Schedule

**Dec 1st (00:00-23:59 UTC)**:
- Annual democratic voting event
- All Common Stake Peers (≥1 ÉTR staked) can vote
- Results binding for next 12 months
- Automatic execution of winning proposals

### 13.2 Voting Power Calculation

**Vote Weight Formula**:
```
Vote Weight = Stake Amount / Vote Dilution
Vote Dilution = Total Network Stake / Average Coin Age
```

**Example**:
```
Your stake: 1,000 ÉTR
Total network stake: 100 Million ÉTR
Average coin age: 500 days

Vote dilution = 100M / 500 = 200,000
Your vote weight = 1,000 / 200,000 = 0.005

Your vote power = 0.005% of total votes
```

**Coinage Multiplier**:
- Coins held <1 month: 0.5x multiplier
- Coins held 1-3 months: 0.8x multiplier
- Coins held 3-12 months: 1.0x multiplier
- Coins held >12 months: 2.0x multiplier (max)

### 13.3 Ballot Categories

**Category 1: Fiscal Mint & Supply**

Options:
- Top 3 community proposals + 3 limits (min/mid/max)
- Vote for 1 option (plurality wins)
- Result: Binding annual mint amount

Example Options:
- Proposal A: 50M ÉTR (5% annual)
- Proposal B: 75M ÉTR (7.5% annual)
- Proposal C: 100M ÉTR (10% annual)
- Limit 1: Min 25M (2.5%)
- Limit 2: Mid 62.5M (6.25%)
- Limit 3: Max 125M (12.5%)

**Category 2: Decentralized Director Elections**

Process:
- Candidates announce (must stake 128 ÉTR)
- Community votes for top 9
- Highest vote-getters become DDs
- 1-year term (Dec 1 - Nov 30)
- Max 3 consecutive terms

**Category 3: Protocol Amendments**

Requirements:
- Top 3 community proposals
- 66% supermajority required to pass
- 90-day audit period for major changes
- Implementation: Jan 1 following vote

---

## 14. CLIENT IMPLEMENTATIONS

### 14.1 CLI Client (ëtrepp Console)

**Purpose**: Command-line interface for developers/validators

**Key Features**:
```bash
# Account management
etrid account new --name alice
etrid account list
etrid account import <seed_phrase>

# Transaction submission
etrid tx transfer --from alice --to bob --amount 100
etrid tx stake --validator-id <id> --amount 64
etrid tx vote --proposal-id 5 --choice yes

# Blockchain queries
etrid chain height
etrid chain get-balance --account <address>
etrid chain get-storage --contract <addr> --key <key>

# Node operations (for validators)
etrid node start --validator-id <id>
etrid node status
etrid node metrics
```

### 14.2 Web Wallet

**Purpose**: Browser-based wallet + governance interface

**Features**:
- Multi-account management
- Transaction signing (hardware wallet support)
- Staking interface
- Consensus Day voting portal
- Token swaps (DEX integration)
- Block explorer
- Validator stats

**URL**: https://wallet.etrid.io

### 14.3 Mobile Wallet (ëtrud)

**Purpose**: iOS/Android app for on-the-go access

**Features**:
- Simplified account management
- QR code for address sharing
- Biometric unlock
- Transaction history
- Staking dashboard
- Price tracking (ÉTR, ËDSC, VMw)

---

## 15. INTEGRATION & DEPLOYMENT GUIDE

### 15.1 Running a Flare Node

**Prerequisites**:
- CPU: 4+ cores
- RAM: 16 GB+
- Disk: 500 GB SSD
- Network: 100 Mbps symmetric

**Installation**:
```bash
# 1. Clone repository
git clone https://github.com/etrid/etrid-node.git
cd etrid-node

# 2. Build from source (or download binary)
cargo build --release

# 3. Generate chain spec
./target/release/etrid build-spec --chain mainnet > chain-spec.json

# 4. Start node
./target/release/etrid \
  --chain chain-spec.json \
  --validator \
  --port 30333 \
  --rpc-port 9933 \
  --rpc-external \
  --pruning=archive

# 5. Monitor
curl http://localhost:9933 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}'
```

### 15.2 Deploying a Smart Contract

**Example (Rust/ink!)**:

```rust
// In Cargo.toml
[dependencies]
ink = "4.0"

// In src/lib.rs
use ink::prelude::vec::Vec;

#[ink::contract]
pub mod counter {
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct Counter {
        count: u32,
        owner: AccountId,
    }

    impl Counter {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                count: 0,
                owner: Self::env().caller(),
            }
        }

        #[ink(message)]
        pub fn get(&self) -> u32 {
            self.count
        }

        #[ink(message)]
        pub fn increment(&mut self) {
            self.count += 1;
        }
    }
}
```

**Deploy**:
```bash
# 1. Compile to WASM
cargo contract build --release

# 2. Deploy via CLI
etrid contract deploy \
  --code ./target/ink/counter.wasm \
  --gas-limit 100000 \
  --endowment 10

# 3. Interact
etrid contract call \
  --address <contract_address> \
  --method increment \
  --gas-limit 50000
```

---

## CONCLUSION

This documentation index covers all **13 E³20 systems** with technical depth suitable for:
- **Developers**: Implementation details for all protocols
- **Auditors**: Complete specification for security review
- **Community**: Clear understanding of how ËTRID works

All sections are **executable specifications** ready for code generation and testing.

---

**END OF ËTRID PROTOCOL DOCUMENTATION INDEX v1.0.0**

*Status: APPROVED FOR DEVELOPMENT*  
*Next Update: Quarterly (December 2025)*  
*Maintainer: ËTRID Foundation Technical Committee*
