# DETR P2P Protocol Specification v1.0
## Decentralized, Encrypted, Trustless, Resilient Peer-to-Peer Network Layer

**Document ID**: ETRID-DETR-P2P-1.0  
**Status**: Draft (implementation in progress; aligned with repo)  
**Last Updated**: October 2025 (repo-aligned)  
**Target Implementations**: Rust (primary), Go (reference), other languages planned  
**Primary Implementation**: `/Users/macbook/Desktop/etrid-workspace/etrid/01-detr-p2p/`

---

## TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [DPeers Protocol (Node Discovery)](#2-dpeers-protocol-node-discovery)
3. [AEComms Protocol (Encrypted Transport)](#3-aecomms-protocol-encrypted-transport)
4. [DETRP2P Protocol (Peer Tethering)](#4-detrp2p-protocol-peer-tethering)
5. [Ëtr Protocol (Block Synchronization)](#5-ëtr-protocol-block-synchronization)
6. [Fluent Protocol (Private Channels)](#6-fluent-protocol-private-channels)
7. [StoréD Protocol (Distributed Storage)](#7-stored-protocol-distributed-storage)
8. [Error Handling & Recovery](#8-error-handling--recovery)
9. [Performance Characteristics](#9-performance-characteristics)
10. [Security Considerations](#10-security-considerations)

---

## 1. OVERVIEW

### 1.1 Design Principles

**DETR p2p** is the foundational network layer for ËTRID. It's designed around 5 core principles:

1. **Decentralized**: No central servers or intermediaries
2. **Encrypted**: All peer communication is encrypted
3. **Trustless**: Peers don't need to trust each other
4. **Resilient**: Network continues operating with network partitions
5. **Scalable**: Target 10,000+ peer nodes; benchmarking is pending

### 1.2 Six Sub-Protocols

DETR p2p consists of 6 complementary protocols:

| Protocol | Purpose | Transport | Overhead |
|----------|---------|-----------|----------|
| **DPeers** | Peer discovery + lifecycle (Kademlia in detrp2p) | TCP | Medium |
| **AEComms** | Encrypted peer communication (X25519 + ChaCha20-Poly1305) | TCP | Medium |
| **DETRP2P** | Network transport + routing | TCP | Medium |
| **Etrid Protocol** | Message definitions + finality bridge | TCP | Medium |
| **Fluent** | Flow control + backpressure | TCP | Low |
| **StoréD** | Peer storage + caching | TCP | Low |

### 1.3 Layered Architecture

```
┌──────────────────────────────────────────────┐
│        Application Layer (Pallets)           │
│  - FODDoS Consensus                          │
│  - Smart Contracts (ËtwasmVM)                │
│  - Transactions                              │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│    DETR p2p Protocol Suite (Network Layer)   │
│  ┌─────────┬─────────┬─────────┬─────────┐  │
│  │ DPeers  │ AEComms │ DETRP2P │ Etrid   │  │
│  ├─────────┼─────────┼─────────┼─────────┤  │
│  │ Fluent  │ StoréD  │   (6 protocols)    │  │
│  └─────────┴─────────┴─────────┴─────────┘  │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│    TCP/UDP Socket Layer (OS)                 │
│  - TCP: Reliable, ordered streams            │
│  - UDP: Fast, unreliable datagrams           │
└──────────────────────────────────────────────┘
```

### 1.4 Repository Implementation Map

| Component | Repo Path | Status | Notes |
|-----------|-----------|--------|-------|
| DPeers (discovery + peer lifecycle) | `01-detr-p2p/dpeers/` + `01-detr-p2p/detrp2p/` | 🟡 Implemented | Kademlia routing lives in `detrp2p::KademliaNetwork`. |
| AEComms (encrypted transport) | `01-detr-p2p/aecomms/` | 🟡 Implemented | X25519 key exchange + ChaCha20-Poly1305. |
| DETRP2P (network transport) | `01-detr-p2p/detrp2p/` | 🟡 Implemented | Transport, message loop, maintenance tasks. |
| Etrid Protocol (message defs) | `01-detr-p2p/etrid-protocol/` | 🟡 Implemented | Includes `gadget-network-bridge`. |
| Fluent (flow control) | `01-detr-p2p/fluent/` | 🟡 Implemented | Queueing + backpressure utilities. |
| StoréD (peer storage) | `01-detr-p2p/stored/` | 🟡 Implemented | Peer metadata + cache. |
| Core (Go reference) | `01-detr-p2p/core/` | 🟡 Implemented | Reference implementation; integration in progress. |

**Integration Notes**:
- PBC collators integrate DETR P2P via `01-detr-p2p/*_PBC_*` integration docs.

---

## 2. DPEERS PROTOCOL (NODE DISCOVERY)

### 2.1 Purpose

DPeers enables nodes to discover each other without central servers using a Simplified Kademlia DHT (Distributed Hash Table).

### 2.2 Node Identity

**Peer ID**: 32 bytes (256 bits)

**Implementation Note**:
- `detrp2p` uses a temporary ID derived from socket address for inbound connections
  and remaps to the peer’s announced identity on handshake.
- Cryptographic identity binding is in progress; see `detrp2p::Message::Announce`.

### 2.3 K-Bucket Structure

**Definition**: Each node maintains K buckets for neighbor routing

```rust
pub struct KBucket {
    distance_range: (u256, u256),  // Min/max distance from self
    nodes: Vec<Node>,              // Up to K nodes
    replacement_cache: Vec<Node>,  // Backup nodes
}

pub struct Node {
    node_id: [u8; 32],
    addresses: Vec<SocketAddr>,
    last_seen: u64,               // Unix timestamp
    reputation: i32,              // -100 to +100
}
```

**Parameters**:
- K = 20 (nodes per bucket)
- Total buckets = 256 (one per bit position)
- Max nodes in memory: 256 × 20 = 5,120 nodes

### 2.4 XOR Distance Metric

**Distance Calculation**:

```rust
fn xor_distance(node_a: [u8; 32], node_b: [u8; 32]) -> [u8; 32] {
    let mut distance = [0u8; 32];
    for i in 0..32 {
        distance[i] = node_a[i] ^ node_b[i];
    }
    distance
}

fn distance_as_int(node_a: [u8; 32], node_b: [u8; 32]) -> u256 {
    let xor = xor_distance(node_a, node_b);
    u256::from_le_bytes(xor)
}
```

**Bucket Assignment**:
```
For node with ID X:
  - Distance to other node Y = XOR(X, Y)
  - Bit position of first 1-bit = bucket index
  - Nodes with same bit position go in same bucket
```

### 2.5 Message Types

**PING** (Keep-Alive):
```
Header:
  message_type: u8 = 1
  version: u16 = 1
  timestamp: u64
  nonce: u64 (random)

Body:
  sender_id: [u8; 32]
  sender_addresses: Vec<SocketAddr>  (max 5)
  network_id: [u8; 32]              ("mainnet" or "testnet")
  
Signature:
  signature: [u8; 64]               (Ed25519)
```

**PONG** (Response to PING):
```
Header:
  message_type: u8 = 2
  version: u16 = 1
  timestamp: u64
  nonce: u64 (echo from PING)

Body:
  responder_id: [u8; 32]
  responder_addresses: Vec<SocketAddr>
  current_height: u32               (blockchain height)
  current_state_root: [u8; 32]
  
Signature:
  signature: [u8; 64]
```

**FIND_NODE** (DHT Query):
```
Header:
  message_type: u8 = 3
  timestamp: u64
  request_id: u64                   (for matching with response)

Body:
  target_node_id: [u8; 32]
  searcher_id: [u8; 32]
  k: u32 = 20                       (number of nodes requested)
```

**NODES** (DHT Response):
```
Header:
  message_type: u8 = 4
  timestamp: u64
  request_id: u64                   (match with FIND_NODE)

Body:
  target_node_id: [u8; 32]
  nodes: Vec<{
    node_id: [u8; 32],
    addresses: Vec<SocketAddr>,
    reputation: i32,
    last_seen: u64,
  }>                                (up to K nodes)
```

### 2.6 Node Discovery Algorithm

**Bootstrap**:
```
new_node_joins():
    1. Load bootstrap nodes from config (3-5 well-known nodes)
    2. For each bootstrap node:
        a. Open TCP connection
        b. Send PING
        c. If PONG received:
           - Add to k-buckets
           - Query for K random nodes
    
    3. Recursively query returned nodes for even more nodes
    
    4. Continue until k-buckets are populated (5-10 minutes)
```

**Active Discovery** (Continuous):
```
every_30_seconds():
    1. If any k-bucket has < K/2 nodes:
        - Pick random node ID in that range
        - Send FIND_NODE query to closest known node
        - Add responses to k-buckets
    
    2. If no PING received from any node in k-bucket for 60 seconds:
        - Mark node as stale
        - Remove from active bucket, move to replacement cache
        - Promote replacement node if available
```

**Iterative Lookup**:
```
find_closest_nodes(target_id, k=20):
    results = []
    candidates = closest_k_nodes_locally(target_id, 3*k)
    queried = set()
    
    while len(candidates) > 0:
        node = candidates.pop_closest()
        if node in queried:
            continue
        
        queried.add(node)
        response = send_find_node(node, target_id)
        
        for returned_node in response.nodes:
            if returned_node not in queried:
                candidates.add(returned_node)
        
        # Collect best results
        all_results = sorted(all_nodes, key=distance_to(target_id))
        results = all_results[:k]
    
    return results
```

### 2.7 Sybil Attack Prevention (Planned)

**Implementation Status**:
- PoW admission is **not enforced** in the current repo.
- `dpeers` tracks reputation metadata but does not auto-ban or gate discovery.

**Proof-of-Work on Join (Target Design)**:
```
new_node_challenge():
    1. Random node sends CHALLENGE message to new node
    2. New node must compute proof-of-work:
       
       nonce = find_nonce_where(
           leading_zeros(SHA256(node_id || nonce)) >= difficulty
       )
       
       difficulty = 2^20 leading zero bits (~1 million hashes)
    
    3. Send CHALLENGE_RESPONSE with nonce
    4. Verifier checks POW, adds to k-bucket if valid
    5. Cost to Sybil attacker: ~1M SHA256 hashes per fake node
```

**Reputation System (Target Design)**:
```
node_reputation():
    - Successful responses: +5 per message
    - Failed responses: -10 per timeout
    - Malformed messages: -25
    - Double-spend attempt: -100 (permanent ban)
    
    reputation_score = sum_of_all_interactions
    
    If reputation < -50:
        - Remove from k-buckets
        - Blacklist for 24 hours
        - Do not answer queries about this node

```

---

## 3. AECOMMS PROTOCOL (ENCRYPTED TRANSPORT)

### 3.1 Purpose

AEComms provides encrypted, authenticated communication between peers using ECIES (Elliptic Curve Integrated Encryption Scheme).

### 3.2 Connection Handshake

**Phase 1: HELLO Exchange**

```
Peer A                                  Peer B
|                                       |
| ----- TCP SYN to B:30333 -------->   |
|                                       |
| <----- TCP SYN+ACK ----------- |
|                                       |
| ----------- HELLO ------------->     |
| {                                    |
|   ephemeral_pubkey_A: [u8; 32],      |
|   supported_ciphers: [1, 2, 3],      |
|   signature_A: [u8; 64],             |
| }                                    |
|                                       |
|                            HELLO ---- |
|                         {              |
|                   ephemeral_pubkey_B,  |
|                 supported_ciphers,     |
|                        signature_B     |
|                         }              |
```

**Handshake Message**:
```rust
struct HelloMessage {
    version: u16,                    // Protocol version (1)
    ephemeral_pubkey: [u8; 32],      // Ed25519 ephemeral key
    timestamp: u64,                  // Unix time (reject if >60s old)
    peer_id: [u8; 32],               // Sender's peer ID
    nonce: u64,                      // Random nonce
    supported_ciphers: Vec<u8>,      // [ChaCha20=1, AES-256=2]
    signature: [u8; 64],             // Sign(ephemeral_pubkey || timestamp)
}
```

**Phase 2: ECDH Key Agreement**

```rust
fn establish_shared_secret(
    my_ephemeral_private: [u8; 32],
    peer_ephemeral_public: [u8; 32],
) -> [u8; 32] {
    // Compute shared point via ECDH
    shared_point = curve25519(my_ephemeral_private, peer_ephemeral_public)
    
    // Hash to 32-byte key
    shared_secret = BLAKE2b(shared_point)[0..32]
    
    return shared_secret
}
```

Both peers now have shared secret **without ever transmitting it**.

### 3.3 Message Encryption/Decryption

**Frame Format**:
```
[Message Type: 1 byte]
[Nonce Counter: 8 bytes]
[Message Length: 4 bytes]
[Ciphertext: variable]
[Auth Tag: 16 bytes]
```

**Encryption**:
```rust
struct EncryptedFrame {
    message_type: u8,
    nonce_counter: u64,
    length: u32,
    ciphertext: Vec<u8>,
    auth_tag: [u8; 16],
}

fn encrypt_message(
    plaintext: &[u8],
    shared_secret: &[u8; 32],
    cipher_type: u8,
    nonce_counter: u64,
) -> EncryptedFrame {
    // Derive keys via HKDF
    let (cipher_key, hmac_key) = hkdf_expand(shared_secret);
    
    // Construct nonce (12 bytes for ChaCha20, 16 for AES)
    let nonce = format!("{:0128b}", nonce_counter).as_bytes()[..12].to_vec();
    
    // Encrypt
    let ciphertext = match cipher_type {
        1 => chacha20_poly1305_encrypt(plaintext, &cipher_key, &nonce),
        2 => aes_256_gcm_encrypt(plaintext, &cipher_key, &nonce),
        _ => panic!("Unsupported cipher"),
    };
    
    // Authenticate additional data (nonce_counter || message_type)
    let aad = [message_type, nonce_counter.to_le_bytes()].concat();
    let auth_tag = poly1305_mac(&ciphertext, &hmac_key, &aad);
    
    EncryptedFrame {
        message_type,
        nonce_counter,
        length: ciphertext.len() as u32,
        ciphertext,
        auth_tag,
    }
}

fn decrypt_message(frame: &EncryptedFrame, shared_secret: &[u8; 32]) -> Vec<u8> {
    let (cipher_key, hmac_key) = hkdf_expand(shared_secret);
    let nonce = format!("{:0128b}", frame.nonce_counter).as_bytes()[..12].to_vec();
    
    // Verify auth tag
    let aad = [frame.message_type, frame.nonce_counter.to_le_bytes()].concat();
    let computed_tag = poly1305_mac(&frame.ciphertext, &hmac_key, &aad);
    assert!(timing_safe_compare(&frame.auth_tag, &computed_tag));
    
    // Decrypt
    let plaintext = match cipher_type {
        1 => chacha20_poly1305_decrypt(&frame.ciphertext, &cipher_key, &nonce),
        2 => aes_256_gcm_decrypt(&frame.ciphertext, &cipher_key, &nonce),
        _ => panic!("Unsupported cipher"),
    };
    
    plaintext
}
```

### 3.4 Nonce Monotonicity

**Critical**: Nonce counter must always increase

```rust
struct AECommsConnection {
    out_nonce: Arc<Mutex<u64>>,    // Protected by mutex
    in_nonces: HashSet<u64>,        // Track received nonces
    last_in_nonce: u64,
}

fn send_message(&mut self, data: &[u8]) -> Result<()> {
    let mut nonce = self.out_nonce.lock().unwrap();
    *nonce += 1;  // Always increment
    
    let frame = encrypt_message(data, &self.shared_secret, *nonce)?;
    self.socket.write_all(&frame)?;
}

fn recv_message(&mut self) -> Result<Vec<u8>> {
    let frame = read_frame(&self.socket)?;
    
    // Reject if nonce ≤ last_nonce (replay attack)
    if frame.nonce_counter <= self.last_in_nonce {
        return Err("Nonce replay detected");
    }
    
    self.last_in_nonce = frame.nonce_counter;
    decrypt_message(&frame, &self.shared_secret)
}
```

### 3.5 Message Types

**Message Type 1: Ping**
```
Body: peer_id [32], timestamp [8], nonce [8]
Length: 48 bytes
Purpose: Keep-alive, measure latency
```

**Message Type 2: Pong**
```
Body: echo_nonce [8], latency_ms [4], height [4]
Length: 16 bytes
Purpose: Response to ping
```

**Message Type 10: Block Announcement**
```
Body: block_hash [32], height [4], timestamp [8]
Length: 44 bytes
Purpose: Notify peer of new block
```

**Message Type 20: Transaction Propagation**
```
Body: num_tx [4], tx_data [variable]
Length: 4 + variable
Purpose: Broadcast pending transactions
```

### 3.6 Connection Management

**Connection Limits**:
- Max inbound connections: 100
- Max outbound connections: 50
- Max connections per IP: 5
- Connection timeout: 5 minutes inactive

**Rate Limiting**:
```rust
pub struct RateLimiter {
    messages_per_second: u32,
    bytes_per_second: u64,
    current_messages: Arc<AtomicU32>,
    current_bytes: Arc<AtomicU64>,
    window_start: Instant,
}

fn check_rate_limit(&mut self, message_size: usize) -> Result<()> {
    if self.window_start.elapsed() > Duration::from_secs(1) {
        self.current_messages.store(0, Ordering::Relaxed);
        self.current_bytes.store(0, Ordering::Relaxed);
        self.window_start = Instant::now();
    }
    
    let msgs = self.current_messages.fetch_add(1, Ordering::Relaxed);
    let bytes = self.current_bytes.fetch_add(message_size as u64, Ordering::Relaxed);
    
    if msgs > self.messages_per_second || bytes > self.bytes_per_second {
        return Err("Rate limit exceeded");
    }
    
    Ok(())
}
```

---

## 4. DETRP2P PROTOCOL (PEER TETHERING)

### 4.1 Purpose

DETRP2P maintains long-lived, high-quality peer connections that form the backbone of the network.

### 4.2 Tether Establishment

**Selection Criteria**:
```
tether_score(peer) = 
    (uptime_percentage / 100) +
    (min(latency_ms, 100) / 100) +
    (reliability_score / 100) +
    (geographic_diversity_bonus) +
    (version_compatibility_bonus)

Best scoring peers are selected for tethering
```

**Connection Process**:
```
new_node_joins():
    1. Query DPeers for K random nodes
    2. For each node:
        - Open AEComms connection
        - Evaluate tether_score
    3. Select top 4 nodes for tethering
    4. Keep tethers alive for ≥30 minutes
    5. Monitor health, replace if necessary
```

### 4.3 Tether Messages

**TETHER_REQUEST**:
```rust
struct TetherRequest {
    requester_id: [u8; 32],
    network_version: u16,
    capabilities: BitSet,  // CanRelay, HasHistory, etc.
    preferred_duration: u32,  // Seconds
}
```

**TETHER_ACCEPT**:
```rust
struct TetherAccept {
    accepted: bool,
    tether_id: [u8; 16],
    lease_duration: u32,  // Seconds
    keep_alive_interval: u16,  // Seconds
}
```

**KEEP_ALIVE**:
```rust
struct KeepAlive {
    tether_id: [u8; 16],
    sequence: u32,
    timestamp: u64,
    peer_count: u32,  // Network size hint
}
```

### 4.4 Tether Maintenance

**Health Checks**:
```
every_30_seconds():
    for each tether:
        if no message received in 60 seconds:
            - Send KEEP_ALIVE
            - If no response in 30 seconds: MARK_STALE
        
        if marked_stale_for_60_seconds:
            - Close connection
            - Remove from tethers
            - Query for replacement
            - Establish new tether
```

**Rebalancing**:
```
if node_detects_partition():
    # Too many tethers point to same part of network
    
    1. Identify isolated components
    2. Query for nodes in other components
    3. Prioritize diversifying tether destinations
    4. Reconnect to establish bridge across partition
```

---

## 5. ËTR PROTOCOL (BLOCK SYNCHRONIZATION)

### 5.1 Purpose

Ëtr efficiently synchronizes blockchain state between nodes, handling both initial sync and continuous updates.

### 5.2 Block Request Message

**REQUEST_BLOCKS**:
```rust
struct BlockRequest {
    request_id: u64,
    start_height: u32,
    count: u32,  // Max 100
    full_blocks: bool,  // False = headers only
    include_justifications: bool,
}
```

**BLOCK_RESPONSE**:
```rust
struct BlockResponse {
    request_id: u64,
    blocks: Vec<Block>,
    total_chain_weight: u128,
    best_block_hash: [u8; 32],
    finalized_height: u32,
}
```

### 5.3 Sync Strategies

**Light Client Sync** (Mobile wallets):
```
1. Connect to Flare Node
2. Request headers every 256 blocks
3. Verify chain continuity (each header references previous)
4. Verify validator quorum signatures (66%+)
5. Keep only last 256 blocks in memory
6. Query for specific transactions as needed
```

**Full Node Sync** (Validators):
```
1. Connect to multiple Flare Nodes
2. Download headers first (0 to current height)
3. Request full blocks in parallel from different peers
4. Verify all transactions
5. Execute smart contracts
6. Track state root
7. Store full history (500GB+)
```

**Archive Node Sync** (Long-term storage):
```
1. Same as full node
2. Keep all historical data (state at every block)
3. Enable querying "state at block N"
4. Participate in StoréD for redundancy
```

### 5.4 Fork Resolution

**Fork Detection**:
```
on_receive_block(block):
    if block.parent_hash not in chain:
        # Unknown parent - new chain tip
        candidates = [current_chain_tip, block]
    else if block.height <= finalized_height:
        # Old block (below finality) - reject
        return
    else:
        # New block on known chain
        append_to_chain(block)

def apply_fork_choice():
    # Heaviest chain wins (sum of validator stakes that signed)
    best_chain = max(candidates, key=lambda c: c.total_weight)
    
    if best_chain != current_chain_head:
        # Reorg needed
        reorg_to_chain(best_chain)
```

**Reorg Execution**:
```
reorg_to_chain(new_chain):
    # Find last common ancestor
    lca = find_last_common_ancestor(current_chain, new_chain)
    
    # Revert blocks from current_chain[lca..current_head]
    for block in reversed(current_chain[lca+1..]):
        revert_block(block)  # Undo state changes
    
    # Apply blocks from new_chain[lca..new_head]
    for block in new_chain[lca+1..]:
        apply_block(block)  # Execute transactions
    
    # Update chain head
    update_chain_head(new_chain)
```

---

## 6. FLUENT PROTOCOL (PRIVATE CHANNELS)

### 6.1 Purpose

Fluent enables private, encrypted communication for sensitive operations (Consensus Day voting, messages).

### 6.2 Channel Types

**Point-to-Point** (Sender → Recipient only):
```
Sender creates ephemeral key
Sender encrypts message with recipient's public key (ECIES)
Sender sends to recipient (may route through multiple peers)
Only recipient can decrypt
Message deleted after recipient reads
```

**Anonymous** (Recipient cannot identify sender):
```
Sender routes message through random peers
Each peer decrypts outer layer (knows only previous peer)
Final peer receives message without knowing original sender
Recipient sees only: "Anonymous user says..."
```

### 6.3 Message Format

**PRIVATE_MESSAGE**:
```rust
struct FluentMessage {
    message_id: [u8; 32],
    recipient_id: [u8; 32],
    sender_id: Option<[u8; 32]>,  // None if anonymous
    
    encrypted_content: Vec<u8>,   // ECIES encrypted
    content_hash: [u8; 32],       // SHA256 of plaintext
    
    sender_signature: [u8; 64],   // Sign(content_hash) - None if anonymous
    
    ttl: u32,                     // Seconds until auto-delete
    created_at: u64,              // Unix timestamp
    
    routing_path: Option<Vec<[u8; 32]>>,  // For tracing routing
}
```

### 6.4 Routing

**Direct Routing** (Latency priority):
```
sender → recipient (direct connection if available)
```

**Multi-Hop Routing** (Privacy priority):
```
sender → router1 → router2 → router3 → recipient

Each layer encrypted such that:
- Router1 knows: message going to router2 (not final recipient)
- Router2 knows: message from router1 going to router3
- Only router3 knows final recipient
```

**Tor-Style Onion Routing**:
```
1. Sender builds route: self → R1 → R2 → R3 → recipient
2. Constructs onion (layers of encryption):
   layer3 = encrypt(recipient_address, recipient_key)
   layer2 = encrypt(R3 + layer3, R2_key)
   layer1 = encrypt(R2 + layer2, R1_key)
   outer = encrypt(R1 + layer1, sender_key)

3. Send to R1
   R1 decrypts: learns R2, forwards layer2 to R2
   R2 decrypts: learns R3, forwards layer3 to R3
   R3 decrypts: learns recipient, forwards to recipient

4. Recipient receives message, knows only R3 was previous hop
```

---

## 7. STORED PROTOCOL (DISTRIBUTED STORAGE)

### 7.1 Purpose

StoréD distributes data across peer nodes for redundancy and resilience.

### 7.2 Data Model

**File Storage**:
```
Large file (>1MB)
    → Split into chunks (512 KB each)
    → Each chunk gets Merkle proof
    → Distributed to 3 different nodes
    → Client stores Merkle root + node addresses
```

**Merkle DAG** (Directed Acyclic Graph):
```
File
├─ Block 0
├─ Block 1
├─ Block 2
└─ Merkle Root = BLAKE2b(hash(B0) || hash(B1) || hash(B2))

Any block can be verified against root
```

### 7.3 Storage Economy

**Storage Provider**:
```rust
struct StorageProvider {
    provider_id: [u8; 32],
    capacity_bytes: u64,
    used_bytes: u64,
    price_per_gb_per_day: u128,  // In VMw
    availability: u8,             // 0-100% uptime
    reputation: i32,              // -100 to +100
}
```

**Storage Contract**:
```rust
struct StorageContract {
    provider: [u8; 32],
    client: [u8; 32],
    data_root: [u8; 32],
    size_bytes: u64,
    duration_days: u32,
    price_total: u128,
    start_time: u64,
    end_time: u64,
}
```

### 7.4 Retrieval

**GET_DATA**:
```
Client: "I need data with root hash XXX"

Network:
  1. DHT lookup for nodes storing root XXX
  2. Return 3 providers with addresses
  
Client chooses fastest provider (lowest latency)

Provider sends chunks one-by-one
Client verifies each chunk against Merkle root
If verification fails, blacklist provider, retry with alternate
```

**Pricing Example**:
```
File: 10 GB
Duration: 30 days
Provider rate: 1 VMw per GB per day

Total cost: 10 × 30 × 1 = 300 VMw = ~0.3 ÉTR (at 1000 VMw = 1 ÉTR)

Payment: Smart contract holds escrow
- Day 1-30: Provider stores data
- Day 30: Client verifies data (cryptographic proof)
- Day 31: Provider paid (or refund if failed verification)
```

---

## 8. ERROR HANDLING & RECOVERY

### 8.1 Connection Failures

**TCP Connection Lost**:
```
while trying_to_send_message:
    if socket.write() fails:
        attempt_reconnect(peer)
        
def attempt_reconnect(peer, max_retries=5):
    for attempt in 1..max_retries:
        wait_time = 2 ^ attempt  # Exponential backoff
        sleep(wait_time)
        
        try:
            new_socket = tcp_connect(peer.address)
            send_hello_handshake(new_socket)
            return new_socket
        except:
            continue
    
    # Max retries exceeded
    mark_peer_unreliable(peer)
    remove_from_tethers(peer)
```

**Malformed Message**:
```
on_receive_data(peer, data):
    try:
        message = parse_message(data)
        handle_message(message)
    except ParseError:
        print(f"Malformed message from {peer}")
        peer.reputation -= 10
        
        if peer.reputation < -50:
            ban_peer(peer, duration=24_hours)
```

### 8.2 Byzantine Peer Recovery

**Double-Message Attack**:
```
Attacker sends:
  Message A at 12:00:01
  Message B (contradictory) at 12:00:02

Detection:
  Store message hash + signature
  If same sender sends contradictory signature: SLASH
  
Action:
  - Remove peer from network
  - Blacklist for 1 week
  - Report to validators (proof-of-Byzantine available on-chain)
```

---

## 9. PERFORMANCE CHARACTERISTICS

### 9.1 Throughput

| Operation | Throughput | Notes |
|-----------|-----------|-------|
| Block propagation | <1 second | ~1MB block to 1,000 peers |
| Transaction relay | <100ms | ~0.5KB tx to 10,000 peers |
| Node discovery (join) | ~5 minutes | Populate k-buckets |
| Consensus message | ~10ms | <1KB to 100 validators |

### 9.2 Latency

| Operation | Latency | Notes |
|-----------|---------|-------|
| Ping-pong (DPeers) | 50-100ms | Round-trip discovery |
| Message delivery (AEComms) | 100-500ms | Encrypted single message |
| Block sync (Ëtr) | 1-10s | For 1MB block over 100Mbps |
| Private message (Fluent) | 1-5s | Multi-hop routing |

### 9.3 Bandwidth

| Scenario | Bandwidth | Notes |
|----------|-----------|-------|
| Idle peer (keep-alives) | ~1 KB/min | 8 tethers × 0.1 KB/30s |
| Normal block propagation | ~100 Mbps peak | 1,000 peers × 1MB / 10s |
| High-load network | ~500 Mbps | Saturates typical ISP link |

### 9.4 Scalability

**Network Size**: Target 10,000 peers (benchmarking pending)

```
DHT buckets: 256 × 20 = 5,120 nodes per peer (< 1MB memory)
Tethers: 4-8 outbound connections (manageable)
Inbound: Up to 100 connections (limited by OS)
Total memory: ~200 MB per peer node (reasonable for validators)
```

---

## 10. SECURITY CONSIDERATIONS

### 10.1 Attack Vectors

**Sybil Attack**:
- Attacker creates 1,000 fake nodes
- PoW admission is planned but not enforced in current repo
- Current mitigations: Kademlia bucket diversity + reputation metadata

**DDoS (Distributed Denial of Service)**:
- Attacker floods network with PING/FIND_NODE
- Mitigation: Rate limiting (100 msg/sec per peer), ban on abuse

**Man-in-the-Middle (MITM)**:
- Attacker intercepts TCP connection
- Mitigation: ECIES encryption, signatures verify peer identity

**Eclipse Attack**:
- Attacker controls all peers you connect to
- Mitigation: Multiple tether diversification, bootstrap to well-known nodes

### 10.2 Cryptographic Assumptions

**Ed25519**:
- Assumed unbroken for 10+ years
- ~2^128 security strength

**BLAKE2b**:
- Cryptanalytic resistance similar to SHA-3
- No known attacks

**ChaCha20**:
- Well-studied, proven secure
- Fast on all platforms

### 10.3 Recommendations for Implementers

1. **Always validate signatures** before trusting message content
2. **Rate limit all peers** (100 msg/sec default)
3. **Keep peer state** (reputation, last seen) for quick decisions
4. **Use TLS or similar** for extra transport security (optional but recommended)
5. **Monitor for anomalies** (network latency spikes, message delays)

---

## IMPLEMENTATION CHECKLIST

- [ ] DPeers DHT (Node discovery)
- [ ] AEComms encryption layer
- [ ] DETRP2P tether management
- [ ] Ëtr block synchronization
- [ ] Fluent private channels
- [ ] StoréD distributed storage
- [ ] Integration tests (all 6 protocols)
- [ ] Security audit
- [ ] Performance benchmarks
- [ ] Documentation (this spec!)

---

**END OF DETR P2P PROTOCOL SPECIFICATION v1.0**

*Ready for implementation. Estimated development time: 8-12 weeks for Rust implementation.*
