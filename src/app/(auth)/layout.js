'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, TrendingUp, PieChart, Shield, Smartphone } from 'lucide-react';

export default function AuthLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  const features = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      text: "Smart Expense Tracking"
    },
    {
      icon: <PieChart className="h-5 w-5" />,
      text: "Visual Analytics"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Bank-level Security"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      text: "Mobile Friendly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    
      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Right Side - Enhanced Graphics */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500/10 to-purple-600/10 items-center justify-center p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative w-full max-w-2xl">
            {/* Main Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Take Control of Your Finances
                </h2>
                <p className="text-gray-600 text-lg">
                  Join thousands of users who transformed their financial lives
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">$10M+</div>
                  <div className="text-gray-600 text-sm">Tracked Monthly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8/5</div>
                  <div className="text-gray-600 text-sm">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                  Why Choose ExpenseTracker?
                </h3>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/50">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Financial Preview */}
              <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
                <div className="text-sm opacity-90 mb-2">Your Potential Savings</div>
                <div className="text-4xl font-bold mb-2">$430,000</div>
                <div className="text-sm opacity-80">Track your finances effortlessly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}