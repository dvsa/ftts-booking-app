import { NextFunction, Request, Response } from 'express';

// Prevent search indexing
export class XRobotsTagFilter {
  public static filter(req: Request, res: Response, next: NextFunction): void {
    // Setting headers stops pages being indexed even if indexed pages link to them.
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  }
}
