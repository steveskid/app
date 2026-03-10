import Groq from 'groq-sdk';
import config from '../config';
import {
  BaseLLMProvider,
  ChatRequest,
  ChatResponse,
  ModelInfo,
} from './base';

const MODELS: ModelInfo[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3 70B Versatile',
    provider: 'groq',
    maxTokens: 32768,
    supportsStreaming: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'LLaMA 3.1 8B Instant',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    maxTokens: 32768,
    supportsStreaming: true,
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B IT',
    provider: 'groq',
    maxTokens: 8192,
    supportsStreaming: true,
  },
];

export class GroqProvider extends BaseLLMProvider {
  readonly name = 'groq';
  readonly displayName = 'Groq';

  private client: Groq;

  constructor() {
    super();
    this.client = new Groq({ apiKey: config.groqApiKey });
  }

  isConfigured(): boolean {
    return (
      config.groqApiKey.length > 0 &&
      !config.groqApiKey.includes('your-groq-api-key')
    );
  }

  async listModels(): Promise<ModelInfo[]> {
    return MODELS;
  }

  private buildMessages(request: ChatRequest): Groq.Chat.ChatCompletionMessageParam[] {
    const msgs: Groq.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      msgs.push({ role: 'system', content: request.systemPrompt });
    }

    for (const msg of request.messages) {
      msgs.push({ role: msg.role, content: msg.content });
    }

    return msgs;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const completion = await this.client.chat.completions.create({
      model: request.model,
      messages: this.buildMessages(request),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: false,
    });

    const choice = completion.choices[0];
    return {
      content: choice.message.content ?? '',
      model: completion.model,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      const stream = await this.client.chat.completions.create({
        model: request.model,
        messages: this.buildMessages(request),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          onChunk(delta);
        }
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

export default new GroqProvider();
