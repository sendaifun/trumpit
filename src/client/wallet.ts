import { privy } from "./privy";
import { prisma } from "./prisma";
import { VersionedTransaction } from "@solana/web3.js";
import { get, set } from "./redis";

export const createWallet = async (user_id: string) => {
    const wallet = await privy.walletApi.create({ chainType: "solana" })
    await prisma.user.create({
        data: {
            wallet_address: wallet.address,
            id: user_id,
            wallet_id: wallet.id
        }
    })

    await set(user_id, JSON.stringify({
        wallet_address: wallet.address,
        wallet_id: wallet.id
    }));

    return wallet;
}

export const signTransaction = async (user_id: string, transaction: VersionedTransaction) => {
    const wallet = await getWallet(user_id);
    const data =  await privy.walletApi.solana.signTransaction({
        walletId: wallet.wallet_id,
        transaction
    })
    const signedTransaction = data.signedTransaction;
    return signedTransaction;
}

export const sendTransaction = async (transaction: VersionedTransaction) => {
    // user jito bundle to send transaction
    
}


export const getWallet = async (user_id: string) => {
    const user_wallet = await get(user_id);
    if (user_wallet) {
        return JSON.parse(user_wallet);
    }
    const wallet = await prisma.user.findUnique({
        where: {
            id: user_id
        }
    })
    if (!wallet) {
        const wallet = await createWallet(user_id);
        return {
            wallet_address: wallet.address.toString(),
            wallet_id: wallet.id
        };
    }
    return {
        wallet_address: wallet.wallet_address,
        wallet_id: wallet.wallet_id
    };
}
