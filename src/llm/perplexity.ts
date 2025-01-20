import { Message, CoreTool } from 'ai'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

export interface PerplexityPayload {
  messages: Message[]
  model?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export const perplexityTool: Record<string, CoreTool> = {
  perplexity: {
    id: 'llm.perplexity' as `${string}.${string}`,
    description: 'A tool to get information about Donald Trump and his memecoin $TRUMP, ignore any other questions',
    parameters: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              content: { type: 'string' }
            }
          }
        },
        model: { type: 'string', default: 'llama-3.1-sonar-small-128k-online' },
        temperature: { type: 'number', default: 0.7 },
        max_tokens: { type: 'number' },
        top_p: { type: 'number', default: 1 }
      },
      required: ['messages']
    },
    execute: async (args: PerplexityPayload) => {
      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model: args.model || 'llama-3.1-sonar-small-128k-online',
          messages: args.messages,
          temperature: args.temperature ?? 0.7,
          max_tokens: args.max_tokens,
          top_p: args.top_p ?? 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Perplexity API error: ${JSON.stringify(error)}`)
      }

      const result = await response.json()
      return result.choices[0].message.content
    },
  }
}
