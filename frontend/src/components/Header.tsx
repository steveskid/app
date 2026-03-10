import { MessageSquare, Settings } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export function Header() {
  const { setSettingsOpen, isSettingsOpen } = useChatStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-blue-400" />
        <span className="text-white font-semibold text-lg">LLM Chat</span>
      </div>
      <button
        onClick={() => setSettingsOpen(!isSettingsOpen)}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}
