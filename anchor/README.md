# Anchor Prediction Market Program

This template includes a SOL-denominated YES/NO prediction market program built with [Anchor](https://www.anchor-lang.com/).

## Pre-deployed Program

The prediction market program is deployed on **devnet** at:

```
A7XFHaiEkUqwuUwY4ZAEqJDDjA5Z5EJtvMdrRZTtqeiL
```

You can interact with it immediately by connecting your wallet to devnet.

## Deploying Your Own Program

To deploy your own version of the program:

### 1. Generate a new program keypair

```bash
cd anchor
solana-keygen new -o target/deploy/prediction_market-keypair.json
```

### 2. Get the new program ID

```bash
solana address -k target/deploy/prediction_market-keypair.json
```

### 3. Update the program ID

Update the program ID in these files:

- `anchor/Anchor.toml` - Update `prediction_market = "..."` under `[programs.devnet]`
- `anchor/programs/prediction_market/src/lib.rs` - Update `declare_id!("...")`

### 4. Build and deploy

```bash
# Build the program
anchor build

# Get devnet SOL for deployment (~2 SOL needed)
solana airdrop 2 --url devnet

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### 5. Regenerate the TypeScript client

```bash
cd ..
npm run codama:js
```

This updates the generated client code in `app/generated/prediction_market/` with your new program ID.

## Program Overview

The prediction market program allows users to:

- **Create Market**: Open a YES/NO market with a question and resolution time, backed by a market PDA (Program Derived Address)
- **Place Bet**: Bet SOL on YES or NO before the resolution time
- **Resolve Market**: The market creator sets the winning outcome once the resolution time has passed
- **Claim Winnings**: Winning bettors claim their original bet plus a share of the losing pool

Each market and each user's position in it are derived as PDAs.

## Testing

Run the Anchor tests:

```bash
anchor test --skip-deploy
```
