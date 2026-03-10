import { ChatRequest, ProviderModels } from '../types';

const API_BASE = '/api';

export async function fetchModels(): Promise<ProviderModels[]> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.statusText}`);
  }
  const data = (await res.json()) as { providers: ProviderModels[] };
  return data.providers;
}

export async function sendMessage(request: ChatRequest): Promise<{
  content: string;
  model: string;
  sessionId: string;
}> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: false }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error: string;
    };
    throw new Error(err.error || 'Request failed');
  }

  return res.json() as Promise<{ content: string; model: string; sessionId: string }>;
}

export async function streamMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone: (sessionId: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
        error: string;
      };
      throw new Error(err.error || 'Request failed');
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let sessionId = request.sessionId ?? '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (!json) continue;

        try {
          const parsed = JSON.parse(json) as {
            chunk?: string;
            done?: boolean;
            sessionId?: string;
            error?: string;
          };

          if (parsed.sessionId) sessionId = parsed.sessionId;
          if (parsed.chunk) onChunk(parsed.chunk);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.done) {
            onDone(sessionId);
            return;
          }
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message !== json) {
            throw parseErr;
          }
        }
      }
    }

    onDone(sessionId);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function fetchHistory(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = (await res.json()) as { sessions: unknown[] };
  return data.sessions;
}

export async function deleteHistorySession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/history/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete session');
}
