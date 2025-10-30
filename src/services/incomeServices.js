import api from "@/libs/api";

// ADD INCOME
export const addIncome = async (token, incomeData) => {
  try {
    const response = await api.post("/add-income", incomeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("=========== response add income ===========");
    console.log(response);
    console.log("=========== response add income ===========");

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error in adding income";
  }
};

// DELETE INCOME
export const deleteIncome = async (token, incomeID) => {
try {
const response = await api.delete(`/del-income/${incomeID}`, {
headers: {
Authorization: `Bearer ${token}`,
},
});
return response.data;
} catch (error) {
throw error.response?.data?.message || "Error deleting income";
}
};


// ✅ EDIT INCOME
export const editIncome = async (token, incomeID, updatedData) => {
try {
const response = await api.put(`/edit-income/${incomeID}`, updatedData, {
headers: {
Authorization: `Bearer ${token}`,
},
});
console.log("================response edit income====================");
console.log(response);
console.log("================response edit income====================");
return response.data;
} catch (error) {
throw error.response?.data?.message || "Error editing income";
}
};
