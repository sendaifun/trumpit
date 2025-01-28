import { UserWallet } from "../../../types";
import { PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    getMint,
} from "@solana/spl-token";
import { connection } from "../../constants";
import { signTransaction } from "../../../client/wallet";
import { getBundleTransactionLink, getRandomTipAccount, sendJitoBundle } from "../../../client/jito";
import { TransactionMessage } from "@solana/web3.js";

/**
 * Transfer SOL or SPL tokens to a recipient
 * @param agent SolanaAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to transfer
 * @param mint Optional mint address for SPL tokens
 * @returns Transaction signature
 */
export async function transfer(
    agent: UserWallet,
    to: PublicKey,
    amount: number,
    mint?: PublicKey,
): Promise<string> {
    try {

        if (!mint) {

            const message = new TransactionMessage({
                payerKey: agent.wallet_address,
                recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
                instructions: [
                    SystemProgram.transfer({
                        fromPubkey: agent.wallet_address,
                        toPubkey: to,
                        lamports: amount * LAMPORTS_PER_SOL,
                    }),
                    SystemProgram.transfer({
                        fromPubkey: agent.wallet_address,
                        toPubkey: getRandomTipAccount(),
                        lamports: 0.0001 * LAMPORTS_PER_SOL,
                    }),
                ],
            }).compileToV0Message();

            const transaction = new VersionedTransaction(message);

            const simulate = await connection.simulateTransaction(transaction);
            const isError = simulate.value.err != null;
            if (isError) {
                throw new Error("Transaction failed: " + simulate.value.err);
            }

            const signedTransaction = await signTransaction(agent.user_id, transaction);
            let result  = await sendJitoBundle([signedTransaction as VersionedTransaction]);
            let tx = await getBundleTransactionLink(result.result);
            return tx!;
        } else {
            // Transfer SPL token
            const fromAta = await getAssociatedTokenAddress(
                mint,
                agent.wallet_address,
            );
            const toAta = await getAssociatedTokenAddress(mint, to);

            // Get mint info to determine decimals
            const mintInfo = await getMint(connection, mint);
            const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

            const message = new TransactionMessage({
                payerKey: agent.wallet_address,
                recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
                instructions: [
                    createTransferInstruction(fromAta, toAta, agent.wallet_address, adjustedAmount),
                    SystemProgram.transfer({
                        fromPubkey: agent.wallet_address,
                        toPubkey: getRandomTipAccount(),
                        lamports: 0.0001 * LAMPORTS_PER_SOL,
                    }),
                ],
            }).compileToV0Message();

            const transaction = new VersionedTransaction(message);

            const simulate = await connection.simulateTransaction(transaction);
            const isError = simulate.value.err != null;
            if (isError) {
                throw new Error("Transaction failed: " + simulate.value.err);
            }


            const signedTransaction = await signTransaction(agent.user_id, transaction);



  

            let result = await sendJitoBundle([signedTransaction as VersionedTransaction]);
            let tx = await getBundleTransactionLink(result.result);
            return tx!;
        }
    } catch (error: any) {
        console.log(error);
        throw new Error(`Transfer failed: ${error.message}`);
    }
}
