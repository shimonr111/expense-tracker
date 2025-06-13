// This function is responsible to display the feedback message after the user click on 'Save Expense' button
function showMessage(msg, isError) {
  const positiveColors = ["green", "blue", "darkorange", "teal", "purple", "dodgerblue", "mediumseagreen"];
  const randomColor = positiveColors[Math.floor(Math.random() * positiveColors.length)];
  const messageDiv = document.getElementById('message');
  messageDiv.style.color = randomColor;
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? "red" : randomColor;
}

// This functions responsible for implementing the process of login to Google account, after 'Sign in with Google' clicked
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user.displayName, user.email);
      // Write user data to database:
      db.ref("users/" + user.uid).set({
        name: user.displayName,
        email: user.email
      });
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error.message);
    });
}

// This function responsible to produce excel file report about the expenses, after 'Export month to Excel file' button clicked
function exportToExcel() {

  const expensesRef = firebase.database().ref("expenses"); // reference ro expenses object in the DB, which contains all the data

  expensesRef.once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        alert("No data to export.");
        return;
      }

      // Flatten and structure the data into an array of objects
      const rows = [];

      for (const category in data) {
        const subcategories = data[category];
        for (const subcategory in subcategories) {
          const expense = subcategories[subcategory];
          rows.push({
            Category: category,
            Subcategory: subcategory,
            Amount: parseFloat(expense.amount).toFixed(2),
            Year: expense.year,
            Month: expense.month,
            Time: expense.time
          });
        }
      }
      // Convert the array of rows to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(rows);
      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      // Generate and download the Excel file
      const fileName = "Expenses_Report.xlsx";
      XLSX.writeFile(workbook, fileName);
    })
    .catch(error => {
      console.error("Error exporting data:", error);
      alert("Error exporting data: " + error.message);
    });
}
