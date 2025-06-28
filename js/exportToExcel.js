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

    const worksheet = {}; // Empty object for the worksheet 
    const maxLengths = [0, 0]; // For columns A, B, to define later the maximum width of the column
    let currentRow = 1;

    // Group subcategories under each category (it keeps order when iterating later, by the insertion order)
    const grouped = {};
    expensesData.forEach(({ category, subcategory }) => {
      if (!grouped[category]) {
        grouped[category] = new Set();
      }
      grouped[category].add(subcategory);
    });

    // Iterate over the data and insert it (both categories and subcategories with their amounts from the DB)
    for (const category in grouped) {
      if (!data[category]) continue;
      const subcategories = data[category];
      worksheet[`A${currentRow}`] = { v: category, t: 's' }; // Write category name in first column (A)
      worksheet[`B${currentRow}`] = { v: ' - ', t: 's' }; // Write " - " in columns B of category row
      updateMaxColumnWidths(maxLengths, category, ' - ');  // Update maximum width column
      currentRow++;

      for (const subcategory of grouped[category]) {
        const expense = subcategories[subcategory];
        if (!expense) continue; // skip if not found in DB
        const subCategoryItem = expensesData.find(item => item.subcategory === subcategory); // find item from the imported list, based on the subcategory
        rowIndex = subCategoryItem.row // This is its row number in the XLSX file
        // Set year and month from first expense only - use it later for the name XLSX file
        if (year === null && month === null) {
          year = expense.year;
          month = getMonthName(parseInt(expense.month));
        }
        worksheet[`A${currentRow}`] = { v: subcategory, t: 's' }; // Subcategory in column A
        worksheet[`B${currentRow}`] = { v: parseFloat(expense.amount).toFixed(2), t: 'n' }; // Amount in column B
        updateMaxColumnWidths(maxLengths, subcategory, worksheet[`B${currentRow}`].v.toString()); // Update maximum width column
        currentRow++;
      }
    }

    // Set the column widths for columns A and B based on the longest string
    const usedRows = Object.keys(worksheet)
      .filter(key => /^[A-Z]+\d+$/.test(key))
      .map(key => parseInt(key.match(/\d+/)[0]));
    const maxRow = Math.max(...usedRows);
    worksheet['!ref'] = `A1:B${maxRow}`;
    worksheet['!cols'] = maxLengths.map(len => ({ wch: len + 1 }));

    // Create a workbook object, and set the view to RTL
    const workbook = {
      SheetNames: ['Expenses'],
      Sheets: {
        'Expenses': worksheet
      },
      Workbook: {
        Views: [{ RTL: true }]
      }
    };

    // Generate the file
    const fileName = `Expenses_Report_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  })
  .catch(error => {
    console.error("Error exporting data:", error);
    alert("Error exporting data: " + error.message);
  });
}

document.getElementById("exportToExcelBtn").addEventListener("click", exportToExcel);