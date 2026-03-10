import { useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { Bot } from 'lucide-react';

export function ChatWindow() {
  const { getActiveSession } = useChatStore();
  const session = getActiveSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
        <Bot className="w-16 h-16 text-gray-600" />
        <div className="text-center">
          <p className="text-xl font-medium text-gray-400">Welcome to LLM Chat</p>
          <p className="text-sm mt-1">Select a model and start a new conversation</p>
        </div>
      </div>
    );
  }

  if (session.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
        <Bot className="w-12 h-12 text-gray-600" />
        <p className="text-gray-400">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {session.messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
