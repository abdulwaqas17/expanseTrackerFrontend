"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useUser } from "@/context/userContext";
import { fetchUserById } from "@/services/userServices";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); //  Local loading
  const pathname = usePathname();
  const { user, setUser } = useUser(); //  Context se user le rahe hain

  const router = useRouter();

  // Fetch user data on layout mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("login")
          toast.error("Kindly Login First");
          return
        };

        const response = await fetchUserById(token);
        console.log("Fetched User Data:", response);

        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Clear user context
    setUser(null);

    // Redirect to login page
    router.push("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Income", href: "/dashboard/incomes", icon: TrendingUp },
    { name: "Expenses", href: "/dashboard/expenses", icon: TrendingDown },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <div className="flex flex-col w-80 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            {/* User Info */}
            <div className="px-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user ? user.name?.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user ? user.name : "Loading..."}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {user ? user.email : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Here */}
            <nav className="px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}

              {/* Logout */}
              <button onClick={handleLogout} className="group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-lg font-semibold text-gray-800">
                {loading
                  ? "Fetching user..."
                  : user
                  ? `Welcome, ${user.name}`
                  : "Dashboard"}
              </h1>
            </div>
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user ? user.name?.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
