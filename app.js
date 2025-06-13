import { fixedAmounts } from './fixedAmounts.js';
const form = document.getElementById('expenseForm');
const messageDiv = document.getElementById('message');

// Event listener for the button saveExpenseBtn which is submit type
form.addEventListener('submit', e => {
  e.preventDefault();

  let amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;
  const now = new Date();
  const year = now.getFullYear(); // e.g., 2025
  const month = now.getMonth() + 1; // 0-based (0 = January), so add 1
  const time = now.toTimeString().split(' ')[0]; // e.g., "14:35:22"

  if (!amount || !category || !subcategory) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  const expenseRef = db.ref('expenses/' + category + '/' + subcategory);

  expenseRef.once('value')
    .then(snapshot => {
      const existing = snapshot.val();
      let newAmount;

      if (fixedAmounts.hasOwnProperty(subcategory)) {
      // Override with fixed amount, no sum
      newAmount = fixedAmounts[subcategory];
      } else {
      // Sum as before
      newAmount = existing ? parseFloat(existing.amount) + amount : amount;
      }

      const expenseData = {
        amount: newAmount,
        category,
        subcategory,
        year,
        month,
        time
      };

      return expenseRef.set(expenseData);
    })
    .then(() => {
    // Now update all fixed subcategories with their fixed amounts
      const updates = [];
      for (const fixedSubcat in fixedAmounts) {
        const fixedCategory = fixedAmounts[fixedSubcat].category;
        const fixedAmount = fixedAmounts[fixedSubcat].amount;
        const fixedRef = db.ref('expenses/' + fixedCategory + '/' + fixedSubcat);
        const fixedData = {
          amount: fixedAmount,
          category: fixedCategory,
          subcategory: fixedSubcat,
          year,
          month,
          time
        };
        updates.push(fixedRef.set(fixedData));
      }
      return Promise.all(updates);
    })
    .then(() => {
      showMessage(`Expense for ${subcategory} of ${amount.toFixed(2)} ILS saved successfully!`, false);
      form.reset();
    })
    .catch(error => {
      showMessage("Error saving expense: " + error.message, true);
    });
});

