import { useChatStore } from '../store/chatStore';
import { useModels } from '../hooks/useModels';
import { ChevronDown, Loader2 } from 'lucide-react';

export function ModelSelector() {
  const { setSelectedProvider, setSelectedModel } = useChatStore();
  const { providers, loading, error, selectedProvider, selectedModel } = useModels();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm px-3 py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading models…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm px-3 py-2">
        Failed to load models
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-yellow-400 text-sm px-3 py-2">
        No providers configured
      </div>
    );
  }

  const currentProvider = providers.find((p) => p.provider === selectedProvider);
  const allModels = currentProvider?.models ?? [];

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="relative">
        <select
          value={selectedProvider}
          onChange={(e) => {
            const provider = e.target.value;
            setSelectedProvider(provider);
            const prov = providers.find((p) => p.provider === provider);
            if (prov?.models[0]) {
              setSelectedModel(prov.models[0].id);
            }
          }}
          className="appearance-none bg-gray-800 text-gray-200 text-sm rounded-lg pl-3 pr-8 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {providers.map((p) => (
            <option key={p.provider} value={p.provider}>
              {p.displayName}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="appearance-none bg-gray-800 text-gray-200 text-sm rounded-lg pl-3 pr-8 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {allModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
