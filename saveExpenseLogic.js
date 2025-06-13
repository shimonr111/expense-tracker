import { fixedAmounts } from './fixedAmounts.js';
const form = document.getElementById('expenseForm');
const messageDiv = document.getElementById('message');

// Event listener for the button saveExpenseBtn which is submit type
// Logic of updating the DB implemented here
form.addEventListener('submit', e => {
  e.preventDefault();

  // Initialize fields that will get stored in the DB for each subcategory later
  let amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;
  const now = new Date();
  const year = now.getFullYear(); // e.g., 2025
  const month = now.getMonth() + 1; // 0-based (0 = January), so add 1
  const time = now.toTimeString().split(' ')[0]; // e.g., "14:35:22"

  // If one of the fields empty then notify about that
  if (!amount || !category || !subcategory) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  const expenseRef = db.ref('expenses/' + category + '/' + subcategory);
  expenseRef.once('value')
    .then(snapshot => { // Update in the DB the current onject in the form
      const existing = snapshot.val();
      const newAmount = existing ? parseFloat(existing.amount) + amount : amount; // Calc the amount
      // Prepare the expense data object to be saved in the DB
      const expenseData = {
        amount: newAmount,
        category,
        subcategory,
        year,
        month,
        time
      };
      return expenseRef.set(expenseData);  // Save this object in the DB
    })
    .then(() => {  // Now update all fixed subcategories with their fixed amounts
      const updates = [];
      for (const fixedSubcat in fixedAmounts) {
        const fixedCategory = fixedAmounts[fixedSubcat].category;
        const fixedAmount = fixedAmounts[fixedSubcat].amount;
        const fixedRef = db.ref('expenses/' + fixedCategory + '/' + fixedSubcat);
        // Prepare the expense data object to be saved in the DB
        const fixedData = {
          amount: fixedAmount,
          category: fixedCategory,
          subcategory: fixedSubcat,
          year,
          month,
          time
        };
        updates.push(fixedRef.set(fixedData)); // Add this object to list and update it in the DB
      }
      return Promise.all(updates); // Wait until all fixed subcategory updates are done
    })
    .then(() => {
      // Show success message and reset the form
      showMessage(`Expense for ${subcategory} of ${amount.toFixed(2)} ILS saved successfully!`, false);
      form.reset();
    })
    .catch(error => {
      // If any error occurs in the process, show it
      showMessage("Error saving expense: " + error.message, true);
    });
});

