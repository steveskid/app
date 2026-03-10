import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage } from '../types';
import { User, Bot } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={clsx(
        'flex gap-3 max-w-4xl',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      <div
        className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-600' : 'bg-gray-600',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div
        className={clsx(
          'rounded-2xl px-4 py-3 max-w-[80%]',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-100 rounded-tl-sm',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...rest }) {
                  const match = /language-(\w+)/.exec(className ?? '');
                  const isBlock = Boolean(match);
                  return isBlock ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match?.[1] ?? 'text'}
                      PreTag="div"
                      className="rounded-lg !my-2 text-sm"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-gray-700 rounded px-1 py-0.5 text-xs font-mono"
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1 align-text-bottom rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
