<div align="center">

# TrumpIT

<img src="./public/banner.png" alt="Trumpit Logo" height="300">

</div>

A Telegram bot powered by [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit) for interacting with the TRUMP token on Solana. Make trading great again!

## Features

- 💰 Get real-time TRUMP token prices using Jupiter API
- 💱 Swap tokens (SOL ↔ TRUMP) via Jupiter Exchange
- 🤖 AI-powered responses using **DeepSeek**
- 💼 Automatic wallet creation and management via **Privy**
- 🔐 Secure transaction signing and bundle submission via Jito
- 📊 Check wallet and token balances
- 🎯 Get information about Donald Trump and the TRUMP token

## Prerequisites

- Node.js v20.10.0 or higher
- pnpm
- PostgreSQL database
- Redis instance
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

## Environment Variables

Create a `.env` file with the following variables:

```env
# API Keys
DEEPSEEK_API_KEY=
PERPLEXITY_API_KEY=
TELEGRAM_BOT_TOKEN=

# Blockchain
RPC_URL=
SOLANA_PRIVATE_KEY=

# Privy
PRIVY_APP_ID=
PRIVY_APP_SECRET=
PRIVY_AUTHORIZATION_PRIVATE_KEY=

# Database
DATABASE_URL=
REDIS_URL=
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trumpit.git
cd trumpit
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations:
```bash
npx prisma migrate deploy
```

## Development

Start the development server:
```bash
pnpm dev
```

## Production

Build and start the production server:
```bash
pnpm build
pnpm start
```

## Docker Deployment

Build the Docker image:
```bash
docker build -t trumpit .
```

Run the container:
```bash
docker run -d \
  --name trumpit \
  --env-file .env \
  -p 8080:8080 \
  trumpit
```

## Bot Commands

- `/start` - Display welcome message and available commands
- Send any message to interact with the AI-powered bot

## Architecture

- **Framework**: Node.js with TypeScript
- **Bot Framework**: node-telegram-bot-api
- **AI Models**: DeepSeek 
- **Blockchain**: Solana (Web3.js, SPL Token)
- **DEX Integration**: Jupiter Exchange
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Wallet Management**: Privy
- **Transaction Processing**: Jito Bundles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.