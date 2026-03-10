import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { sendMessage, streamMessage } from '../services/api';
import { ChatMessage } from '../types';

export function useChat() {
  const store = useChatStore();
  const abortRef = useRef<boolean>(false);

  const sendChat = useCallback(
    async (content: string) => {
      const {
        selectedProvider,
        selectedModel,
        settings,
        activeSessionId,
        createSession,
        addMessage,
        updateLastMessage,
      } = store;

      if (!selectedProvider || !selectedModel) {
        throw new Error('Please select a provider and model first');
      }

      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = createSession(selectedProvider, selectedModel);
        sessionId = session.id;
      }

      addMessage(sessionId, { role: 'user', content });

      const session = useChatStore
        .getState()
        .sessions.find((s) => s.id === sessionId);
      const history: Array<{ role: ChatMessage['role']; content: string }> =
        (session?.messages ?? [])
          .filter((m) => !m.isStreaming)
          .map((m) => ({ role: m.role, content: m.content }));

      const request = {
        messages: history,
        provider: selectedProvider,
        model: selectedModel,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        systemPrompt: settings.systemPrompt,
        stream: settings.streamingEnabled,
        sessionId,
      };

      if (settings.streamingEnabled) {
        addMessage(sessionId, {
          role: 'assistant',
          content: '',
          isStreaming: true,
        });

        abortRef.current = false;
        let accumulated = '';

        await streamMessage(
          request,
          (chunk) => {
            if (abortRef.current) return;
            accumulated += chunk;
            updateLastMessage(sessionId!, accumulated, false);
          },
          (_sid) => {
            updateLastMessage(sessionId!, accumulated, true);
          },
          (error) => {
            updateLastMessage(sessionId!, `Error: ${error.message}`, true);
          },
        );
      } else {
        const response = await sendMessage(request);
        addMessage(sessionId, {
          role: 'assistant',
          content: response.content,
        });
      }
    },
    [store],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { sendChat, stopStreaming };
}
