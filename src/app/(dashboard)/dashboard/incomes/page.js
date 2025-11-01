"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, TrendingUp } from "lucide-react";
import { Trash2, Edit, FileDown } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { addIncome, deleteIncome, editIncome } from "@/services/incomeServices";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";

export default function IncomePage() {
  const { user, setUser } = useUser(); // Context se user le rahe hain
  const [incomes, setIncomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    icon: "💰",
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  // fiteration states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // main filtered incomes
  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch = income.source
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSource = selectedSource
      ? income.source === selectedSource
      : true;

    const matchesMonth = selectedMonth
      ? new Date(income.date).getMonth() === Number(selectedMonth)
      : true;

    return matchesSearch && matchesSource && matchesMonth;
  });

  // User ke incomes ko directly use karo
  useEffect(() => {
    if (user && user.incomes) {
      setIncomes(user.incomes);
    }
  }, [user]);

  //  Dynamic chart data (monthly total incomes)
  const getMonthlyIncomeData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // initialize monthly income
    const monthlyTotals = months.map((m) => ({ month: m, income: 0 }));

    incomes.forEach((inc) => {
      const monthIndex = new Date(inc.date).getMonth();
      monthlyTotals[monthIndex].income += inc.amount;
    });

    // filter months that have income > 0
    return monthlyTotals.filter((m) => m.income > 0);
  };

  // cal to get chart data
  const chartData = getMonthlyIncomeData();

  console.log("===============chartData=====================");
  console.log(chartData);
  console.log("===============chartData=====================");

  // Add Icome Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Icome
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const newIncome = {
        icon: formData.icon,
        source: formData.source,
        amount: Number(formData.amount),
        date: formData.date,
      };

      //  Backend ko request
      const res = await addIncome(token, newIncome);

      //  Success message
      toast.success("Income added successfully!");

      //  Local update bhi kar lo - new income ko add karo
      setUser(res.user);

      //  Form reset
      setFormData({
        icon: "💰",
        source: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error(error || "Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  //Edit Income
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return toast.error("No token found!");

    try {
      const res = await editIncome(token, selectedIncome._id, {
        icon: formData.icon,
        source: formData.source,
        amount: Number(formData.amount),
        date: formData.date,
      });

      toast.success("Income updated successfully!");
      setUser(res.user);
      setEditModalOpen(false);
      setSelectedIncome(null);
    } catch (error) {
      console.error("Error editing income:", error);
      toast.error(error || "Failed to edit income");
    } finally {
      setLoading(false);
    }
  };

  // Delete Income
  const handleDelete = async (incomeID) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("No token found!");

    try {
      setLoading(true);
      const res = await deleteIncome(token, incomeID);

      toast.success("Income deleted successfully!");

      //  Local state update
      setUser(res.user);
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error(error || "Failed to delete income");
    } finally {
      setLoading(false);
    }
  };

  // For Download
  const handleDownloadExcel = () => {
    if (incomes.length === 0) {
      toast.error("No income data to download!");
      return;
    }

    // Convert incomes array to sheet data
    const worksheet = XLSX.utils.json_to_sheet(
      incomes.map((income, index) => ({
        S_No: index + 1,
        Icon: income.icon,
        Source: income.source,
        Amount: income.amount,
        Date: new Date(income.date).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");

    // Convert workbook to blob and download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Income_List_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Total income calculate karo user ke incomes se
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Current Month Income Calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  console.log("=================currentMonth===================");
  console.log(currentMonth, currentYear);
  console.log("=================currentMonth===================");

  const currentMonthIncome = incomes
    .filter((income) => {
      const incomeDate = new Date(income.date);
      console.log("=================incomeDate===================");
      console.log(incomeDate);
      console.log("=================incomeDate===================");
      return (
        incomeDate.getMonth() === currentMonth &&
        incomeDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, income) => sum + income.amount, 0);

  // emojis options
  const emojiOptions = [
    "💰",
    "💼",
    "📈",
    "🎁",
    "🏠",
    "💳",
    "💸",
    "🤑",
    "💵",
    "💎",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-600">Manage your income sources</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Income
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">${totalIncome}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentMonthIncome}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Income Sources</p>
              <p className="text-2xl font-bold text-gray-900">
                {incomes.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Income Chart</h2>
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No income data available
            </div>
          )}
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">Income Sources</h2>

            {/* 🔍 Filter & Download Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incomes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 sm:w-60"
                />
              </div>

              {/* Source Filter */}
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                {[...new Set(incomes.map((i) => i.source))].map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              {/* 🟢 Download Excel Button */}
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all duration-200"
              >
                <FileDown className="h-5 w-5" />
                <span className="font-medium">Download Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🔽 Filtered Income List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading incomes...</p>
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No incomes found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncomes.map((income) => (
                <div
                  key={income._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{income.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {income.source}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(income.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-green-600">
                      +${income.amount.toLocaleString()}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedIncome(income);
                        setFormData({
                          icon: income.icon,
                          source: income.source,
                          amount: income.amount,
                          date: new Date(income.date)
                            .toISOString()
                            .split("T")[0],
                        });
                        setEditModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(income._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Income
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, icon: emoji }))
                      }
                      className={`p-2 rounded-lg border-2 text-2xl transition-all ${
                        formData.icon === emoji
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Income Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Salary, Freelance, etc."
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Income
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, icon: emoji }))
                      }
                      className={`p-2 rounded-lg border-2 text-2xl transition-all ${
                        formData.icon === emoji
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Income Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Salary, Freelance, etc."
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
