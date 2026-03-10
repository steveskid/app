export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  supportsStreaming: boolean;
}

export abstract class BaseLLMProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;

  abstract isConfigured(): boolean;
  abstract listModels(): Promise<ModelInfo[]>;
  abstract chat(request: ChatRequest): Promise<ChatResponse>;
  abstract chatStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): Promise<void>;
}
