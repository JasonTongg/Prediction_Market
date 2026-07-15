<img width="1110" height="775" alt="image" src="https://github.com/user-attachments/assets/8738c5be-1ed7-4b5f-a9a8-679e75769899" />

# Verdict — On-Chain Prediction Markets on Solana

A fully on-chain, binary (YES/NO) prediction market built with **Anchor** on Solana. Anyone can open a market, bet SOL on an outcome, and claim a proportional share of the losing pool once it resolves — all state lives in Program Derived Addresses (PDAs), with no backend, no oracle, and no off-chain indexer.

- **Live demo:** [https://verdict-sol.vercel.app/](https://verdict-sol.vercel.app/)
- This repository contains **both** the Anchor smart contract and the Next.js frontend.

## Motivation & Overview

Prediction markets need two things to be trustworthy: transparent, tamper-proof resolution, and a payout mechanism nobody can quietly rig. Building directly on Solana with Anchor gets both for free. every market, bet, resolution, and claim is a signed on-chain instruction against a PDA, readable and verifiable by anyone via `getProgramAccounts`, with sub-cent fees and sub-second finality.

This repo demonstrates the full lifecycle of such a market:

- Creating a market with a question and a resolution deadline
- Betting SOL on YES or NO, tracked per-wallet in its own PDA
- Resolving the outcome (creator-gated, deadline-gated, one-shot)
- Claiming winnings computed directly from the losing pool

## Key Concepts

### Prediction Market

A binary market pays out based on which side — YES or NO — collects more informed money, not a coin flip. Losers' stakes are redistributed to winners in proportion to their bet:

```
winnings = your_bet + (your_bet / winning_pool) × losing_pool
```

No house edge, no external price feed — the payout is entirely a function of the two pools recorded on-chain.

### Program Derived Addresses (PDAs)

There is no database. Every piece of state is a PDA, deterministically derived and owned by the program:

- **Market** — question, resolution deadline, YES/NO pool totals, resolved flag, outcome
- **UserPosition** — a single wallet's cumulative YES/NO stake in one market, and whether they've claimed

Anyone can reconstruct the entire market list client-side by filtering the program's accounts by discriminator. which is exactly how the frontend's market list page works.

### Anchor Framework

**Anchor** is Solana's smart contract framework. Solana's equivalent of Foundry/Hardhat for EVM. It handles account validation, serialization, PDA bump derivation, and IDL generation, so the program logic in `lib.rs` stays focused on the actual business rules (bet limits, deadlines, payout math) instead of boilerplate.

## Architecture & Components

```
├── anchor/                                  # Anchor workspace
│   └── programs/prediction_market/src/
│       ├── lib.rs                           # create_market, place_bet, resolve_market, claim_winnings
│       ├── state.rs                         # Market & UserPosition account structs
│       ├── errors.rs                        # Custom program error codes
│       └── tests.rs                         # LiteSVM tests
├── app/                                      # Next.js frontend
│   ├── page.tsx                             # Market list (home)
│   ├── create/page.tsx                      # Create market
│   ├── market/[address]/page.tsx            # Market detail (bet / resolve / claim)
│   ├── components/markets/                  # Odds bar, bet/resolve/claim panels, market tiles
│   ├── generated/prediction_market/          # Codama-generated type-safe client
│   └── lib/
│       ├── hooks/use-markets.ts             # getProgramAccounts-based market discovery
│       ├── hooks/use-market.ts              # Single Market account fetch (SWR)
│       ├── hooks/use-user-position.ts       # UserPosition account fetch (SWR)
│       ├── market-view.ts                   # Status/odds/countdown derivation
│       └── wallet/                          # wallet-standard connection layer
└── codama.json                               # IDL → TypeScript client generation config
```

- **`lib.rs`** — the four instructions: `create_market`, `place_bet`, `resolve_market`, `claim_winnings`
- **`state.rs`** — the `Market` and `UserPosition` account layouts
- **`use-markets.ts`** — discovers every market on-chain via a discriminator `memcmp` filter, no indexer required
- **`market-card` panels** — one component per market state: open (bet), awaiting (resolve), resolved (claim/claimed/lost)

## Libraries & Tooling

This project uses:

- **Anchor**

  > Solana's smart contract framework.

  Used for:

  - Writing and validating the program (`anchor build`)
  - Running tests (`anchor test`)
  - Deploying to devnet/mainnet (`anchor deploy`)
  - Generating the on-chain IDL that drives client codegen

- **Codama**

  > Generates a fully-typed TypeScript client from an Anchor IDL — Solana's equivalent of typechain/wagmi's codegen.

  Used for:

  - Instruction builders (`getCreateMarketInstructionAsync`, `getPlaceBetInstructionAsync`, etc.)
  - Account decoders (`decodeMarket`, `decodeUserPosition`)
  - PDA derivation helpers (`findMarketPda`, `findUserPositionPda`)

- **`@solana/kit`**

  > Solana's modern JavaScript/TypeScript SDK (the successor to `@solana/web3.js`).

  Used for:

  - RPC calls, transaction building/signing, `getProgramAccounts` queries
  - Wallet-standard integration for connecting any Solana wallet extension

- **LiteSVM**

  > A fast, lightweight, in-process Solana VM for testing — no local validator required.

  Used for:

  - Exercising the full create → bet → resolve → claim lifecycle in tests
  - Validating error conditions (double-claim, early resolution, etc.) without touching a real cluster

- **Next.js + Tailwind CSS v4**. the frontend framework and styling for the market list, detail, and create-market pages.

## How It Works (Market Flow)

1. **Create** — a wallet calls `create_market` with a question and resolution deadline; a `Market` PDA is created, seeded by `[creator, market_id]`
2. **Bet** — any wallet calls `place_bet` with an amount and a side before the deadline; SOL moves into the market PDA, and the bettor's `UserPosition` PDA is created/updated
3. **Resolve** — once the deadline passes, only the market's creator can call `resolve_market` with the winning side; this is permanent and can only happen once
4. **Claim** — winning bettors call `claim_winnings`; the program computes `bet + (bet / winning_pool) × losing_pool` and transfers the payout directly from the market PDA's lamports

The frontend mirrors this exactly: the market detail page renders a different action panel (bet form, waiting-on-creator, resolve buttons, or claim breakdown) depending on which of these four states the on-chain account is currently in.

## Author

**Jason Tong**
_Blockchain Developer | Smart Contract Engineer_

- **GitHub:** [JasonTongg](https://github.com/JasonTongg)
- **LinkedIn:** [Jason Tong](https://www.linkedin.com/in/jason-tong-42600319a/)
- **Focus:** Solana · Anchor · Rust · TypeScript · Next.js · Web3 · Foundry · Solidity · Hardhat
