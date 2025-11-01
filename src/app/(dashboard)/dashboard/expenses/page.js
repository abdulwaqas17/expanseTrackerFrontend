"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, TrendingDown } from "lucide-react";
import { FileDown } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2, Edit } from "lucide-react";
import { useUser } from "@/context/userContext";
import {
  addExpense,
  deleteExpense,
  editExpense,
} from "@/services/expenseServices";
import toast from "react-hot-toast";

export default function ExpensesPage() {
  // Get user context
  const { user, setUser } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    icon: "🍔",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  // filteration states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // filteredExpenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? expense.category === selectedCategory
      : true;
    const matchesMonth = selectedMonth
      ? new Date(expense.date).getMonth() === Number(selectedMonth)
      : true;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // User ke expenses ko directly use karo
  useEffect(() => {
    if (user && user.expenses) {
      setExpenses(user.expenses);
    }
  }, [user]);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Current Month Income Calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpense = expenses
    .filter((expanse) => {
      const expanseDate = new Date(expanse.date);
      return (
        expanseDate.getMonth() === currentMonth &&
        expanseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, expanse) => sum + expanse.amount, 0);

  const emojiOptions = [
    "🍔",
    "🚗",
    "🏠",
    "💡",
    "🛍️",
    "🎮",
    "✈️",
    "🏥",
    "🎓",
    "💄",
  ];

  // Chart data ko dynamically generate karo
  const chartData = Object.entries(
    expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString("default", {
        month: "short",
      }); // e.g., "Jan"
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {})
  ).map(([month, expenses]) => ({ month, expenses }));

  // Agar koi expense nahi to ek default entry dikhado
  if (chartData.length === 0) {
    chartData.push({ month: "No Data", expenses: 0 });
  }

  // Handle Change in Expense
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      // ✅ API call
      const response = await addExpense(token, formData);

      // ✅ Success message
      toast.success("Expense added successfully!");

      setExpenses([...response.user.expenses]);

      // reset form and close modal
      setFormData({
        icon: "🍔",
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error(err || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  // Delete Expense
  const handleDelete = async (expenseID) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("No token found!");

    try {
      setLoading(true);
      const res = await deleteExpense(token, expenseID);

      toast.success("Expense deleted successfully!");

      // ✅ Local state update
      setExpenses([...res.user.expenses]);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error || "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  // handleEditClick
  const handleEditClick = (expense) => {
    setEditFormData({
      icon: expense.icon,
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setSelectedExpenseId(expense._id);
    setIsEditModalOpen(true);
  };

  // handleEditChange
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Edit Income
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExpenseId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("User not authenticated");

      const res = await editExpense(token, selectedExpenseId, editFormData);
      toast.success("Expense updated successfully!");

      setExpenses([...res.user.expenses]);
      setUser(res.user);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error editing expense:", error);
      toast.error(error || "Failed to edit expense");
    } finally {
      setLoading(false);
    }
  };

  // handleDownloadExcel
  const handleDownloadExcel = () => {
    if (expenses.length === 0) {
      toast.error("No income data to download!");
      return;
    }

    // Convert expenses array to sheet data
    const worksheet = XLSX.utils.json_to_sheet(
      expenses.map((expense, index) => ({
        S_No: index + 1,
        Icon: expense.icon,
        Category: expense.category,
        Amount: expense.amount,
        Date: new Date(expense.date).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "expenses");

    // Convert workbook to blob and download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Expense_List_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Manage your expenses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Total Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${currentMonthExpense}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expense Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
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
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Expenses Overview
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">
              Expense Categories
            </h2>

            {/* 🔍 Filter & Download Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-48 sm:w-60"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Categories</option>
                {[...new Set(expenses.map((e) => e.category))].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-red-500"
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

              {/* 🟢 Modern Download Excel Button */}
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

        {/* 🔽 Filtered Expense List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No expenses found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{expense.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {expense.category}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-red-600">
                      -${expense.amount.toLocaleString()}
                    </p>

                    <button
                      onClick={() => handleEditClick(expense)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(expense._id)}
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

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Expense
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expense Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Food, Rent, Transportation"
                  required
                />
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="100"
                  min="1"
                  step="1"
                  required
                />
              </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal Here */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          {" "}
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            {" "}
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Expense
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
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
                        setEditFormData((prev) => ({ ...prev, icon: emoji }))
                      }
                      className={`p-2 rounded-lg border-2 text-2xl transition-all ${
                        editFormData.icon === emoji
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expense Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

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
                  value={editFormData.amount}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

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
                  value={editFormData.date}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
