import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateTradeBody {
  symbol: string;
  type: 'BUY' | 'SELL';
  size: number;
  openPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  challengeId?: string;
  fundedAccountId?: string;
}

interface CloseTradeBody {
  closePrice: number;
}

export const getTrades = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, challengeId, status } = req.query;

    const where: any = {};

    if (accountId) {
      where.fundedAccountId = accountId;
    }

    if (challengeId) {
      where.challengeId = challengeId;
    }

    if (status) {
      where.status = status;
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrade = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new AppError('Trade not found', 404);
    }

    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

export const createTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      symbol,
      type,
      size,
      openPrice,
      stopLoss,
      takeProfit,
      challengeId,
      fundedAccountId,
    }: CreateTradeBody = req.body;

    if (!symbol || !type || !size || !openPrice) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate ownership
    if (challengeId) {
      const challenge = await prisma.challenge.findFirst({
        where: { id: challengeId, userId: req.user!.id },
      });

      if (!challenge) {
        throw new AppError('Challenge not found', 404);
      }

      if (challenge.status !== 'ACTIVE') {
        throw new AppError('Challenge is not active', 400);
      }
    }

    if (fundedAccountId) {
      const account = await prisma.fundedAccount.findFirst({
        where: { id: fundedAccountId, userId: req.user!.id },
      });

      if (!account) {
        throw new AppError('Account not found', 404);
      }

      if (account.status !== 'ACTIVE') {
        throw new AppError('Account is not active', 400);
      }
    }

    const trade = await prisma.trade.create({
      data: {
        symbol,
        type,
        size,
        openPrice,
        stopLoss,
        takeProfit,
        challengeId,
        fundedAccountId,
        status: 'OPEN',
      },
    });

    res.status(201).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

export const closeTrade = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { closePrice }: CloseTradeBody = req.body;

    if (!closePrice) {
      throw new AppError('Close price required', 400);
    }

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new AppError('Trade not found', 404);
    }

    if (trade.status !== 'OPEN') {
      throw new AppError('Trade is not open', 400);
    }

    // Calculate PnL
    let pnl = 0;
    if (trade.type === 'BUY') {
      pnl = (closePrice - trade.openPrice) * trade.size * 100000; // Standard lot size
    } else {
      pnl = (trade.openPrice - closePrice) * trade.size * 100000;
    }

    // Update trade
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        closePrice,
        pnl,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Update challenge or account balance
    if (trade.challengeId) {
      const challenge = await prisma.challenge.findUnique({
        where: { id: trade.challengeId },
      });

      if (challenge) {
        const newProfit = challenge.currentProfit + pnl;
        const newDrawdown = newProfit < 0 ? Math.abs(newProfit) : 0;

        await prisma.challenge.update({
          where: { id: trade.challengeId },
          data: {
            currentProfit: newProfit,
            currentDrawdown: newDrawdown,
          },
        });
      }
    }

    if (trade.fundedAccountId) {
      const account = await prisma.fundedAccount.findUnique({
        where: { id: trade.fundedAccountId },
      });

      if (account) {
        const newBalance = account.currentBalance + pnl;
        const newPeakBalance = Math.max(account.peakBalance, newBalance);
        const newTotalProfit = account.totalProfit + pnl;

        await prisma.fundedAccount.update({
          where: { id: trade.fundedAccountId },
          data: {
            currentBalance: newBalance,
            peakBalance: newPeakBalance,
            totalProfit: newTotalProfit,
          },
        });
      }
    }

    res.json({
      success: true,
      data: updatedTrade,
    });
  } catch (error) {
    next(error);
  }
};

export const getOpenTrades = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, challengeId } = req.query;

    const where: any = {
      status: 'OPEN',
    };

    if (accountId) {
      where.fundedAccountId = accountId as string;
    }

    if (challengeId) {
      where.challengeId = challengeId as string;
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { openedAt: 'desc' },
    });

    res.json({
      success: true,
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};
