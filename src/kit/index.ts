import { SolanaAgentKit, executeAction } from "solana-agent-kit"
import fetchPriceAction from "./acitons/jupiter/fetchPrice";
import tradeAction from "./acitons/jupiter/trade";
import getInfoAction from "./acitons/perplexity";
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
        fetchPriceAction,
        tradeAction,
        getInfoAction,
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
                return await executeAction(action, solanaAgentKit, params);
            },
        });
    }

    return tools
}


const tools = createSolanaTools(kit);


export { kit, tools };