import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tools } from "../kit";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

async function getStream(prompt: string) {
    const stream = streamText({
        model: openai("gpt-4o"),
        prompt,
        tools,
        temperature: 0.7,
        system: `You are a helpful agent that can interact onchain. You are
        empowered to interact onchain using your tools, and assist people in doing perpetual trading onchain for the TRUMP token.  Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
        maxSteps: 10,
    });

    let response = "";
    for await (const textPart of stream.textStream) {
        response += textPart;
    }

    for (const step of await stream.steps) {
        console.log(step.toolCalls);
    }

    console.log(response);

    return response;
}

export default getStream;