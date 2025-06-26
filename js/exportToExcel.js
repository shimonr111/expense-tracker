import { expensesData } from '../data/expensesDataBase.js';

// This function responsible to produce excel file report about the expenses, after 'Export month to Excel file' button clicked
function exportToExcel() {
  const expensesRef = firebase.database().ref("expenses"); // reference to expenses objects from the DB
  expensesRef.once("value") // Reading the data from the DB
  .then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      alert("No data to export.");
      return;
    }

    let year = null;
    let month = null;
    let rowIndex = 0;

    const worksheet = {};
    const maxLengths = [0, 0]; // For columns A, B

    // Iterate over the data and insert it (both categories and subcategories with their amounts from the DB)
    for (const category in data) {
      const subcategories = data[category];
      const categoryItem = expensesData.find(item => item.category === category);
      rowIndex = categoryItem.row - 1;
      // Write category name in first column (A)
      worksheet[`A${rowIndex}`] = { v: category, t: 's' };
      // Write " - " in columns B of category row
      worksheet[`B${rowIndex}`] = { v: ' - ', t: 's' };
    
      maxLengths[0] = Math.max(maxLengths[0], category.length);
      maxLengths[1] = Math.max(maxLengths[1], 3); // length of " - "

      for (const subcategory in subcategories) {
        const expense = subcategories[subcategory];
        const subCategoryItem = expensesData.find(item => item.subcategory === subcategory);
        rowIndex = subCategoryItem.row
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
      }
    }

    // Define worksheet range
    // Get all keys that look like cell addresses (e.g., A2, B37)
    const usedRows = Object.keys(worksheet)
      .filter(key => /^[A-Z]+\d+$/.test(key))
      .map(key => parseInt(key.match(/\d+/)[0]));
    const maxRow = Math.max(...usedRows);
    worksheet['!ref'] = `A1:B${maxRow}`;
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

document.getElementById("exportToExcelBtn").addEventListener("click", exportToExcel);