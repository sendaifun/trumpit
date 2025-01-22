# Use the official Node.js image as a parent image
FROM node:20.10.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Python, build dependencies, and Linux headers
RUN apk add --no-cache python3 make g++ linux-headers libusb-dev eudev-dev \
    && ln -sf python3 /usr/bin/python

# Install pnpm globally
RUN npm install -g pnpm

# First copy only package files to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Define environment variables
ARG OPENAI_API_KEY
ARG RPC_URL
ARG SOLANA_PRIVATE_KEY
ARG PERPLEXITY_API_KEY
ARG PRIVY_APP_ID
ARG PRIVY_APP_SECRET
ARG PRIVY_AUTHORIZATION_PRIVATE_KEY
ARG DATABASE_URL
ARG TELEGRAM_BOT_TOKEN
ARG REDIS_URL
ARG DEEPSEEK_API_KEY

ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV RPC_URL=${RPC_URL}
ENV SOLANA_PRIVATE_KEY=${SOLANA_PRIVATE_KEY}
ENV PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
ENV PRIVY_APP_ID=${PRIVY_APP_ID}
ENV PRIVY_APP_SECRET=${PRIVY_APP_SECRET}
ENV PRIVY_AUTHORIZATION_PRIVATE_KEY=${PRIVY_AUTHORIZATION_PRIVATE_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
ENV REDIS_URL=${REDIS_URL}
ENV DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["pnpm", "start"]
