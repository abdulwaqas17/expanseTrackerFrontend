"use client";
import { useState, useEffect } from "react";
import {
  Edit,
  LogOut,
  User,
  Mail,
  Calendar,
  Image,
  Save,
  X,
} from "lucide-react";
// import { updateUserProfile } from '@/services/userServices';
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { updateUserProfile } from "@/services/userServices";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  // User data ko form mein set karo
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      // 👇 Create FormData to send file + fields
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);

      // Agar profile image file select hui hai
      if (formData.profileImage instanceof File) {
        fd.append("profileImage", formData.profileImage);
      } else if (formData.profileImage) {
        // Agar URL diya gaya hai
        fd.append("profileImage", formData.profileImage);
      }

      const response = await updateUserProfile(token, fd);

      setUser(response.user); // backend se updated user milega
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // handleLogout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  // handleImageUpload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file); // preview banaya
      setFormData((prev) => ({
        ...prev,
        profileImage: file, // file backend ke liye
        previewImage: previewUrl, // frontend preview ke liye
      }));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Edit className="h-5 w-5" />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-32 h-32 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">
                  Total Income
                </p>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  $
                  {user.incomes
                    ?.reduce((sum, income) => sum + income.amount, 0)
                    .toLocaleString() || "0"}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  Total Expenses
                </p>
                <p className="text-xl font-bold text-red-700 mt-1">
                  $
                  {user.expenses
                    ?.reduce((sum, expense) => sum + expense.amount, 0)
                    .toLocaleString() || "0"}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-600 font-medium">Balance</p>
                <p className="text-xl font-bold text-green-700 mt-1">
                  $
                  {(
                    (user.incomes?.reduce(
                      (sum, income) => sum + income.amount,
                      0
                    ) || 0) -
                    (user.expenses?.reduce(
                      (sum, expense) => sum + expense.amount,
                      0
                    ) || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Income Sources</span>
              <span className="font-semibold text-gray-900">
                {user.incomes?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Expense Categories</span>
              <span className="font-semibold text-gray-900">
                {user.expenses?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">
                {(user.incomes?.length || 0) + (user.expenses?.length || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Edit Profile</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-red-600" />
                <span className="text-gray-700">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {formData.previewImage ? (
                      <img
                        src={formData.previewImage}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : formData.profileImage &&
                      typeof formData.profileImage === "string" ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      formData.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profileImageUpload"
                    />
                    <label
                      htmlFor="profileImageUpload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Image className="h-4 w-4" />
                      Upload Image
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Profile Image URL
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  id="profileImage"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div> */}

              {/* Buttons */}
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
