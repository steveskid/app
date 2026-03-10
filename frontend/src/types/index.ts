export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  supportsStreaming: boolean;
}

export interface ProviderModels {
  provider: string;
  displayName: string;
  models: ModelInfo[];
}

export interface ChatRequest {
  messages: Array<{ role: Role; content: string }>;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  sessionId?: string;
}

export interface AppSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
}
