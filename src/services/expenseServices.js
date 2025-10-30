import api from "@/libs/api";

// ADD EXPENSE
export const addExpense = async ( token, expenseData) => {
  try {
    const response = await api.post("/add-expense", expenseData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("=========== response add expense ===========");
    console.log(response);
    console.log("=========== response add expense ===========");

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error in adding expense";
  }
};


// DELETE EXPENSE
export const deleteExpense = async (token, expenseID) => {
try {
const response = await api.delete(`/del-expense/${expenseID}`, {
headers: {
Authorization: `Bearer ${token}`,
},
});
return response.data;
} catch (error) {
throw error.response?.data?.message || "Error deleting expense";
}
};



// EDIT Expense
export const editExpense = async (token, expenseID, updatedData) => {
  try {
    const response = await api.put(`/edit-expense/${expenseID}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("================response edit expense====================");
    console.log(response);
    console.log("================response edit expense====================");

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Error editing expense";
  }
};
