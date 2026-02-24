'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, payoutsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPayoutHistory({ limit: 10 }),
      ]);
      setStats(statsRes.data.data);
      setPayouts(payoutsRes.data.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (id: string) => {
    try {
      await adminAPI.approvePayout(id);
      loadDashboardData();
    } catch (error) {
      console.error('Error approving payout:', error);
    }
  };

  const handleRejectPayout = async (id: string) => {
    try {
      await adminAPI.rejectPayout(id, { reason: 'Rejected by admin' });
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting payout:', error);
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
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                subtitle={`${stats.users.traders} traders`}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Active Challenges"
                value={stats.challenges.active}
                subtitle={`${stats.challenges.passed} passed`}
                icon={Trophy}
                color="green"
              />
              <StatCard
                title="Funded Accounts"
                value={stats.fundedAccounts.active}
                subtitle={`${stats.fundedAccounts.total} total`}
                icon={DollarSign}
                color="purple"
              />
              <StatCard
                title="Total Revenue"
                value={`$${stats.financials.totalRevenue.toLocaleString()}`}
                subtitle={`Profit: $${stats.financials.profit.toLocaleString()}`}
                icon={TrendingUp}
                color={stats.financials.profit >= 0 ? 'green' : 'red'}
              />
            </div>

            {/* Challenge Stats */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Challenge Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-white">{stats.challenges.total}</p>
                  <p className="text-gray-400 text-sm">Total</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-green-400">{stats.challenges.passed}</p>
                  <p className="text-gray-400 text-sm">Passed</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-red-400">{stats.challenges.failed}</p>
                  <p className="text-gray-400 text-sm">Failed</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.challenges.passRate.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 text-sm">Pass Rate</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pending Payouts */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Payouts</h2>
          {payouts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No payouts found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-white">
                        {payout.user?.firstName} {payout.user?.lastName}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-medium">
                        ${payout.traderAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={payout.status} />
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right py-3 px-4">
                        {payout.status === 'PENDING' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprovePayout(payout.id)}
                              className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectPayout(payout.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  subtitle?: string;
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
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: any }> = {
    PENDING: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
    APPROVED: { color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
    PROCESSING: { color: 'bg-purple-500/20 text-purple-400', icon: AlertCircle },
    COMPLETED: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    REJECTED: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
}
