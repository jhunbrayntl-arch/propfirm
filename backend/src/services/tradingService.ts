import { prisma } from '../index';

// Simulated market data for common forex pairs and instruments
const DEFAULT_SPREADS: Record<string, number> = {
  EURUSD: 0.0001,
  GBPUSD: 0.0002,
  USDJPY: 0.01,
  AUDUSD: 0.0002,
  USDCAD: 0.0002,
  USDCHF: 0.0002,
  XAUUSD: 0.5, // Gold
  XAGUSD: 0.05, // Silver
  US30: 2.0, // Dow Jones
  SPX500: 0.5, // S&P 500
  NAS100: 1.0, // NASDAQ
  BTCUSD: 50, // Bitcoin
  ETHUSD: 5, // Ethereum
};

const BASE_PRICES: Record<string, number> = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  USDJPY: 149.50,
  AUDUSD: 0.6550,
  USDCAD: 1.3550,
  USDCHF: 0.8850,
  XAUUSD: 2030.00,
  XAGUSD: 23.00,
  US30: 38500.00,
  SPX500: 4950.00,
  NAS100: 17200.00,
  BTCUSD: 52000.00,
  ETHUSD: 2800.00,
};

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: Date;
}

export class TradingService {
  private marketData: Map<string, MarketData> = new Map();

  constructor() {
    this.initializeMarketData();
    this.startPriceUpdates();
  }

  private initializeMarketData() {
    Object.entries(BASE_PRICES).forEach(([symbol, price]) => {
      const spread = DEFAULT_SPREADS[symbol] || price * 0.0001;
      this.marketData.set(symbol, {
        symbol,
        bid: price - spread / 2,
        ask: price + spread / 2,
        spread,
        timestamp: new Date(),
      });
    });
  }

  private startPriceUpdates() {
    // Update prices every second with random movement
    setInterval(() => {
      this.marketData.forEach((data, symbol) => {
        const volatility = this.getVolatility(symbol);
        const movement = (Math.random() - 0.5) * volatility;

        const midPrice = (data.bid + data.ask) / 2 + movement;

        this.marketData.set(symbol, {
          symbol,
          bid: midPrice - data.spread / 2,
          ask: midPrice + data.spread / 2,
          spread: data.spread,
          timestamp: new Date(),
        });
      });

      // Sync to database periodically
      this.syncMarketDataToDb();
    }, 1000);
  }

  private getVolatility(symbol: string): number {
    const volatilities: Record<string, number> = {
      EURUSD: 0.0005,
      GBPUSD: 0.0008,
      USDJPY: 0.08,
      XAUUSD: 0.5,
      BTCUSD: 50,
      ETHUSD: 5,
      NAS100: 5,
      SPX500: 2,
      US30: 10,
    };
    return volatilities[symbol] || 0.001;
  }

  private async syncMarketDataToDb() {
    try {
      const updates = Array.from(this.marketData.values()).map((data) =>
        prisma.marketData.upsert({
          where: { symbol: data.symbol },
          update: {
            bid: data.bid,
            ask: data.ask,
            spread: data.spread,
            updatedAt: data.timestamp,
          },
          create: {
            symbol: data.symbol,
            bid: data.bid,
            ask: data.ask,
            spread: data.spread,
          },
        })
      );
      await Promise.all(updates);
    } catch (error) {
      // Silently fail - DB might not be available
    }
  }

  getMarketData(symbol: string): MarketData | null {
    return this.marketData.get(symbol) || null;
  }

  getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }

  calculatePnL(
    type: 'BUY' | 'SELL',
    size: number,
    openPrice: number,
    closePrice: number
  ): number {
    const multiplier = size * 100000; // Standard lot size

    if (type === 'BUY') {
      return (closePrice - openPrice) * multiplier;
    } else {
      return (openPrice - closePrice) * multiplier;
    }
  }

  async openTrade(data: {
    symbol: string;
    type: 'BUY' | 'SELL';
    size: number;
    stopLoss?: number;
    takeProfit?: number;
    challengeId?: string;
    fundedAccountId?: string;
  }) {
    const marketData = this.getMarketData(data.symbol);
    if (!marketData) {
      throw new Error(`Market data not available for ${data.symbol}`);
    }

    const openPrice = data.type === 'BUY' ? marketData.ask : marketData.bid;

    const trade = await prisma.trade.create({
      data: {
        symbol: data.symbol,
        type: data.type,
        size: data.size,
        openPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        challengeId: data.challengeId,
        fundedAccountId: data.fundedAccountId,
        status: 'OPEN',
        pnl: 0,
      },
    });

    return trade;
  }

  async closeTrade(tradeId: string, closePrice?: number) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'OPEN') {
      throw new Error('Trade is not open');
    }

    const price =
      closePrice ||
      (trade.type === 'BUY'
        ? this.getMarketData(trade.symbol)?.bid
        : this.getMarketData(trade.symbol)?.ask);

    if (!price) {
      throw new Error('Market data not available');
    }

    const pnl = this.calculatePnL(trade.type, trade.size, trade.openPrice, price);

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        closePrice: price,
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

    return updatedTrade;
  }

  async updateOpenTrades() {
    const openTrades = await prisma.trade.findMany({
      where: { status: 'OPEN' },
    });

    for (const trade of openTrades) {
      const marketData = this.getMarketData(trade.symbol);
      if (!marketData) continue;

      const currentPrice = trade.type === 'BUY' ? marketData.bid : marketData.ask;
      const currentPnL = this.calculatePnL(
        trade.type,
        trade.size,
        trade.openPrice,
        currentPrice
      );

      // Update unrealized PnL
      await prisma.trade.update({
        where: { id: trade.id },
        data: { pnl: currentPnL },
      });

      // Check stop loss and take profit
      if (trade.stopLoss && currentPnL <= -(trade.openPrice - trade.stopLoss) * trade.size * 100000) {
        await this.closeTrade(trade.id);
      }

      if (trade.takeProfit && currentPnL >= (trade.takeProfit - trade.openPrice) * trade.size * 100000) {
        await this.closeTrade(trade.id);
      }
    }
  }
}

// Export singleton instance
export const tradingService = new TradingService();

// Auto-update open trades every 5 seconds
setInterval(() => {
  tradingService.updateOpenTrades();
}, 5000);
