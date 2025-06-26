const form = document.getElementById('expenseForm');

// Event listener for the button saveExpenseBtn which is submit type
// Logic of updating the DB implemented here
form.addEventListener('submit', e => {
  e.preventDefault();

  // Initialize fields that will get stored in the DB for each subcategory later
  let amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;
  const [year, month, time] = getCurrentDateInfo();
  // If one of the fields empty then notify about that
  if (amount === "" || isNaN(amount) || !category || !subcategory) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  const expenseRef = db.ref('expenses/' + category + '/' + subcategory); // reference to the specific subcategory object from the DB
  expenseRef.once('value') // Reading the data from the DB
    .then(snapshot => {
      const existing = snapshot.val();
      const newAmount = existing ? parseFloat(existing.amount) + amount : amount; // Calc the amount, if already exist - summarize it. otherwise, just insert it
      // Prepare the expense data object to be saved in the DB
      const expenseData = {
        amount: newAmount,
        category,
        subcategory,
        year,
        month,
        time
      };
      return expenseRef.set(expenseData);  // Update the subcategory object in the DB
    })
    .then(() => {
      // Show success message and reset the form
      showMessage(`Expense for ${subcategory} of ${amount.toFixed(2)} ILS saved successfully!`, false);
      document.getElementById("subcategory").innerHTML = ""; // clear this combobox
      form.reset();
    })
    .catch(error => {
      // If any error occurs in the process, show it
      showMessage("Error saving expense: " + error.message, true);
    });
});

