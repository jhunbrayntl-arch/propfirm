'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Trophy,
  Globe,
  Zap,
  Shield,
  ArrowRight,
  Play,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Trade With{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Our Capital
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get funded up to $200,000 and keep 80% of the profits. 
              Prove your skills in our evaluation challenge and start trading like a professional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors flex items-center justify-center"
              >
                Start Challenge
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="$50M+" label="Capital Funded" />
            <StatItem value="10,000+" label="Traders Funded" />
            <StatItem value="80%" label="Profit Split" />
            <StatItem value="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose PropFirm?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide the capital, you keep the majority of the profits. 
              Simple, transparent, and trader-friendly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={DollarSign}
              title="High Profit Split"
              description="Keep up to 80% of your trading profits. Withdraw anytime with our fast payout system."
            />
            <FeatureCard
              icon={Trophy}
              title="Multiple Challenge Types"
              description="Choose from Evaluation, Verification, Express, or Direct Funding programs."
            />
            <FeatureCard
              icon={Globe}
              title="Trade Any Market"
              description="Access Forex, Indices, Commodities, and Cryptocurrencies on advanced platforms."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Activation"
              description="Get your challenge account activated immediately after purchase. Start trading right away."
            />
            <FeatureCard
              icon={Shield}
              title="No Slippage Issues"
              description="Trade with tight spreads and no requotes. Professional trading conditions guaranteed."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Scale Up Plan"
              description="Prove your skills and get up to $200,000 in funding. More capital as you succeed."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Three simple steps to start trading with our capital
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Choose Challenge"
              description="Select your challenge type and account size. From $5K to $200K funding."
            />
            <StepCard
              number="02"
              title="Pass Evaluation"
              description="Hit the profit target while respecting drawdown rules. Show us your skills."
            />
            <StepCard
              number="03"
              title="Get Funded"
              description="Receive your funded account and start trading. Withdraw profits anytime."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of traders who are already funded with PropFirm
            </p>
            <Link
              href="/register"
              className="inline-flex items-center bg-white text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-white font-bold text-xl">PropFirm</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 PropFirm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-white mb-2">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-xl">{number}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
