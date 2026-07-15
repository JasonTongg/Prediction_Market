# prediction-market

Next.js starter with Tailwind CSS, `@solana/kit`, and an Anchor prediction market program example.

## Getting Started

```shell
npx -y create-solana-dapp@latest -t solana-foundation/templates/kit/prediction-market
```

```shell
npm install
npm run setup   # Builds the Anchor program and generates the TypeScript client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect your wallet, and interact with the prediction market.

## What's Included

- **Wallet connection** via wallet-standard with auto-discovery and dropdown UI
- **Cluster switching** — devnet, testnet, mainnet, and localnet from the header
- **Airdrop** button (devnet/testnet/localnet)
- **Prediction market program** — browse all on-chain markets, create YES/NO markets, bet SOL, resolve, and claim winnings via PDAs
- **Toast notifications** with explorer links for every transaction
- **Error handling** — human-readable messages for common Solana and program errors
- **Codama-generated client** — type-safe program interactions using `@solana/kit`
- **Tailwind CSS v4** with light/dark mode toggle

## Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript |
| Styling        | Tailwind CSS v4                  |
| Solana Client  | `@solana/kit`, wallet-standard   |
| Program Client | Codama-generated, `@solana/kit`  |
| Program        | Anchor (Rust)                    |

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── header.tsx           # Shared nav: brand, New Market, theme/cluster/wallet
│   │   ├── cluster-context.tsx  # Cluster state (React context + localStorage)
│   │   ├── cluster-select.tsx   # Cluster switcher dropdown
│   │   ├── grid-background.tsx  # Solana-branded decorative grid
│   │   ├── providers.tsx        # Wallet + theme providers
│   │   ├── theme-toggle.tsx     # Light/dark mode toggle
│   │   ├── wallet-button.tsx    # Wallet connect/disconnect dropdown
│   │   └── markets/             # Prediction market UI (list, detail, create)
│   │       ├── status-badge.tsx        # Open / Awaiting / Resolved pill
│   │       ├── odds-bar.tsx            # YES/NO percentage bar
│   │       ├── odds-panel.tsx          # Large odds hero (detail page)
│   │       ├── market-tile.tsx         # Market list grid card
│   │       ├── resolved-banner.tsx     # Final outcome banner
│   │       ├── position-panel.tsx      # "Your position" summary
│   │       ├── bet-panel.tsx           # Bet form (place_bet)
│   │       ├── connect-to-bet-panel.tsx
│   │       ├── resolve-panel.tsx       # Creator resolve UI (resolve_market)
│   │       ├── claim-panel.tsx         # Claim/claimed/lost states (claim_winnings)
│   │       └── create-market-form.tsx  # Create market UI (create_market)
│   ├── generated/prediction_market/  # Codama-generated program client
│   ├── lib/
│   │   ├── wallet/             # Wallet-standard connection layer
│   │   │   ├── types.ts        # Wallet types
│   │   │   ├── standard.ts     # Wallet discovery + session creation
│   │   │   ├── signer.ts       # WalletSession → TransactionSigner
│   │   │   └── context.tsx     # WalletProvider + useWallet() hook
│   │   ├── hooks/
│   │   │   ├── use-balance.ts        # SWR-based balance fetching
│   │   │   ├── use-markets.ts        # getProgramAccounts market discovery (list page)
│   │   │   ├── use-market.ts         # SWR-based single Market account fetching
│   │   │   ├── use-user-position.ts  # SWR-based UserPosition account fetching
│   │   │   ├── use-now.ts            # Ticking clock for countdowns
│   │   │   └── use-send-transaction.ts  # Transaction send with loading state
│   │   ├── market-view.ts      # Status/odds/color/countdown derivation helpers
│   │   ├── cluster.ts          # Cluster endpoints + RPC factory
│   │   ├── lamports.ts         # SOL/lamports conversion
│   │   ├── send-transaction.ts # Transaction build + sign + send pipeline
│   │   ├── errors.ts           # Transaction error parsing
│   │   └── explorer.ts         # Explorer URL builder + address helpers
│   ├── page.tsx                 # Market list (home)
│   ├── create/page.tsx          # Create market
│   └── market/[address]/page.tsx  # Market detail (bet/resolve/claim)
├── anchor/                     # Anchor workspace
│   └── programs/prediction_market/  # Prediction market program (Rust)
└── codama.json                 # Codama client generation config
```

## Local Development

To test against a local validator instead of devnet:

1. **Start a local validator**

   ```bash
   solana-test-validator
   ```

2. **Deploy the program locally**

   ```bash
   solana config set --url localhost
   cd anchor
   anchor build
   anchor deploy
   cd ..
   npm run codama:js   # Regenerate client with local program ID
   ```

3. **Switch to localnet** in the app using the cluster selector in the header.

## Deploy Your Own Prediction Market

The included prediction market program is already deployed to devnet. To deploy your own:

### Prerequisites

- [Rust](https://rustup.rs/)
- [Solana CLI](https://solana.com/docs/intro/installation)
- [Anchor](https://www.anchor-lang.com/docs/installation)

### Steps

1. **Configure Solana CLI for devnet**

   ```bash
   solana config set --url devnet
   ```

2. **Create a wallet (if needed) and fund it**

   ```bash
   solana-keygen new
   solana airdrop 2
   ```

3. **Build and deploy the program**

   ```bash
   cd anchor
   anchor build
   anchor keys sync    # Updates program ID in source
   anchor build        # Rebuild with new ID
   anchor deploy
   cd ..
   ```

4. **Regenerate the client and restart**
   ```bash
   npm run setup   # Rebuilds program and regenerates client
   npm run dev
   ```

## Testing

Tests use [LiteSVM](https://github.com/LiteSVM/litesvm), a fast lightweight Solana VM for testing.

```bash
npm run anchor-build   # Build the program first
npm run anchor-test    # Run tests
```

The tests are in `anchor/programs/prediction_market/src/tests.rs` and automatically use the program ID from `declare_id!`.

## Regenerating the Client

If you modify the program, regenerate the TypeScript client:

```bash
npm run setup   # Or: npm run anchor-build && npm run codama:js
```

This uses [Codama](https://github.com/codama-idl/codama) to generate a type-safe client from the Anchor IDL.

## Learn More

- [Solana Docs](https://solana.com/docs) — core concepts and guides
- [Anchor Docs](https://www.anchor-lang.com/docs/introduction) — program development framework
- [Deploying Programs](https://solana.com/docs/programs/deploying) — deployment guide
- [@solana/kit](https://github.com/anza-xyz/kit) — Solana JavaScript SDK
- [Codama](https://github.com/codama-idl/codama) — client generation from IDL
