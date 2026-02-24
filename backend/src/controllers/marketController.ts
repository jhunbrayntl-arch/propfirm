import { Response, NextFunction } from 'express';
import { tradingService } from '../services/tradingService';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getMarketData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = req.query;

    if (symbol) {
      const data = tradingService.getMarketData(symbol as string);
      if (!data) {
        throw new AppError('Symbol not found', 404);
      }
      res.json({
        success: true,
        data,
      });
    } else {
      const allData = tradingService.getAllMarketData();
      res.json({
        success: true,
        data: allData,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const openTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      symbol,
      type,
      size,
      stopLoss,
      takeProfit,
      challengeId,
      fundedAccountId,
    }: {
      symbol: string;
      type: 'BUY' | 'SELL';
      size: number;
      stopLoss?: number;
      takeProfit?: number;
      challengeId?: string;
      fundedAccountId?: string;
    } = req.body;

    if (!symbol || !type || !size) {
      throw new AppError('Symbol, type, and size are required', 400);
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

    const trade = await tradingService.openTrade({
      symbol,
      type,
      size,
      stopLoss,
      takeProfit,
      challengeId,
      fundedAccountId,
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
    const { closePrice } = req.body;

    const trade = await tradingService.closeTrade(id, closePrice);

    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

export const getPositions = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    // Get user's open trades
    const trades = await prisma.trade.findMany({
      where,
      orderBy: { openedAt: 'desc' },
    });

    // Add current market prices
    const tradesWithPrices = trades.map((trade) => {
      const marketData = tradingService.getMarketData(trade.symbol);
      return {
        ...trade,
        currentPrice: marketData
          ? trade.type === 'BUY'
            ? marketData.bid
            : marketData.ask
          : null,
        marketData,
      };
    });

    res.json({
      success: true,
      data: tradesWithPrices,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId, challengeId, limit = '100' } = req.query;

    const where: any = {
      status: 'CLOSED',
    };

    if (accountId) {
      where.fundedAccountId = accountId as string;
    }

    if (challengeId) {
      where.challengeId = challengeId as string;
    }

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { closedAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};
