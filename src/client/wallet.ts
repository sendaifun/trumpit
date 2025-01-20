import { privy } from "./privy";

export const createWallet = async (user_id: string) => {
    const wallet = await privy.walletApi.create({chainType : "solana"})
    return wallet;
}