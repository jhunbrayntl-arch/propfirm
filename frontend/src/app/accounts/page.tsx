'use client';

import { useEffect, useState } from 'react';
import { accountsAPI } from '@/lib/api';
import { Wallet, TrendingUp, DollarSign, Percent, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await accountsAPI.getAll();
      setAccounts(res.data.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Funded Accounts</h1>
            <p className="text-gray-400 mt-2">
              Manage your funded trading accounts
            </p>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="text-center py-16">
            <Wallet className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No Funded Accounts Yet
            </h2>
            <p className="text-gray-400 mb-6">
              Complete a challenge to get your funded account
            </p>
            <Link
              href="/challenges"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Browse Challenges
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account }: { account: any }) {
  const profitPercent =
    account.accountSize > 0
      ? (account.totalProfit / account.accountSize) * 100
      : 0;

  const availableForWithdrawal =
    account.totalProfit * account.profitSplit - account.totalWithdrawn;

  return (
    <Link href={`/accounts/${account.id}`}>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-white font-bold">
                ${account.accountSize.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">
                #{account.accountNumber || account.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <StatusBadge status={account.status} />
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <StatRow
            icon={DollarSign}
            label="Current Balance"
            value={`$${account.currentBalance?.toLocaleString() || account.accountSize.toLocaleString()}`}
          />
          <StatRow
            icon={TrendingUp}
            label="Total Profit"
            value={`${profitPercent >= 0 ? '+' : ''}$${account.totalProfit?.toLocaleString() || 0}`}
            valueColor={profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatRow
            icon={Percent}
            label="Profit Split"
            value={`${account.profitSplit * 100}%`}
          />
          <StatRow
            icon={ArrowUpRight}
            label="Available for Withdrawal"
            value={`$${Math.max(0, availableForWithdrawal).toLocaleString()}`}
            valueColor="text-green-400"
          />
        </div>

        {/* Progress Bar */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Performance</span>
            <span className="text-white font-medium">
              {profitPercent.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                profitPercent >= 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
              }`}
              style={{ width: `${Math.min(Math.abs(profitPercent), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    INACTIVE: 'bg-gray-500/20 text-gray-400',
    SUSPENDED: 'bg-yellow-500/20 text-yellow-400',
    TERMINATED: 'bg-red-500/20 text-red-400',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        statusColors[status] || 'bg-gray-500/20 text-gray-400'
      }`}
    >
      {status}
    </span>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  valueColor = 'text-white',
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className="w-4 h-4 text-gray-500 mr-2" />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <span className={`font-medium text-sm ${valueColor}`}>{value}</span>
    </div>
  );
}
