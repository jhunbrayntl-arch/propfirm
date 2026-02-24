'use client';

import { useEffect, useState } from 'react';
import { challengesAPI } from '@/lib/api';
import { Trophy, DollarSign, Target, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function ChallengesPage() {
  const [challengeTypes, setChallengeTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallengeTypes();
  }, []);

  const loadChallengeTypes = async () => {
    try {
      const res = await challengesAPI.getTypes();
      setChallengeTypes(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedType(res.data.data[0]);
        setSelectedSize(res.data.data[0].pricing[0]?.size || null);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
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

  const selectedPrice = selectedType?.pricing?.find(
    (p: any) => p.size === selectedSize
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Choose Your Challenge</h1>
          <p className="text-gray-400 mt-2">
            Select a challenge type and account size to start your journey
          </p>
        </div>

        {/* Challenge Type Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {challengeTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-xl border transition-all text-left ${
                selectedType?.type === type.type
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <h3 className="text-white font-bold">{type.name}</h3>
              <p className="text-gray-300 text-sm mt-1">{type.description}</p>
              <div className="mt-3 flex items-center text-sm">
                <Target className="w-4 h-4 mr-1 text-gray-400" />
                <span className={selectedType?.type === type.type ? 'text-white' : 'text-gray-400'}>
                  {type.profitTarget} Target
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedType && (
          <>
            {/* Account Size Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Select Account Size
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {selectedType.pricing.map((pricing: any) => (
                  <button
                    key={pricing.size}
                    onClick={() => setSelectedSize(pricing.size)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedSize === pricing.size
                        ? 'bg-green-600 border-green-500'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-white font-bold mt-2">
                      ${pricing.size.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      ${pricing.price.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rules */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Challenge Rules
                </h3>
                <div className="space-y-3">
                  <RuleItem
                    icon={Target}
                    label="Profit Target"
                    value={selectedType.profitTarget}
                  />
                  <RuleItem
                    icon={AlertCircle}
                    label="Max Daily Loss"
                    value={selectedType.maxDailyLoss}
                  />
                  <RuleItem
                    icon={AlertCircle}
                    label="Max Total Loss"
                    value={selectedType.maxTotalLoss}
                  />
                  <RuleItem
                    icon={Clock}
                    label="Min Trading Days"
                    value={selectedType.minTradingDays}
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="text-white font-medium mb-3">Features</h4>
                  <ul className="space-y-2">
                    {selectedType.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Ready to Start?
                </h3>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Account Size</span>
                    <span className="text-white font-bold">
                      ${selectedSize?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Challenge Type</span>
                    <span className="text-white font-bold">
                      {selectedType.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span className="text-gray-300">Total Price</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${selectedPrice?.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors">
                  Purchase Challenge
                </button>

                <p className="text-center text-gray-300 text-sm mt-4">
                  80% Profit Split • Unlimited Time • Instant Activation
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RuleItem({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div className="flex items-center">
        <Icon className="w-5 h-5 text-gray-400 mr-3" />
        <span className="text-gray-300">{label}</span>
      </div>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
