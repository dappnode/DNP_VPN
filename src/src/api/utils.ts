import express from "express";

export class HttpError extends Error {
  code: number;
  constructor(message?: string, code?: number) {
    super(message);
    this.code = code || 500;
  }
}

/**
 * Wrap express routes to be able to safely throw errors and return JSON
 * @param handler
 */
export function wrapHandler(
  handler: express.RequestHandler
): express.RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (e) {
      const error = { message: (e as Error).message, data: (e as Error).stack };
      if (e instanceof HttpError) {
        res.status(e.code).send({ error });
      } else {
        res.status(500).send({ error });
      }
    }
  };
}
