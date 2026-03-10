import { create } from 'zustand';
import { ChatMessage, ChatSession, AppSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  selectedProvider: string;
  selectedModel: string;
  settings: AppSettings;
  isSettingsOpen: boolean;

  setActiveSession: (id: string | null) => void;
  createSession: (provider: string, model: string) => ChatSession;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateLastMessage: (sessionId: string, content: string, done?: boolean) => void;
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  getActiveSession: () => ChatSession | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  selectedProvider: '',
  selectedModel: '',
  settings: {
    systemPrompt: 'You are a helpful, accurate, and thoughtful AI assistant.',
    temperature: 0.7,
    maxTokens: 2048,
    streamingEnabled: true,
  },
  isSettingsOpen: false,

  setActiveSession: (id) => set({ activeSessionId: id }),

  createSession: (provider, model) => {
    const session: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      provider,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id,
    }));
    return session;
  },

  deleteSession: (id) =>
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== id);
      return {
        sessions: remaining,
        activeSessionId:
          state.activeSessionId === id
            ? (remaining[0]?.id ?? null)
            : state.activeSessionId,
      };
    }),

  addMessage: (sessionId, messageData) => {
    const message: ChatMessage = {
      ...messageData,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: new Date(),
              title:
                s.messages.length === 0 && messageData.role === 'user'
                  ? messageData.content.length > 50
                    ? `${messageData.content.substring(0, 50)}...`
                    : messageData.content
                  : s.title,
            }
          : s,
      ),
    }));
    return message;
  },

  updateLastMessage: (sessionId, content, done = false) =>
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const messages = [...s.messages];
        const last = messages[messages.length - 1];
        if (last && last.role === 'assistant') {
          messages[messages.length - 1] = {
            ...last,
            content,
            isStreaming: !done,
          };
        }
        return { ...s, messages };
      }),
    })),

  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  updateSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId);
  },
}));
