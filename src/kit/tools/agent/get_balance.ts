import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { UserWallet } from "../../../types";
import { connection } from "../../constants";

/**
 * Get the balance of SOL or an SPL token for the agent's wallet
 * @param agent - SolanaAgentKit instance
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or null if account doesn't exist
 */
export async function get_balance(
  user_wallet: UserWallet,
  token_address?: PublicKey,
): Promise<number> {
  if (!token_address) {
    return (
      (await connection.getBalance(new PublicKey(user_wallet.wallet_address))) /
      LAMPORTS_PER_SOL
    );
  }

  const token_account =
    await connection.getTokenAccountBalance(token_address);
  return token_account.value.uiAmount || 0;
}
