import { getMonthName, showMessage, updateMaxColumnWidths, getCurrentDateInfo} from './helpFunctions.js';
import { db } from './firebase-config.js';  
import { ref, get } from 'firebase/database';
import * as XLSX from 'xlsx';

// This function responsible to produce excel file report about the expenses, after 'Export month to Excel file' button clicked
export function exportMonthToExcel(selectedMonth) {
  let expensesRef;
  let salariesRef;
  if (!selectedMonth) {
    expensesRef = ref(db, "expenses");
    salariesRef = ref(db, "Salaries");
  }
  else{
    expensesRef = ref(db, `history/${selectedMonth}/expenses`);
    salariesRef = ref(db, `history/${selectedMonth}/Salaries`);
  }

  Promise.all([get(expensesRef), get(salariesRef)])
    .then(([expensesSnap, salariesSnap]) => {
      const data = expensesSnap.val();
      const salaries = salariesSnap.val();

      if (!data) {
        alert("No data to export.");
        return;
      }

      const worksheet = {}; // Empty object for the worksheet 
      const maxLengths = [0, 0]; // For columns A, B, to define later the maximum width of the column
      let currentRow = 1;
      let totalAmount = 0;

      // Iterate over the data and insert it (both categories and subcategories with their amounts from the DB)
      for (const category in data) {
        worksheet[`A${currentRow}`] = { v: category, t: 's' }; // Write category name in first column (A)
        worksheet[`B${currentRow}`] = { v: ' - ', t: 's' }; // Write " - " in columns B of category row
        updateMaxColumnWidths(maxLengths, category, ' - ');  // Update maximum width column
        const subcategories = data[category];
        currentRow++;
        for (const subcategory in subcategories) {
          const amount = subcategories[subcategory]?.amount ?? 0;
          const parsedAmount = parseFloat(amount).toFixed(2);
          totalAmount += parseFloat(parsedAmount); //
          worksheet[`A${currentRow}`] = { v: subcategory, t: 's' }; // Subcategory in column A
          worksheet[`B${currentRow}`] = { v: parseFloat(amount).toFixed(2), t: 'n' }; // Amount in column B
          updateMaxColumnWidths(maxLengths, subcategory, worksheet[`B${currentRow}`].v.toString()); // Update maximum width column
          currentRow++;
        }
      }

      // Add Total expenses to the xlsx file
      worksheet[`A${currentRow}`] = { v: 'Total', t: 's' };
      worksheet[`B${currentRow}`] = { v: totalAmount.toFixed(2), t: 'n' };
      updateMaxColumnWidths(maxLengths, 'Total', totalAmount.toFixed(2));
      currentRow++;

      // Add salaries to the xlsx file
      if (salaries) {
        currentRow++; // empty line

        worksheet[`A${currentRow}`] = { v: 'Salaries', t: 's' };
        worksheet[`B${currentRow}`] = { v: '', t: 's' };
        updateMaxColumnWidths(maxLengths, 'Salaries', '');
        currentRow++;

        for (const name in salaries) {
          const salary = parseFloat(salaries[name]).toFixed(2);

          worksheet[`A${currentRow}`] = { v: name, t: 's' };
          worksheet[`B${currentRow}`] = { v: salary, t: 'n' };
          updateMaxColumnWidths(maxLengths, name, salary);
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
      let year, month;
      if (!selectedMonth) {
        [year, month] = getCurrentDateInfo();
      }
      else{
        const [m, y] = selectedMonth.split("_"); 
        month = m;
        year = y;
      }
      month = getMonthName(month);
      const fileName = `Expenses_Report_${month}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showMessage('Expenses report file exported successfully!', false);
    })
    .catch(error => {
      console.error("Error exporting data:", error);
      showMessage("Error exporting data: " + error.message, true);
    });
}