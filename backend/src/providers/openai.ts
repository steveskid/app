import OpenAI from 'openai';
import config from '../config';
import {
  BaseLLMProvider,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ModelInfo,
} from './base';

const MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 4096, supportsStreaming: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', maxTokens: 16384, supportsStreaming: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', maxTokens: 4096, supportsStreaming: true },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, supportsStreaming: true },
];

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  readonly displayName = 'OpenAI';

  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseUrl,
    });
  }

  isConfigured(): boolean {
    return (
      config.openaiApiKey.length > 0 &&
      !config.openaiApiKey.includes('your-openai-api-key')
    );
  }

  async listModels(): Promise<ModelInfo[]> {
    return MODELS;
  }

  private buildMessages(request: ChatRequest): OpenAI.Chat.ChatCompletionMessageParam[] {
    const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = [];

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

export default new OpenAIProvider();
