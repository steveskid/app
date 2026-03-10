import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

export function validateChatRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: ValidationError[] = [];
  const { messages, provider, model } = req.body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    errors.push({ field: 'messages', message: 'messages must be a non-empty array' });
  } else {
    const validRoles = ['system', 'user', 'assistant'];
    (messages as unknown[]).forEach((msg, idx) => {
      if (typeof msg !== 'object' || msg === null) {
        errors.push({ field: `messages[${idx}]`, message: 'each message must be an object' });
        return;
      }
      const m = msg as Record<string, unknown>;
      if (!validRoles.includes(m.role as string)) {
        errors.push({
          field: `messages[${idx}].role`,
          message: `role must be one of: ${validRoles.join(', ')}`,
        });
      }
      if (typeof m.content !== 'string') {
        errors.push({ field: `messages[${idx}].content`, message: 'content must be a string' });
      }
    });
  }

  if (typeof provider !== 'string' || provider.trim() === '') {
    errors.push({ field: 'provider', message: 'provider must be a non-empty string' });
  }

  if (typeof model !== 'string' || model.trim() === '') {
    errors.push({ field: 'model', message: 'model must be a non-empty string' });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
}
