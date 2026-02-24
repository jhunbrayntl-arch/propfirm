import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateChallengeBody {
  challengeType: string;
  accountSize: number;
  currency?: string;
  price: number;
  profitTarget?: number;
  maxDailyLoss?: number;
  maxTotalLoss?: number;
  minTradingDays?: number;
  maxLeverage?: number;
  allowedInstruments?: string[];
  newsTradingAllowed?: boolean;
  weekendHoldingAllowed?: boolean;
  eaTradingAllowed?: boolean;
}

// Default challenge configurations (like FundedNext)
const CHALLENGE_CONFIGS: Record<string, any> = {
  EVALUATION: {
    profitTarget: 10,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 5,
    maxLeverage: 100,
    allowedInstruments: ['FOREX', 'METALS', 'INDICES', 'CRYPTO'],
    newsTradingAllowed: true,
    weekendHoldingAllowed: true,
    eaTradingAllowed: true,
  },
  VERIFICATION: {
    profitTarget: 5,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 3,
    maxLeverage: 100,
    allowedInstruments: ['FOREX', 'METALS', 'INDICES', 'CRYPTO'],
    newsTradingAllowed: true,
    weekendHoldingAllowed: true,
    eaTradingAllowed: true,
  },
  EXPRESS: {
    profitTarget: 8,
    maxDailyLoss: 4,
    maxTotalLoss: 8,
    minTradingDays: 0,
    maxLeverage: 100,
    allowedInstruments: ['FOREX', 'METALS', 'INDICES'],
    newsTradingAllowed: false,
    weekendHoldingAllowed: false,
    eaTradingAllowed: true,
  },
  DIRECT_FUNDING: {
    profitTarget: 0,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    minTradingDays: 0,
    maxLeverage: 100,
    allowedInstruments: ['FOREX', 'METALS', 'INDICES', 'CRYPTO'],
    newsTradingAllowed: true,
    weekendHoldingAllowed: true,
    eaTradingAllowed: true,
  },
};

export const getChallenges = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        violations: true,
      },
    });

    res.json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallenge = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findFirst({
      where: { id, userId: req.user.id },
      include: {
        violations: true,
        trades: {
          orderBy: { openedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

export const createChallenge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      challengeType,
      accountSize,
      currency = 'USD',
      price,
      ...customRules
    }: CreateChallengeBody = req.body;

    if (!challengeType || !accountSize || !price) {
      throw new AppError('Missing required fields', 400);
    }

    // Get default config for challenge type
    const defaultConfig = CHALLENGE_CONFIGS[challengeType] || CHALLENGE_CONFIGS.EVALUATION;

    // Merge with custom rules
    const challengeData = {
      ...defaultConfig,
      ...customRules,
    };

    const challenge = await prisma.challenge.create({
      data: {
        userId: req.user!.id,
        challengeType: challengeType as any,
        accountSize,
        currency,
        price,
        startingBalance: accountSize,
        peakBalance: accountSize,
        ...challengeData,
      },
    });

    res.status(201).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallengeTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pricing tiers (like FundedNext)
    const accountSizes = [5000, 10000, 25000, 50000, 100000, 200000];

    const challengeTypes = [
      {
        type: 'EVALUATION',
        name: 'Evaluation Phase',
        description: 'First phase - Prove your trading skills',
        profitTarget: '10%',
        maxDailyLoss: '5%',
        maxTotalLoss: '10%',
        minTradingDays: 5,
        pricing: accountSizes.map(size => ({
          size,
          price: size * 0.02, // 2% of account size
        })),
        features: [
          'Unlimited time',
          'Minimum 5 trading days',
          '80% profit split',
          'All instruments allowed',
        ],
      },
      {
        type: 'VERIFICATION',
        name: 'Verification Phase',
        description: 'Second phase - Confirm your consistency',
        profitTarget: '5%',
        maxDailyLoss: '5%',
        maxTotalLoss: '10%',
        minTradingDays: 3,
        pricing: accountSizes.map(size => ({
          size,
          price: size * 0.015, // 1.5% of account size
        })),
        features: [
          'Unlimited time',
          'Minimum 3 trading days',
          '80% profit split',
          'All instruments allowed',
        ],
      },
      {
        type: 'EXPRESS',
        name: 'Express Challenge',
        description: 'Fast track to funded status',
        profitTarget: '8%',
        maxDailyLoss: '4%',
        maxTotalLoss: '8%',
        minTradingDays: 0,
        pricing: accountSizes.map(size => ({
          size,
          price: size * 0.025, // 2.5% of account size
        })),
        features: [
          'No minimum trading days',
          'No weekend holding',
          '80% profit split',
          'Major instruments only',
        ],
      },
      {
        type: 'DIRECT_FUNDING',
        name: 'Direct Funding',
        description: 'Skip evaluation - Get funded immediately',
        profitTarget: '0%',
        maxDailyLoss: '5%',
        maxTotalLoss: '10%',
        minTradingDays: 0,
        pricing: accountSizes.map(size => ({
          size,
          price: size * 0.08, // 8% of account size
        })),
        features: [
          'Instant funded account',
          'No profit target',
          '80% profit split',
          'All instruments allowed',
        ],
      },
    ];

    res.json({
      success: true,
      data: challengeTypes,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallengeProgress = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    // Calculate progress
    const profitProgress = (challenge.currentProfit / (challenge.accountSize * challenge.profitTarget / 100)) * 100;
    const drawdownProgress = (challenge.currentDrawdown / (challenge.accountSize * challenge.maxDailyLoss / 100)) * 100;

    const progress = {
      profitProgress: Math.min(profitProgress, 100),
      drawdownProgress: Math.min(drawdownProgress, 100),
      tradingDaysProgress: challenge.minTradingDays > 0
        ? (challenge.tradingDays / challenge.minTradingDays) * 100
        : 100,
      isProfitTargetMet: challenge.currentProfit >= challenge.accountSize * challenge.profitTarget / 100,
      isMinTradingDaysMet: challenge.tradingDays >= challenge.minTradingDays,
      isFailed: challenge.currentDrawdown > challenge.accountSize * challenge.maxDailyLoss / 100 ||
                challenge.currentProfit < -(challenge.accountSize * challenge.maxTotalLoss / 100),
    };

    res.json({
      success: true,
      data: {
        challenge,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};
