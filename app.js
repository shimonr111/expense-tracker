const form = document.getElementById('expenseForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', e => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const note = document.getElementById('note').value;
  const timestamp = new Date().toISOString();

  if (!amount || !category) {
    showMessage("Please enter amount and select category", true);
    return;
  }

  const expenseRef = db.ref('expenses/' + category);

  expenseRef.once('value')
    .then(snapshot => {
      const existing = snapshot.val();
      const newAmount = existing ? parseFloat(existing.amount) + amount : amount;

      const expenseData = {
        amount: newAmount,
        category,
        note,
        timestamp
      };

      return expenseRef.set(expenseData);
    })
    .then(() => {
      showMessage("Expense saved (updated) successfully!", false);
      form.reset();
    })
    .catch(error => {
      showMessage("Error saving expense: " + error.message, true);
    });
});

