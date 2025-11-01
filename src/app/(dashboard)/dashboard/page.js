'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/userContext';
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign, Calendar, Sparkles, X, Lightbulb, Target, TrendingUpIcon, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAISuggestions } from '@/services/userServices';

export default function OverviewPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState(null);
const [loadingAI, setLoadingAI] = useState(false);


  // User data se incomes aur expenses nikalna
  const incomes = user?.incomes || [];
  const expenses = user?.expenses || [];

  // Calculations
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Recent transactions (incomes + expenses mixed)
  const recentTransactions = [
    ...incomes.map(income => ({
      ...income,
      type: 'income',
      color: '#10B981'
    })),
    ...expenses.map(expense => ({
      ...expense,
      type: 'expense',
      color: '#EF4444'
    }))
  ]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5);

    // Recent transactions (incomes + expenses mixed)
  const recentTransactionsAi = [
    ...incomes.map(income => ({
      ...income
    })),
    ...expenses.map(expense => ({
      ...expense
   
    }))
  ]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 5);
  

  // Generate Monthly Data Dynamically
  const getMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthly = months.map((m) => ({
      month: m,
      income: 0,
      expenses: 0,
    }));

    incomes.forEach((inc) => {
      const month = new Date(inc.date).getMonth();
      monthly[month].income += inc.amount;
    });

    expenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      monthly[month].expenses += exp.amount;
    });

    return monthly;
  };

  // Result of getMonthlyData
  const monthlyData = getMonthlyData();

  // Expense distribution for pie chart
  const expenseDistribution = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount, icon: expense.icon });
    }
    return acc;
  }, []);

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#06B6D4', '#8B5CF6'];

  // AI Suggestions Data
  // const aiSuggestions = {
  //   balanceTips: [
  //     "Create an emergency fund with 3-6 months of expenses",
  //     "Consider investing 20% of your monthly income",
  //     "Set up automatic transfers to savings account",
  //     "Review and reduce unnecessary subscription services"
  //   ],
  //   expenseManagement: [
  //     "Your dining expenses seem high - try meal prepping",
  //     "Transportation costs can be optimized with carpooling",
  //     "Entertainment expenses have increased by 15% this month",
  //     "Consider negotiating better rates on utility bills"
  //   ],
  //   incomeOptimization: [
  //     "Explore freelance opportunities in your field",
  //     "Consider asking for a performance-based raise",
  //     "Look into passive income streams like investments",
  //     "Your side hustle potential is untapped - start small"
  //   ],
  //   quickWins: [
  //     "Cancel unused subscriptions - potential savings: $45/month",
  //     "Switch to energy-efficient appliances - save 15% on utilities",
  //     "Use cashback apps for regular purchases",
  //     "Bundle insurance policies for better rates"
  //   ]
  // };

  // handleGetAISuggestions 
  const handleGetAISuggestions = async () => {
  try {
    setLoadingAI(true);
    const token = localStorage.getItem("token"); // ya context se lo agar token stored hai

    const financialData = {
      totalBalance,
      totalIncome,
      totalExpense: totalExpenses,
      transactions: recentTransactionsAi,
    };

    const res = await getAISuggestions(token, financialData);
    if (res.success) {
      setAISuggestions(res.suggestions);
      setIsAIModalOpen(true);
    } else {
      alert("AI Suggestion Error: " + res.message);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to get AI suggestions");
  } finally {
    setLoadingAI(false);
  }
};


  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your financial summary.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {/* AI Suggestions Button */}
     <button
  onClick={handleGetAISuggestions}
  disabled={loadingAI}
  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-70"
>
  <Sparkles className="h-4 w-4" />
  {loadingAI ? "Getting AI Tips..." : "Get AI Suggestions"}
</button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Balance</p>
              <p className="text-3xl font-bold mt-2">${totalBalance.toLocaleString()}</p>
              <p className="text-sm opacity-80 mt-1">Available Funds</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-xl text-blue-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${totalIncome.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                -8.2% from last month
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Income vs Expenses</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Expense Distribution</h2>
          <div className="h-80">
            {expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions and Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            </div>
          </div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={transaction._id || index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {transaction.type === 'income' ? transaction.source : transaction.category}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <p className="font-semibold">
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No transactions yet.</p>
                <p className="text-sm text-gray-500 mt-1">Start adding income and expenses to see them here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="space-y-6">
          {/* Recent Income */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Income</h3>
            <div className="space-y-3">
              {incomes.slice(0, 3).map((income, index) => (
                <div key={income._id || index} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{income.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{income.source}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(income.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">+${income.amount.toLocaleString()}</span>
                </div>
              ))}
              {incomes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-2">No income yet</p>
              )}
              {incomes.length > 3 && (
                <Link href="/dashboard/income" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Income
                </Link>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
            <div className="space-y-3">
              {expenses.slice(0, 3).map((expense, index) => (
                <div key={expense._id || index} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{expense.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{expense.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">-${expense.amount.toLocaleString()}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-2">No expenses yet</p>
              )}
              {expenses.length > 3 && (
                <Link href="/dashboard/expenses" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Expenses
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6" />
                  <div>
                    <h2 className="text-2xl font-bold">AI Financial Assistant</h2>
                    <p className="text-purple-100">Personalized suggestions based on your financial data</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Balance Improvement */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Balance Improvement</h3>
                  </div>
                  <ul className="space-y-3">
                    {aiSuggestions.balanceTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expense Management */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Expense Management</h3>
                  </div>
                  <ul className="space-y-3">
                    {aiSuggestions.expenseManagement.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Income Optimization */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUpIcon className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Income Optimization</h3>
                  </div>
                  <ul className="space-y-3">
                    {aiSuggestions.incomeOptimization.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Wins */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Quick Wins</h3>
                  </div>
                  <ul className="space-y-3">
                    {aiSuggestions.quickWins.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Your Financial Snapshot</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Income</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">${totalBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Current Balance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  💡 These suggestions are based on your current financial patterns
                </p>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}