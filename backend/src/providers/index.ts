import { BaseLLMProvider, ModelInfo } from './base';
import openaiProvider from './openai';
import anthropicProvider from './anthropic';
import groqProvider from './groq';
import ollamaProvider from './ollama';

const ALL_PROVIDERS: BaseLLMProvider[] = [
  openaiProvider,
  anthropicProvider,
  groqProvider,
  ollamaProvider,
];

export function getConfiguredProviders(): BaseLLMProvider[] {
  return ALL_PROVIDERS.filter((p) => p.isConfigured());
}

export function getProvider(name: string): BaseLLMProvider {
  const provider = ALL_PROVIDERS.find((p) => p.name === name);
  if (!provider) {
    throw new Error(`Provider "${name}" not found`);
  }
  if (!provider.isConfigured()) {
    throw new Error(`Provider "${name}" is not configured`);
  }
  return provider;
}

export interface ProviderModels {
  provider: string;
  displayName: string;
  models: ModelInfo[];
}

export async function getAllModels(): Promise<ProviderModels[]> {
  const configured = getConfiguredProviders();
  const results = await Promise.all(
    configured.map(async (provider) => {
      const models = await provider.listModels();
      return {
        provider: provider.name,
        displayName: provider.displayName,
        models,
      };
    }),
  );
  return results.filter((r) => r.models.length > 0);
}

export { BaseLLMProvider };
export type { ModelInfo };
