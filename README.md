# Shipped

# Shipped

**Daily proof of work, stamped onchain.**

Built for the BuildAnything **Spark** hackathon on Monad Testnet.

---

## Problem

During a hackathon (or any intense build sprint), it's easy to lose track of
whether you actually *did* something meaningful today — read, practiced,
shipped code — or just felt busy. Habit apps exist, but they live in a
private database: you can delete your history, fudge a streak, or the app
just quietly resets your data. There's no way to prove, to yourself or
anyone else, that you actually showed up.

## Solution

Shipped is a daily check-in app where **each habit keeps its own
independent streak** — the same way Google Play Games tracks a separate
achievement streak per game. You create a habit ("Read", "Gym", "Practice
guitar"), and once a day you tap one button to confirm you did it. The
check-in, the streak, and the history are all written onchain — nothing
lives in a database you could quietly edit.

- One button, one action: "Did you [habit] today?"
- Miss a day, that habit's streak resets to zero — no cheating, no undo
- Every check-in is a real transaction on Monad Testnet, verifiable by
  anyone on the block explorer
- Sign-in is email or Google via Privy — no wallet install, no seed phrase,
  no popup interrupting every single check-in (embedded wallet signs
  silently once you're logged in)

## How it works

- **Smart contract** (`Shipped.sol`) stores, per wallet address, a list of
  activities. Each activity tracks: name, last check-in day, current
  streak, longest streak, and total check-ins.
- Streak logic runs entirely onchain: checking in on the day right after
  your last check-in increments the streak; checking in after a gap resets
  it to 1; checking in twice in the same UTC day reverts.
- The frontend (React + Tailwind + viem) reads and writes directly against
  the contract — there is no backend server and no off-chain database.

## Tech stack

- **Contract**: Solidity, deployed with Foundry
- **Chain**: Monad Testnet (chain ID `10143`)
- **Frontend**: React, Vite, Tailwind CSS, viem
- **Auth / wallets**: Privy (embedded wallets, silent signing)

## Contract

| | |
|---|---|
| Network | Monad Testnet |
| Address | `0xA50259E09Aa6E9462398c819eA839F4D539FbCE8` |
| Explorer | https://testnet.monadexplorer.com/address/0xA50259E09Aa6E9462398c819eA839F4D539FbCE8 |

## Running locally

```bash
git clone https://github.com/lawalal079/Shipped
cd shipped-app
npm install
cp .env.example .env
```

Fill in `.env`:
```
VITE_PRIVY_APP_ID=your-privy-app-id
VITE_SHIPPED_CONTRACT_ADDRESS=0xA50259E09Aa6E9462398c819eA839F4D539FbCE8
```

```bash
npm run dev
```

You'll need testnet MON to check in — get some free from
[faucet.monad.xyz](https://faucet.monad.xyz).

## Redeploying the contract

```bash
forge script script/Deploy.s.sol:DeployShipped \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## What's next

- Onchain reviews / social proof between users
- A consumption/streak-decay visualization on the passport panel
- Opening the same "independent streak per activity" model to other habit
  categories (fitness, learning, coding)

## Built by

 BinLawal
