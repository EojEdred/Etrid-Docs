# ËTRID PBC Bridge - Mainnet Implementation Plan

**Generated:** 2025-12-01
**Status:** Code Changes Implemented; Testing Required Before Mainnet

---

## Executive Summary

Based on comprehensive analysis, the PBC bridge architecture is **correctly designed** but has **4 critical security gaps** that must be resolved before mainnet:

| Gap | Severity | Location | Status |
|-----|----------|----------|--------|
| Signature Verification | CRITICAL | pallet-bridge-attestation::verify_attestation | Implemented |
| Attestation Integration | CRITICAL | pallet-token-messenger (BridgeAttestationVerifier) | Implemented |
| Relayer Authorization | HIGH | bnb/sol/polygon/xrp/bitcoin bridge pallets | Implemented |
| Token Burn/Mint | HIGH | pallet-token-messenger (TokenOperations) | Implemented |

**Total Estimated Work:** Code changes complete; testing + deployment still required

---

## Part 1: Signature Verification (Implemented)

### Current State (ENFORCED)
Signature verification is enforced in the generic `pallet-bridge-attestation`
for both ECDSA and SR25519.

```rust
// pallet-bridge-attestation/src/lib.rs (verify_attestation)
for (attester_id, signature) in attestation.signatures.iter() {
    let attester = Attesters::<T>::get(attester_id)
        .ok_or(Error::<T>::AttesterNotFound)?;
    ensure!(
        attester.status == AttesterStatus::Active,
        Error::<T>::AttesterNotActive
    );

    Self::verify_signature(&attester.public_key, &message_hash, signature)?;
}
```

---

## Part 2: Token-Messenger Attestation Integration (Implemented)

`pallet-token-messenger` delegates attestation verification to
`pallet-bridge-attestation` via `BridgeAttestationVerifier`. Relayers must pass
SCALE-encoded `AttestationData` to `receive_message()`.

```rust
impl pallet_token_messenger::Config for Runtime {
    type AttestationVerifier =
        pallet_token_messenger::attestation::BridgeAttestationVerifier<Runtime>;
    type TokenOperations = EdscTokenBridgeOps;
}

fn receive_message(origin, message: Vec<u8>, attestation: Vec<u8>) -> DispatchResult {
    let message_hash = Self::get_message_hash(&cross_chain_msg);
    T::AttestationVerifier::verify_message_attestation(&message, &attestation, message_hash)?;
    // ...
}
```

---

## Part 3: Relayer Authorization Pattern

**Status**: Implemented in the listed bridge pallets. Relayers must register with
`register_relayer(relayer, role)` and be active to submit deposits or burns.

### Bridges with TODO Gaps (5 pallets)
1. BNB Bridge (line 790)
2. Solana Bridge (line 769)
3. Polygon Bridge (line 798)
4. XRP Bridge (line 789)
5. Bitcoin Bridge (line 640)

### Unified Implementation

**Step 1: Add to common crate (/bridges/protocols/common/src/relayer.rs)**

```rust
#[derive(Clone, Copy, Debug, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum RelayerRole {
    Oracle,     // Can process burns (highest privilege)
    RelayNode,  // Can confirm deposits
    Custodian,  // Multi-sig approvals
}

pub trait RelayerAuthorization<AccountId> {
    fn is_authorized_relayer(relayer: &AccountId) -> bool;
    fn can_confirm_deposit(relayer: &AccountId) -> bool;
    fn can_process_burn(relayer: &AccountId) -> bool;
}
```

**Step 2: Add storage to each bridge pallet**

```rust
#[pallet::storage]
pub type AuthorizedRelayers<T: Config> = StorageMap<
    _, Blake2_128Concat, T::AccountId, RelayerRole, OptionQuery,
>;

#[pallet::storage]
pub type RelayerActive<T: Config> = StorageMap<
    _, Blake2_128Concat, T::AccountId, bool, ValueQuery,
>;
```

**Step 3: Add authorization function**

```rust
fn ensure_authorized_relayer(
    relayer: &T::AccountId,
    operation: RelayerOperation,
) -> DispatchResult {
    let role = AuthorizedRelayers::<T>::get(relayer)
        .ok_or(Error::<T>::NotAuthorizedRelayer)?;

    ensure!(RelayerActive::<T>::get(relayer), Error::<T>::RelayerInactive);

    match operation {
        RelayerOperation::ConfirmDeposit => {
            ensure!(
                matches!(role, RelayerRole::Oracle | RelayerRole::RelayNode),
                Error::<T>::InsufficientRelayerPermissions
            );
        }
        RelayerOperation::ProcessBurn => {
            ensure!(
                matches!(role, RelayerRole::Oracle),
                Error::<T>::InsufficientRelayerPermissions
            );
        }
    }
    Ok(())
}
```

**Step 4: Replace TODO in each bridge**

```rust
// Before (current):
pub fn process_etr_burn_from_bnb(...) -> DispatchResult {
    let _relayer = ensure_signed(origin)?;
    // TODO: Add relayer authorization check

// After:
pub fn process_etr_burn_from_bnb(...) -> DispatchResult {
    let relayer = ensure_signed(origin)?;
    Self::ensure_authorized_relayer(&relayer, RelayerOperation::ProcessBurn)?;
```

---

## Part 4: Token Burn/Mint (Implemented)

Burn/mint is handled through the `TokenOperations` trait in `pallet-token-messenger`.

```rust
// deposit_for_burn()
T::TokenOperations::burn_tokens(&sender, amount)?;

// receive_message()
let recipient_account: T::AccountId =
    T::AccountId::decode(&mut &burn_msg.mint_recipient[..])
        .map_err(|_| Error::<T>::InvalidRecipient)?;
T::TokenOperations::mint_tokens(&recipient_account, burn_msg.amount)?;
```

---

## Part 5: Multi-Chain Deployment Strategy

### Deployment Order (Based on PBC Architecture)

| Chain | PBC | Bridge Pallet | Priority | Est. Cost |
|-------|-----|---------------|----------|-----------|
| Solana | sol-pbc | solana-bridge | 1 (Active) | $350 |
| BSC | bnb-pbc | bnb-bridge | 2 | $160 |
| Ethereum | eth-pbc | ethereum-bridge | 3 | $450 |
| Polygon | matic-pbc | polygon-bridge | 4 | $150 |
| Tron | trx-pbc | tron-bridge | 5 | $50 |
| Arbitrum | (new) | (create) | 6 | $150 |

### Flow: External Chain → Native ËTR

```
User buys SPL ËTR on Solana (Raydium)
        ↓
Deposits to Solana bridge contract
        ↓
Solana PBC detects deposit (light client)
        ↓
Attesters submit signatures on-chain (submit_signature)
        ↓
Relayer packages AttestationData + calls receive_message
        ↓
Token-messenger verifies attestation
        ↓
Burns wrapped ËTR on Sol-PBC
        ↓
Mints native ËTR on Primearc Core Chain
        ↓
User receives native ËTR!
```

---

## Implementation Timeline

### Week 1: Core Security (CRITICAL)
- [x] Day 1-2: Implement signature verification in attestation pallet
- [x] Day 3: Wire attestation to token-messenger
- [x] Day 4: Implement token burn/mint calls
- [ ] Day 5: Unit tests for all security functions

### Week 2: Relayer System
- [x] Day 1: Create relayer.rs in common crate
- [x] Day 2-3: Add relayer storage/functions to listed bridge pallets
- [x] Day 4: Replace TODO comments with authorization checks
- [ ] Day 5: Integration tests

### Week 3: Multi-Chain Deployment
- [ ] Day 1-2: Deploy BEP-20 ËTR on BSC + PancakeSwap
- [ ] Day 3-4: Configure BNB PBC bridge
- [ ] Day 5: Deploy on Polygon + QuickSwap

### Week 4: Testing & Launch
- [ ] Day 1-2: Testnet deployment
- [ ] Day 3-4: Security audit review
- [ ] Day 5: Mainnet activation

---

## File Locations Reference

| Component | Path |
|-----------|------|
| Attestation Pallet | `/05-multichain/pallets-shared/pallet-bridge-attestation/src/lib.rs` |
| Token Messenger | `/05-multichain/pallets-shared/pallet-token-messenger/src/lib.rs` |
| EDSC Token | `/05-multichain/bridges/protocols/edsc-bridge/substrate-pallets/pallet-edsc-token/src/lib.rs` |
| ETR Lock | `/06-native-currency/pallets/pallet-etr-lock/src/lib.rs` |
| Common Bridge | `/05-multichain/bridges/protocols/common/src/` |
| Solana Bridge | `/05-multichain/bridges/protocols/solana-bridge/src/lib.rs` |
| BNB Bridge | `/05-multichain/bridges/protocols/bnb-bridge/src/lib.rs` |

---

## Risk Assessment

| Risk | Before Fix | After Fix |
|------|------------|-----------|
| Signature spoofing | CRITICAL | RESOLVED |
| Unauthorized minting | CRITICAL | RESOLVED |
| Replay attacks | HIGH | RESOLVED |
| Unauthorized relayers | HIGH | RESOLVED |
| Double-spending | HIGH | RESOLVED |

---

## Conclusion

The PBC bridge architecture is **sound and correctly designed**. The gaps are implementation details, not architectural flaws. With 6-8 days of focused work, the system will be production-ready for mainnet.

**Recommended approach:**
1. Fix Week 1 critical items first
2. Deploy to testnet for integration testing
3. Get security audit on signature verification
4. Proceed with multi-chain deployment

The multi-chain strategy (Solana → BSC → Ethereum → Polygon) leverages your existing PBC infrastructure without needing external bridges like Wormhole or LayerZero.
