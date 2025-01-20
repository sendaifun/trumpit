import { SolanaAgentKit, executeAction, ACTIONS } from "solana-agent-kit"
import { perplexityTool } from "../llm/perplexity";
import { tool, type CoreTool } from "ai";

const kit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.SOLANA_RPC_URL!,
    {
    }
);

export function createSolanaTools(
    solanaAgentKit: SolanaAgentKit,
): Record<string, CoreTool> {
    const tools: Record<string, CoreTool> = {};
    const needed_actions = [
        ACTIONS.TRADE_ACTION,
        ACTIONS.BALANCE_ACTION,
        ACTIONS.WALLET_ADDRESS_ACTION,
        ACTIONS.TOKEN_BALANCES_ACTION,
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
            execute: async (params) =>
                await executeAction(action, solanaAgentKit, params),
        });
    }

    return tools
}


const tools = createSolanaTools(kit);


export { kit, tools };