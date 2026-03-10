import { Ollama } from 'ollama';
import config from '../config';
import logger from '../utils/logger';
import {
  BaseLLMProvider,
  ChatRequest,
  ChatResponse,
  ModelInfo,
} from './base';

export class OllamaProvider extends BaseLLMProvider {
  readonly name = 'ollama';
  readonly displayName = 'Ollama (Local)';

  private client: Ollama;

  constructor() {
    super();
    this.client = new Ollama({ host: config.ollamaBaseUrl });
  }

  isConfigured(): boolean {
    return true;
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.list();
      return response.models.map((model) => ({
        id: model.name,
        name: model.name,
        provider: 'ollama',
        maxTokens: 4096,
        supportsStreaming: true,
      }));
    } catch (err) {
      logger.warn(`Ollama not reachable at ${config.ollamaBaseUrl}: ${String(err)}`);
      return [];
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (request.systemPrompt) {
      messages.unshift({ role: 'system', content: request.systemPrompt });
    }

    const response = await this.client.chat({
      model: request.model,
      messages,
      stream: false,
      options: {
        temperature: request.temperature ?? 0.7,
        num_predict: request.maxTokens,
      },
    });

    return {
      content: response.message.content,
      model: request.model,
    };
  }

  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      const messages = request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (request.systemPrompt) {
        messages.unshift({ role: 'system', content: request.systemPrompt });
      }

      const stream = await this.client.chat({
        model: request.model,
        messages,
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens,
        },
      });

      for await (const part of stream) {
        if (part.message.content) {
          onChunk(part.message.content);
        }
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

export default new OllamaProvider();
