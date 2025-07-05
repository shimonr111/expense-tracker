import { ref, get, set } from 'firebase/database';
import { db } from './firebase-config.js';
import { showMessage, getCurrentDateInfo } from './helpFunctions.js';

const form = document.getElementById('expenseForm');

// Event listener for the button saveExpenseBtn which is submit type
// Logic of updating the DB implemented here
export async function submitExpense(formData, isFixedAmount) {

  // Initialize fields that will get stored in the DB for each subcategory later
  let amount = parseFloat(formData.amount);
  const category = formData.category;
  const subcategory = formData.subcategory;
  const [year, month, time] = getCurrentDateInfo();
  // If one of the fields empty then notify about that
  if (amount === "" || isNaN(amount) || !category || !subcategory) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  try {
    const expenseRef = ref(db, `expenses/${category}/${subcategory}`);
    const snapshot = await get(expenseRef);
    const existing = snapshot.val();
    const newAmount = isFixedAmount ? amount : (existing ? parseFloat(existing.amount) : 0) + amount;
    const expenseData = {
      amount: newAmount,
      category,
      subcategory,
      year,
      month,
      time,
      "fixed amount": isFixedAmount
  };

  await set(expenseRef, expenseData);

  console.log(subcategory)
  console.log(amount)
  showMessage(`Expense for ${subcategory} of ${amount.toFixed(2)} ILS saved successfully!`, false);
    return true;  // success
  } catch (error) {
    showMessage("Error saving expense: " + error.message, true);
    return false; // failure
  }
}

