'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { challengesAPI, accountsAPI } from '@/lib/api';
import {
  TrendingUp,
  DollarSign,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [challengesRes, accountsRes] = await Promise.all([
        challengesAPI.getAll(),
        accountsAPI.getAll(),
      ]);
      setChallenges(challengesRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeChallenges = challenges.filter((c) => c.status === 'ACTIVE');
  const passedChallenges = challenges.filter((c) => c.status === 'PASSED');
  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE');

  const totalAccountSize = accounts.reduce(
    (sum, acc) => sum + acc.accountSize,
    0
  );
  const totalProfit = accounts.reduce(
    (sum, acc) => sum + acc.totalProfit,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-400 mt-2">
            Track your trading performance and challenges
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Challenges"
            value={activeChallenges.length}
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Funded Accounts"
            value={activeAccounts.length}
            icon={Trophy}
            color="green"
          />
          <StatCard
            title="Total Account Size"
            value={`$${totalAccountSize.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Total Profit"
            value={`$${totalProfit.toLocaleString()}`}
            icon={TrendingUp}
            color={totalProfit >= 0 ? 'green' : 'red'}
          />
        </div>

        {/* Active Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Active Challenges</h2>
              <Link
                href="/challenges"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All →
              </Link>
            </div>
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No active challenges</p>
                <Link
                  href="/challenges"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Start a challenge →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </div>

          {/* Funded Accounts */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Funded Accounts</h2>
              <Link
                href="/accounts"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All →
              </Link>
            </div>
            {activeAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No funded accounts yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Complete a challenge to get funded
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAccounts.slice(0, 3).map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/challenges"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <Trophy className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white font-medium">Start Challenge</p>
              <p className="text-gray-300 text-sm">Begin your evaluation</p>
            </Link>
            <Link
              href="/accounts"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <Wallet className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white font-medium">View Accounts</p>
              <p className="text-gray-300 text-sm">Manage funded accounts</p>
            </Link>
            <Link
              href="/settings"
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
            >
              <Settings className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white font-medium">Settings</p>
              <p className="text-gray-300 text-sm">Account preferences</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const progress =
    (challenge.currentProfit /
      (challenge.accountSize * (challenge.profitTarget / 100))) *
    100;

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">
              ${challenge.accountSize.toLocaleString()} {challenge.challengeType}
            </p>
            <p className="text-gray-400 text-sm">
              Target: {challenge.profitTarget}% | Days: {challenge.tradingDays}/{challenge.minTradingDays}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              progress >= 100
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function AccountCard({ account }: { account: any }) {
  return (
    <Link href={`/accounts/${account.id}`}>
      <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              ${account.accountSize.toLocaleString()} Funded
            </p>
            <p className="text-gray-400 text-sm">
              Balance: ${account.currentBalance?.toLocaleString() || account.accountSize.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`font-medium ${
                account.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {account.totalProfit >= 0 ? '+' : ''}${account.totalProfit?.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">
              Split: {account.profitSplit * 100}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

import { Wallet, Settings } from 'lucide-react';
