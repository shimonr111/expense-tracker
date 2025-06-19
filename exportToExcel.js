import { orderedCategories } from './orderedCategories.js';

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
    let rowIndex = 0;
    let counter = 0;

    const worksheet = {};
    //let rowIndex = 1;  // Excel rows start at 1
    const maxLengths = [0, 0]; // For columns A, B

    for (const category in data) {
      const subcategories = data[category];
      rowIndex = orderedCategories.indexOf(category) + 1
      console.log(rowIndex)
      // Write category name in first column (A)
      worksheet[`A${rowIndex}`] = { v: category, t: 's' };
      // Write " - " in columns B of category row
      worksheet[`B${rowIndex}`] = { v: ' - ', t: 's' };

      maxLengths[0] = Math.max(maxLengths[0], category.length);
      maxLengths[1] = Math.max(maxLengths[1], 3); // length of " - "

      counter++;

      for (const subcategory in subcategories) {
        const expense = subcategories[subcategory];
        rowIndex = orderedCategories.indexOf(subcategory) + 1
        console.log(rowIndex)
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

        counter++;
      }
    }

    // Define worksheet range
    worksheet['!ref'] = `A1:B${counter}`;
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

document.getElementById("exportToExcelBtn").addEventListener("click", exportToExcel);