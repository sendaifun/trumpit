import { z } from "zod";
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

const getInfoAction = {
  name: "GET_INFO",
  similes: [
    "get information",
    "get info about TRUMP",
    "get info about $TRUMP",
    "get info about Donald Trump",
    "get info about $TRUMP",
  ],
  description:
    "Fetch information about Donald Trump and his memecoin $TRUMP, ignore any other questions",
  examples: [
    [
      {
        input: {
          query: "What is Donald Trump's net worth?",
        },
        output: {
          status: "success",
          message: "Donald Trump's net worth is $2.5 billion",
        },
        explanation: "Get information about Donald Trump and his memecoin $TRUMP",
      },
    ],
  ],
  schema: z.object({
    query: z
      .string()
      .describe("The query to get information about"),
  }),
  handler: async (input: Record<string, any>) => {
    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-small-128k-online',
              messages: [{ role: "user", content: input.query }],
              temperature: 0.7,
              max_tokens: 1000,
              top_p: 1,
            }),
          })
    
          if (!response.ok) {
            const error = await response.json()
            throw new Error(`Perplexity API error: ${JSON.stringify(error)}`)
          }
    
          const result = await response.json()
          return result.choices[0].message.content
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch information: ${error.message}`,
      };
    }
  },
};

export default getInfoAction;