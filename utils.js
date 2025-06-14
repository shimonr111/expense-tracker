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
  const expensesRef = firebase.database().ref("expenses"); // reference to expenses object in the DB
  expensesRef.once("value")
  .then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      alert("No data to export.");
      return;
    }

    let year = null;
    let month = null;

    const worksheet = {};
    let rowIndex = 1;  // Excel rows start at 1
    const maxLengths = [0, 0]; // For columns A, B

    for (const category in data) {
      const subcategories = data[category];
      // Write category name in first column (A)
      worksheet[`A${rowIndex}`] = { v: category, t: 's' };
      // Write " - " in columns B of category row
      worksheet[`B${rowIndex}`] = { v: ' - ', t: 's' };

      maxLengths[0] = Math.max(maxLengths[0], category.length);
      maxLengths[1] = Math.max(maxLengths[1], 3); // length of " - "

      rowIndex++;

      for (const subcategory in subcategories) {
        const expense = subcategories[subcategory];

        // Set year and month from first expense only
        if (year === null && month === null) {
          year = expense.year;
          month = getMonthName(parseInt(expense.month)); // Your function for month name
        }

        // Subcategory in column A
        worksheet[`A${rowIndex}`] = { v: subcategory, t: 's' };
        // Amount in column B
        worksheet[`B${rowIndex}`] = { v: parseFloat(expense.amount).toFixed(2), t: 'n' };

        maxLengths[0] = Math.max(maxLengths[0], subcategory.length);
        maxLengths[1] = Math.max(maxLengths[1], worksheet[`B${rowIndex}`].v.length);

        rowIndex++;
      }
    }

    // Define worksheet range
    worksheet['!ref'] = `A1:B${rowIndex - 1}`;
    // Set column widths based on maxLengths (add some padding)
    worksheet['!cols'] = maxLengths.map(len => ({ wch: len + 1 }));

    // 🟢 Use custom workbook with RTL view
    const workbook = {
      SheetNames: ['Expenses'],
      Sheets: {
        'Expenses': worksheet
      },
      Workbook: {
        Views: [{ RTL: true }]
      }
    };

    // Save the file
    const fileName = `Expenses_Report_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  })
  .catch(error => {
    console.error("Error exporting data:", error);
    alert("Error exporting data: " + error.message);
  });
}

// This function get month number, and return month name
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1); // JS months are 0-based
  return date.toLocaleString('en-US', { month: 'long' }); // e.g., "June"
}
