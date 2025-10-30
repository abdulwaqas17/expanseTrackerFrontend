import api from "../libs/api";


// REGISTER USER FUNCTION
export const registerUser = async (formData) => {
  try {
    const response = await api.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration failed";
  }
};


// LOGIN USER FUNCTION
export const loginUser = async (data) => {
  try {
    const response = await api.post("/login", data);
      console.log('=================reister service response===================');
    console.log(response);
    console.log('=================reister service response===================');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message ||"Login failed" ;
  }
};