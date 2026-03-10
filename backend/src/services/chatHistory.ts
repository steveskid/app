import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../providers/base';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

class ChatHistoryService {
  private sessions: Map<string, ChatSession> = new Map();

  createSession(provider: string, model: string): ChatSession {
    const id = uuidv4();
    const session: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      provider,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  addMessage(sessionId: string, message: ChatMessage): ChatSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    session.messages.push(message);
    session.updatedAt = new Date();

    if (session.messages.length === 1 && message.role === 'user') {
      session.title =
        message.content.length > 50
          ? `${message.content.substring(0, 50)}...`
          : message.content;
    }

    return session;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  updateSession(id: string, updates: Partial<Pick<ChatSession, 'title' | 'model' | 'provider'>>): ChatSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    Object.assign(session, updates, { updatedAt: new Date() });
    return session;
  }
}

export const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;
