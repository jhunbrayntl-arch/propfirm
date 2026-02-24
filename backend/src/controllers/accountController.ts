import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getFundedAccounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.fundedAccount.findMany({
      where: { userId: req.user!.id },
      include: {
        trades: {
          orderBy: { openedAt: 'desc' },
          take: 20,
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getFundedAccount = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const account = await prisma.fundedAccount.findFirst({
      where: { id, userId: req.user.id },
      include: {
        trades: {
          orderBy: { openedAt: 'desc' },
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const account = await prisma.fundedAccount.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Calculate statistics
    const totalTrades = await prisma.trade.count({
      where: { fundedAccountId: id },
    });

    const winningTrades = await prisma.trade.count({
      where: { fundedAccountId: id, pnl: { gt: 0 } },
    });

    const losingTrades = await prisma.trade.count({
      where: { fundedAccountId: id, pnl: { lt: 0 } },
    });

    const totalPnl = await prisma.trade.aggregate({
      where: { fundedAccountId: id, status: 'CLOSED' },
      _sum: { pnl: true },
    });

    const stats = {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalPnl: totalPnl._sum.pnl || 0,
      currentBalance: account.currentBalance,
      peakBalance: account.peakBalance,
      totalProfit: account.totalProfit,
      totalWithdrawn: account.totalWithdrawn,
      profitSplit: account.profitSplit,
      availableForWithdrawal: account.totalProfit * account.profitSplit - account.totalWithdrawn,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const account = await prisma.fundedAccount.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    if (account.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 400);
    }

    const availableForWithdrawal = account.totalProfit * account.profitSplit - account.totalWithdrawn;

    if (amount > availableForWithdrawal) {
      throw new AppError('Insufficient funds for withdrawal', 400);
    }

    if (amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    const payout = await prisma.payout.create({
      data: {
        fundedAccountId: id,
        userId: req.user.id,
        amount,
        profitSplit: account.profitSplit,
        traderAmount: amount,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountRules = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const account = await prisma.fundedAccount.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    const rules = {
      maxDailyLoss: account.maxDailyLoss,
      maxDailyLossAmount: account.accountSize * (account.maxDailyLoss / 100),
      maxTotalLoss: account.maxTotalLoss,
      maxTotalLossAmount: account.accountSize * (account.maxTotalLoss / 100),
      profitSplit: `${account.profitSplit * 100}%`,
      minProfitDays: account.minProfitDays,
      currentDrawdown: account.currentBalance < account.peakBalance
        ? ((account.peakBalance - account.currentBalance) / account.peakBalance) * 100
        : 0,
      remainingDailyLoss: (account.accountSize * (account.maxDailyLoss / 100)) - 
        Math.max(0, account.peakBalance - account.currentBalance),
    };

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};
