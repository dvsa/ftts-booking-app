import express from 'express';

export const warmupRouter = express.Router();

warmupRouter.get(['/'], (_req: express.Request, res: express.Response): void => {
  res.status(200).end();
});
