import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getSolanaTools } from "../kit";
import { PublicKey } from "@solana/web3.js";
import { get, set } from "../client/redis";
import { getWallet } from "../client/wallet";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

async function getStream(prompt: string, user_id: string) {

    const wallet = await getWallet(user_id);
    let user_wallet = wallet.wallet_address;
    const stream = streamText({
        model: openai("gpt-4o"),
        prompt,
        tools: getSolanaTools(user_id, new PublicKey(user_wallet!)),
        temperature: 0.7,
        system: `You are a helpful agent that can interact onchain. You are
        empowered to interact onchain using your tools, and assist people in doing perpetual trading onchain for the TRUMP token.  Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested, address of TRUMP token is 6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN`,
        maxSteps: 10,
    });

    let response = "";
    for await (const textPart of stream.textStream) {
        response += textPart;
    }

    for (const step of await stream.steps) {
        console.log(step.toolCalls);
    }

    return response;
}

export default getStream;