import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getPayouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payouts = await prisma.payout.findMany({
      where: { userId: req.user!.id },
      include: {
        fundedAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const payout = await prisma.payout.findFirst({
      where: { id, userId: req.user.id },
      include: {
        fundedAccount: true,
      },
    });

    if (!payout) {
      throw new AppError('Payout not found', 404);
    }

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayoutRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fundedAccountId, amount } = req.body;

    if (!fundedAccountId || !amount) {
      throw new AppError('Account ID and amount required', 400);
    }

    const account = await prisma.fundedAccount.findFirst({
      where: { id: fundedAccountId, userId: req.user!.id },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Calculate available for withdrawal
    const availableForWithdrawal = 
      (account.totalProfit * account.profitSplit) - account.totalWithdrawn;

    if (amount > availableForWithdrawal) {
      throw new AppError(
        `Insufficient funds. Available: $${availableForWithdrawal.toFixed(2)}`,
        400
      );
    }

    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    const payout = await prisma.payout.create({
      data: {
        fundedAccountId,
        userId: req.user!.id,
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

// Admin functions
export const approvePayout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const payout = await prisma.payout.findUnique({
      include: {
        fundedAccount: true,
      },
      where: { id },
    });

    if (!payout) {
      throw new AppError('Payout not found', 404);
    }

    if (payout.status !== 'PENDING') {
      throw new AppError('Payout is not pending', 400);
    }

    // Update payout status
    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
      },
      include: {
        fundedAccount: true,
      },
    });

    // Update account withdrawn amount
    await prisma.fundedAccount.update({
      where: { id: payout.fundedAccountId },
      data: {
        totalWithdrawn: {
          increment: payout.traderAmount,
        },
      },
    });

    // Here you would integrate with Stripe/PayPal to actually send the money
    // For now, we'll just mark it as completed
    await prisma.payout.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });

    res.json({
      success: true,
      data: updatedPayout,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPayout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Payout rejected by admin',
      },
    });

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayoutHistory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        fundedAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};
