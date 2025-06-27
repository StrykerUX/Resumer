import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

export const checkCredits = (requiredCredits: number = 1) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.credits < requiredCredits) {
        return res.status(402).json({
          error: 'Insufficient credits',
          message: `This operation requires ${requiredCredits} credit(s), but you have ${user.credits}`,
          currentCredits: user.credits,
          requiredCredits
        });
      }

      next();
    } catch (error) {
      console.error('Credit check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const deductCredits = async (userId: string, amount: number = 1): Promise<number> => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount
        }
      },
      select: { credits: true }
    });

    return user.credits;
  } catch (error) {
    console.error('Credit deduction error:', error);
    throw new Error('Failed to deduct credits');
  }
};