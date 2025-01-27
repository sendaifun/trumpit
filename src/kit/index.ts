import fetchPriceAction from "./acitons/jupiter/fetchPrice";
import tradeAction from "./acitons/jupiter/trade";
import getInfoAction from "./acitons/perplexity";
import getWalletAddressAction from "./acitons/agent/getWalletAddress";
import balanceAction from "./acitons/agent/balance";
import transferAction from "./acitons/agent/transfer";
import { tool, type CoreTool } from "ai";
import { PublicKey } from "@solana/web3.js";
import { UserWallet , Action } from "../types";

export async function executeAction(
    action: Action,
    agent: UserWallet,
    input: Record<string, any>,
  ): Promise<Record<string, any>> {
    try {
      // Validate input using Zod schema
      const validatedInput = action.schema.parse(input);
  
      // Execute the action with validated input
      const result = await action.handler(agent, validatedInput);
  
      return {
        status: "success",
        ...result,
      };
    } catch (error: any) {
      // Handle Zod validation errors specially
      if (error.errors) {
        return {
          status: "error",
          message: "Validation error",
          details: error.errors,
          code: "VALIDATION_ERROR",
        };
      }
  
      return {
        status: "error",
        message: error.message,
        code: error.code || "EXECUTION_ERROR",
      };
    }
  }
  

export function createSolanaTools(
    user_wallet: UserWallet,
): Record<string, CoreTool> {
    const tools: Record<string, CoreTool> = {};
    const needed_actions = [
        fetchPriceAction,
        tradeAction,
        getInfoAction,
        getWalletAddressAction,
        balanceAction,
        transferAction,
    ];

    for (const action of needed_actions) {
        tools[action.name] = tool({
            id: action.name as `${string}.${string}`,
            description: `
      ${action.description}

      Similes: ${action.similes.map(
                (simile) => `
        ${simile}
      `,
            )}
      `.slice(0, 1023),
            parameters: action.schema,
            execute: async (params) => {
                if (action.name === "GET_INFO") {
                    return await getInfoAction.handler(params);
                }
                return await executeAction(action, user_wallet, params);
            },
        });
    }

    return tools
}


export const getSolanaTools = (user_id: string, wallet_address: PublicKey) => {
    const user_wallet = {
        user_id: user_id,
        wallet_address: wallet_address,
    }
    return createSolanaTools(user_wallet);
}


