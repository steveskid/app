import { X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export function SettingsPanel() {
  const { settings, updateSettings, setSettingsOpen } = useChatStore();

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-white font-semibold">Settings</h2>
        <button
          onClick={() => setSettingsOpen(false)}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt
          </label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
            rows={5}
            className="w-full bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-blue-500 resize-vertical placeholder-gray-500"
            placeholder="Instructions for the AI assistant…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Temperature:{' '}
            <span className="text-blue-400 font-mono">{settings.temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Precise (0)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Tokens:{' '}
            <span className="text-blue-400 font-mono">{settings.maxTokens}</span>
          </label>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={settings.maxTokens}
            onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>256</span>
            <span>8192</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.streamingEnabled}
                onChange={(e) => updateSettings({ streamingEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-gray-300">
              Streaming responses
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-[52px]">
            Show AI response word-by-word as it generates
          </p>
        </div>
      </div>
    </div>
  );
}
