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
import { sendJitoBundle } from "../../../client/jito";

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
        let tx: string;

        if (!mint) {
            // Transfer native SOL
            const transaction = new VersionedTransaction(
                new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: agent.wallet_address,
                        toPubkey: to,
                        lamports: amount * LAMPORTS_PER_SOL,
                    })
                ).compileMessage()
            );

            //   tx = await connection.sendTransaction(transaction, [agent.]);
            const signedTransaction = await signTransaction(agent.user_id, transaction);
            let { result } = await sendJitoBundle([signedTransaction as VersionedTransaction]);
            return result;
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

            const transaction = new VersionedTransaction(
                new Transaction().add(
                    createTransferInstruction(
                        fromAta,
                        toAta,
                        agent.wallet_address,
                        adjustedAmount,
                    ),
                ).compileMessage()
            );

            const signedTransaction = await signTransaction(agent.user_id, transaction);
            let {result} = await sendJitoBundle([signedTransaction as VersionedTransaction]);
            return result;
        }
    } catch (error: any) {
        throw new Error(`Transfer failed: ${error.message}`);
    }
}
