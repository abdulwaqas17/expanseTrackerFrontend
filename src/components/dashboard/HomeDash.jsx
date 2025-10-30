'use client';
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PlusCircle } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { addExpense } from "@/services/expenseServices";
import { useParams } from "next/navigation";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function HomeDash() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState({
    icon: "",
    category: "",
    amount: "",
    date: "",
  });

  const {id} = useParams()
  const token = localStorage.getItem("token");

  const handleAddExpense = async () => {
    if (!expense.icon || !expense.category || !expense.amount || !expense.date) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await addExpense(id, token, expense);
      toast.success("Expense added successfully!");
      setExpense({ icon: "", category: "", amount: "", date: "" });
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dummy data for dashboard (your existing data)
  const data = {
    summary: { totalIncome: 12500, totalExpenses: 8450, totalBalance: 4050 },
    chartData: [
      { name: 'Jan', income: 4000, expenses: 2400 },
      { name: 'Feb', income: 3000, expenses: 1398 },
      { name: 'Mar', income: 2000, expenses: 9800 },
      { name: 'Apr', income: 2780, expenses: 3908 },
      { name: 'May', income: 1890, expenses: 4800 },
      { name: 'Jun', income: 2390, expenses: 3800 },
    ],
    expenseData: [
      { category: 'Food', amount: 1200 },
      { category: 'Transport', amount: 800 },
      { category: 'Entertainment', amount: 450 },
      { category: 'Utilities', amount: 300 },
      { category: 'Shopping', amount: 900 },
    ]
  };

  const { summary, chartData, expenseData } = data;

  return (
    <div className="p-6 space-y-6 relative">
    

      {/* Add Expense Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center gap-2"
        >
          <PlusCircle size={20} /> Add Expense
        </button>
      </div>

      {/* Existing Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" amount={summary.totalIncome} change={12.5} trend="up" icon={TrendingUp} />
        <StatCard title="Total Expenses" amount={summary.totalExpenses} change={-8.2} trend="down" icon={TrendingDown} />
        <StatCard title="Total Balance" amount={summary.totalBalance} change={5.3} trend="up" icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" outerRadius={80} dataKey="amount">
                  {expenseData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter emoji (💡, 🍔, 🚗...)"
                value={expense.icon}
                onChange={(e) => setExpense({ ...expense, icon: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="text"
                placeholder="Category"
                value={expense.category}
                onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="number"
                placeholder="Amount"
                value={expense.amount}
                onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <input
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({ ...expense, date: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable StatCard
const StatCard = ({ title, amount, change, trend, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">${amount.toLocaleString()}</p>
        <p className={`text-sm mt-1 flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          {Math.abs(change)}% from last month
        </p>
      </div>
      <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
        <Icon className={`h-6 w-6 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
      </div>
    </div>
  </div>
);
