import Anthropic from '@anthropic-ai/sdk';
import config from '../config';
import {
  BaseLLMProvider,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ModelInfo,
} from './base';

const MODELS: ModelInfo[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    maxTokens: 8192,
    supportsStreaming: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    maxTokens: 8192,
    supportsStreaming: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsStreaming: true,
  },
];

export class AnthropicProvider extends BaseLLMProvider {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic';

  private client: Anthropic;

  constructor() {
    super();
    this.client = new Anthropic({ apiKey: config.anthropicApiKey });
  }

  isConfigured(): boolean {
    return (
      config.anthropicApiKey.length > 0 &&
      !config.anthropicApiKey.includes('your-anthropic-api-key')
    );
  }

  async listModels(): Promise<ModelInfo[]> {
    return MODELS;
  }

  private buildMessages(
    messages: ChatMessage[],
  ): Anthropic.MessageParam[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const systemContent =
      request.systemPrompt ??
      request.messages.find((m) => m.role === 'system')?.content;

    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 1024,
      system: systemContent,
      messages: this.buildMessages(request.messages),
      temperature: request.temperature ?? 0.7,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const content = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      const systemContent =
        request.systemPrompt ??
        request.messages.find((m) => m.role === 'system')?.content;

      const stream = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens ?? 1024,
        system: systemContent,
        messages: this.buildMessages(request.messages),
        temperature: request.temperature ?? 0.7,
        stream: true,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          onChunk(event.delta.text);
        }
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

export default new AnthropicProvider();
