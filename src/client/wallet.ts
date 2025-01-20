import { privy } from "./privy";
import { prisma } from "./prisma";
import { VersionedTransaction } from "@solana/web3.js";

export const createWallet = async (user_id: string) => {
    const wallet = await privy.walletApi.create({ chainType: "solana" })
    await prisma.user.create({
        data: {
            wallet_address: wallet.address,
            user_id: user_id,
            wallet_id: wallet.id
        }
    })

    return wallet;
}

export const signTransaction = async (user_id: string, transaction: VersionedTransaction) => {
    const wallet_id = await getWallet(user_id);
    const data =  await privy.walletApi.solana.signTransaction({
        wallet_id,
        transaction
    })
    const signedTransaction = data.signedTransaction;
    return signedTransaction;
}

export const sendTransaction = async (transaction: VersionedTransaction) => {
    // user jito bundle to send transaction
    
}


export const getWallet = async (user_id: string) => {
    const wallet = await prisma.user.findUnique({
        where: {
            user_id: user_id
        }
    })
    return wallet?.wallet_id;
}