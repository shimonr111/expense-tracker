import { auth} from './firebase-config.js';
import { showMessage } from './helpFunctions.js';
import { addExpense } from "../api/expensesService.js";

const form = document.getElementById('expenseForm');

// Event listener for the button saveExpenseBtn which is submit type
// Logic of updating the DB implemented here
export async function submitExpense(formData, isFixedAmount, comment = null) {

  // Initialize fields that will get stored in the DB for each subcategory later
  let amount = parseFloat(formData.amount);
  const category = formData.category;
  const subcategory = formData.subcategory;
  // If one of the fields empty then notify about that
  if (amount === "" || isNaN(amount) || !category || !subcategory) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  // Set the update expense in the Firebase DB under the specified category
  try {
    const expenseData = {
      amount,
      category,
      subcategory,
      email :auth.currentUser.email,
      comment,
      isFixedAmount
    };
    const data = await addExpense(expenseData);
    if (!data) return;

    showMessage(`Expense for ${subcategory} of ${amount.toFixed(2)} ILS saved successfully!`, false);
    // Remove seesion storage when expense is updated , so it will fetch again from firebase and not use cached data
    sessionStorage.removeItem("months");
    sessionStorage.removeItem("selectedMonth");
    sessionStorage.removeItem("lastExpenses");
    sessionStorage.removeItem("chartData");
    sessionStorage.removeItem("total");
    sessionStorage.removeItem("apiKey");
    return true;  // success
  } catch (error) {
    showMessage("Error saving expense: " + error.message, true);
    return false; // failure
  }
}

