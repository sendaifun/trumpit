import { PrivyClient } from '@privy-io/server-auth';

console.log(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!, process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY!);

export const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!, {
  walletApi: {
    authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY!
  }
});