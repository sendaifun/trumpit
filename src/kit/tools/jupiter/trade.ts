import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import {
  TOKENS,
  DEFAULT_OPTIONS,
  JUP_API,
  JUP_REFERRAL_ADDRESS,
  connection,
} from "../../constants";
import { getMint } from "@solana/spl-token";
import { signTransaction } from "../../../client/wallet";
/**
 * Swap tokens using Jupiter Exchange
 * @param user_id User ID
 * @param wallet_address Wallet address
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in token decimals)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @returns Transaction signature
 */

export async function trade(
  user_id: string,
  wallet_address: PublicKey,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC
): Promise<string> {
  try {
    // Check if input token is native SOL
    const isNativeSol = inputMint.equals(TOKENS.SOL);

    // For native SOL, we use LAMPORTS_PER_SOL, otherwise fetch mint info
    const inputDecimals = isNativeSol
      ? 9 // SOL always has 9 decimals
      : (await getMint(connection, inputMint)).decimals;

    // Calculate the correct amount based on actual decimals
    const scaledAmount = inputAmount * Math.pow(10, inputDecimals);

    const quoteResponse = await (
      await fetch(
        `${JUP_API}/quote?` +
        `inputMint=${isNativeSol ? TOKENS.SOL.toString() : inputMint.toString()}` +
        `&outputMint=${outputMint.toString()}` +
        `&amount=${scaledAmount}` +
        `&dynamicSlippage=true` +
        `&minimizeSlippage=false` +
        `&onlyDirectRoutes=false` +
        `&maxAccounts=64` +
        `&swapMode=ExactIn` +
        `${DEFAULT_OPTIONS.RERERRAL_FEE ? `&platformFeeBps=${DEFAULT_OPTIONS.RERERRAL_FEE}` : ""}`,
      )
    ).json();

    // Get serialized transaction
    // let feeAccount;
    // if (JUPITER_REFERRAL_ACCOUNT) {
    //   [feeAccount] = PublicKey.findProgramAddressSync(
    //     [
    //       Buffer.from("referral_ata"),
    //       new PublicKey(JUPITER_REFERRAL_ACCOUNT).toBuffer(),
    //       TOKENS.SOL.toBuffer(),
    //     ],
    //     new PublicKey(JUP_REFERRAL_ADDRESS),
    //   );
    // }

    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet_address.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 10000000,
              global: false,
              priorityLevel: "veryHigh",
            },
          },
          // feeAccount: feeAccount ? feeAccount.toString() : null,
        }),
      })
    ).json();
    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    const signature = await signTransaction(user_id, transaction);
    // Sign and send transaction
    // transaction.sign([agent.wallet]);
    // const signature = await agent.connection.sendTransaction(transaction);

    return "signature";
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}
