import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/chatStore';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendChat, stopStreaming } = useChat();
  const { selectedProvider, selectedModel, getActiveSession } = useChatStore();

  const session = getActiveSession();
  const isStreaming =
    session?.messages.some((m) => m.isStreaming) ?? false;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendChat(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const isDisabled = !selectedProvider || !selectedModel;

  return (
    <div className="border-t border-gray-700 p-4">
      {error && (
        <div className="mb-2 px-3 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={
              isDisabled
                ? 'Select a provider and model to start chatting…'
                : 'Message… (Shift+Enter for newline)'
            }
            disabled={isDisabled || isLoading}
            rows={1}
            className="w-full bg-gray-800 text-gray-100 rounded-xl px-4 py-3 pr-12 resize-none border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
          />
        </div>

        {isStreaming ? (
          <button
            onClick={stopStreaming}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
            aria-label="Stop streaming"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isDisabled || isLoading}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
