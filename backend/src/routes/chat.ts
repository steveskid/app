import { Router, Request, Response, NextFunction } from 'express';
import { chatRateLimiter } from '../middleware/rateLimit';
import { validateChatRequest } from '../middleware/validate';
import { getProvider } from '../providers';
import chatHistoryService from '../services/chatHistory';
import logger from '../utils/logger';
import { ChatMessage } from '../providers/base';

const router = Router();

router.post(
  '/',
  chatRateLimiter,
  validateChatRequest,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      messages,
      provider: providerName,
      model,
      temperature,
      maxTokens,
      systemPrompt,
      stream,
      sessionId,
    } = req.body as {
      messages: ChatMessage[];
      provider: string;
      model: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      stream?: boolean;
      sessionId?: string;
    };

    try {
      const provider = getProvider(providerName);

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = chatHistoryService.createSession(providerName, model);
        currentSessionId = session.id;
      }

      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMessage) {
        chatHistoryService.addMessage(currentSessionId, lastUserMessage);
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`);

        let fullContent = '';

        await provider.chatStream(
          { messages, model, temperature, maxTokens, systemPrompt, stream: true },
          (chunk) => {
            fullContent += chunk;
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          },
          () => {
            chatHistoryService.addMessage(currentSessionId!, {
              role: 'assistant',
              content: fullContent,
            });
            res.write(`data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`);
            res.end();
          },
          (error) => {
            logger.error(`Stream error: ${error.message}`);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
          },
        );
      } else {
        const response = await provider.chat({
          messages,
          model,
          temperature,
          maxTokens,
          systemPrompt,
        });

        chatHistoryService.addMessage(currentSessionId, {
          role: 'assistant',
          content: response.content,
        });

        res.json({
          ...response,
          sessionId: currentSessionId,
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default router;
