/**
 * Custom AI Provider
 *
 * Adapter for connecting to internal/private AI tools like LibertyGPT.
 * Supports any OpenAI-compatible API endpoint.
 *
 * CONFIGURATION:
 * Set these environment variables in Claude Desktop config:
 * - CUSTOM_AI_PROVIDER="true"
 * - CUSTOM_AI_URL="https://your-ai.internal/v1/chat/completions"
 * - CUSTOM_AI_KEY="your-api-key"
 * - CUSTOM_AI_NAME="LibertyGPT" (optional, for logging)
 * - CUSTOM_AI_MODEL="gpt-4" (optional, default model name)
 */

export interface CustomAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CustomAIResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CustomAIProvider {
  private apiUrl: string;
  private apiKey: string;
  private providerName: string;
  private defaultModel: string;

  constructor(config: {
    apiUrl: string;
    apiKey: string;
    providerName?: string;
    defaultModel?: string;
  }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.providerName = config.providerName || 'CustomAI';
    this.defaultModel = config.defaultModel || 'gpt-4';
  }

  /**
   * Generate a completion from the custom AI provider
   *
   * This method sends a request to your internal AI API using
   * the OpenAI-compatible format.
   */
  async generateCompletion(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<string> {
    const model = options.model || this.defaultModel;
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature ?? 0.7;

    const messages: CustomAIMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${this.providerName} API error (${response.status}): ${errorText}`
        );
      }

      const data: CustomAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(`${this.providerName} returned no choices`);
      }

      const content = data.choices[0].message.content;

      console.log(`[${this.providerName}] Generated ${content.length} characters`);
      if (data.usage) {
        console.log(
          `[${this.providerName}] Tokens: ${data.usage.prompt_tokens} prompt + ${data.usage.completion_tokens} completion = ${data.usage.total_tokens} total`
        );
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to generate completion from ${this.providerName}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Test the connection to the custom AI provider
   *
   * Sends a simple test prompt to verify the API is accessible
   * and working correctly.
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion('Say "Hello" if you can read this.', {
        maxTokens: 50,
      });

      console.log(`[${this.providerName}] Connection test successful`);
      console.log(`[${this.providerName}] Response: ${response.substring(0, 100)}...`);

      return true;
    } catch (error) {
      console.error(`[${this.providerName}] Connection test failed:`, error);
      return false;
    }
  }
}

/**
 * Create a CustomAIProvider from environment variables
 */
export function createCustomAIProviderFromEnv(): CustomAIProvider | null {
  const isEnabled = process.env.CUSTOM_AI_PROVIDER === 'true';

  if (!isEnabled) {
    return null;
  }

  const apiUrl = process.env.CUSTOM_AI_URL;
  const apiKey = process.env.CUSTOM_AI_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'CUSTOM_AI_URL and CUSTOM_AI_KEY must be set when CUSTOM_AI_PROVIDER is enabled'
    );
  }

  return new CustomAIProvider({
    apiUrl,
    apiKey,
    providerName: process.env.CUSTOM_AI_NAME || 'CustomAI',
    defaultModel: process.env.CUSTOM_AI_MODEL || 'gpt-4',
  });
}
