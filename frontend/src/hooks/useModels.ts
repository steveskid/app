import { useState, useEffect } from 'react';
import { fetchModels } from '../services/api';
import { ProviderModels } from '../types';
import { useChatStore } from '../store/chatStore';

export function useModels() {
  const [providers, setProviders] = useState<ProviderModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedProvider, selectedModel, setSelectedProvider, setSelectedModel } =
    useChatStore();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchModels();
        if (!mounted) return;
        setProviders(data);

        if (!selectedProvider && data.length > 0) {
          const firstProvider = data[0];
          setSelectedProvider(firstProvider.provider);
          if (!selectedModel && firstProvider.models.length > 0) {
            setSelectedModel(firstProvider.models[0].id);
          }
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [selectedProvider, selectedModel, setSelectedProvider, setSelectedModel]);

  return { providers, loading, error, selectedProvider, selectedModel };
}
