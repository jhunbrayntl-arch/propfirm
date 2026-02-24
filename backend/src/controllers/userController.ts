import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { role, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        challenges: {
          select: {
            id: true,
            status: true,
            challengeType: true,
            accountSize: true,
          },
        },
        fundedAccounts: {
          select: {
            id: true,
            status: true,
            accountSize: true,
            currentBalance: true,
          },
        },
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        settings: true,
        challenges: {
          orderBy: { createdAt: 'desc' },
        },
        fundedAccounts: {
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, phone, role },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Suspend all funded accounts
    await prisma.fundedAccount.updateMany({
      where: { userId: id },
      data: { status: 'SUSPENDED' },
    });

    // Suspend all active challenges
    await prisma.challenge.updateMany({
      where: { userId: id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    res.json({
      success: true,
      message: `User suspended. Reason: ${reason || 'Not specified'}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Total users
    const totalUsers = await prisma.user.count();
    const totalTraders = await prisma.user.count({ where: { role: 'TRADER' } });

    // Total challenges
    const totalChallenges = await prisma.challenge.count();
    const activeChallenges = await prisma.challenge.count({ where: { status: 'ACTIVE' } });
    const passedChallenges = await prisma.challenge.count({ where: { status: 'PASSED' } });
    const failedChallenges = await prisma.challenge.count({ where: { status: 'FAILED' } });

    // Total funded accounts
    const totalFundedAccounts = await prisma.fundedAccount.count();
    const activeFundedAccounts = await prisma.fundedAccount.count({ where: { status: 'ACTIVE' } });

    // Total payouts
    const totalPayouts = await prisma.payout.aggregate({
      _sum: { traderAmount: true },
      where: { status: 'COMPLETED' },
    });

    // Revenue (challenge purchases)
    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: 'CHALLENGE_PURCHASE',
        status: 'COMPLETED',
      },
    });

    const stats = {
      users: {
        total: totalUsers,
        traders: totalTraders,
      },
      challenges: {
        total: totalChallenges,
        active: activeChallenges,
        passed: passedChallenges,
        failed: failedChallenges,
        passRate: totalChallenges > 0 ? (passedChallenges / totalChallenges) * 100 : 0,
      },
      fundedAccounts: {
        total: totalFundedAccounts,
        active: activeFundedAccounts,
      },
      financials: {
        totalPayouts: totalPayouts._sum.traderAmount || 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        profit: (totalRevenue._sum.amount || 0) - (totalPayouts._sum.traderAmount || 0),
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
