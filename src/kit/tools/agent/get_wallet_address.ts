import { UserWallet } from "../../../types";

/**
 * Get the agents wallet address
 * @param agent - SolanaAgentKit instance
 * @returns string
 */
export function get_wallet_address(user_wallet: UserWallet) {
    return user_wallet.wallet_address;
}