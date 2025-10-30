import api from "@/libs/api";

// FETCH USER
export const fetchUserById = async (token) => {
  try {
    const response = await api.get("/get-user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('================response fetch user====================');
    console.log(response);
    console.log('================response fetch user====================');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error in fetching user";
  }
};


// ✅ UPDATE USER PROFILE FUNCTION
export const updateUserProfile = async (token, formData) => {
  try {
    const response = await api.put("/edit-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

        console.log('================response edit user====================');
    console.log(response);
    console.log('================response edit user====================');

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Profile update failed";
  }
};
