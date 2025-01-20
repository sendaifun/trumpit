import { UserWallet , Action } from "../../../types";
import { z } from "zod";
import { get_wallet_address } from "../../tools/agent/get_wallet_address";

const getWalletAddressAction: Action = {
  name: "GET_WALLET_ADDRESS",
  similes: ["wallet address", "address", "wallet"],
  description: "Get wallet address of the agent",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          address: "0x1234567890abcdef",
        },
        explanation: "The agent's wallet address is 0x1234567890abcdef",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (user_wallet: UserWallet) => ({
    status: "success",
    address: get_wallet_address(user_wallet),
  }),
};

export default getWalletAddressAction;
