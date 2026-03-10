import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import clsx from 'clsx';

export function Sidebar() {
  const {
    sessions,
    activeSessionId,
    selectedProvider,
    selectedModel,
    setActiveSession,
    createSession,
    deleteSession,
  } = useChatStore();

  const handleNewChat = () => {
    if (selectedProvider && selectedModel) {
      createSession(selectedProvider, selectedModel);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-3">
        <button
          onClick={handleNewChat}
          disabled={!selectedProvider || !selectedModel}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.length === 0 && (
          <p className="text-gray-500 text-xs px-2 py-4 text-center">
            No conversations yet
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={clsx(
              'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm',
              session.id === activeSessionId
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
            )}
            onClick={() => setActiveSession(session.id)}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{session.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-red-400 transition-all"
              aria-label="Delete session"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
