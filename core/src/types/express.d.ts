/**
 * Express Request 类型扩展
 */

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        phone?: string;
        email?: string;
        appRegion: string;
        isPro: boolean;
      };
      adminId?: string;
      admin?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

export {};

