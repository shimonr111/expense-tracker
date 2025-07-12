import { getMonthName, showMessage, getCurrentDateInfo } from './helpFunctions.js';
import { db } from './firebase-config.js';  
import { ref, get } from 'firebase/database';
import * as XLSX from 'xlsx';

// Exports logs (from /log in Firebase) into an Excel file with proper formatting

export async function exportLogFile() {
  try {
    // Reference to the logs
    const logRef = ref(db, 'log');
    const snapshot = await get(logRef);

    if (!snapshot.exists()) {
      showMessage('No logs found to export.', true);
      return;
    }

    const logs = snapshot.val();

    // Convert logs object into an array of rows
    const rows = Object.entries(logs).map(([key, data]) => ({
      Timestamp: key,
      Amount: data.amount,
      Category: data.category,
      Subcategory: data.subcategory,
      User: data.user
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths manually
    worksheet['!cols'] = [
      { wch: 35 }, // Timestamp (column A)
      { wch: 15 }, // Amount (column B)
      { wch: 15 }, // Category (column C)
      { wch: 15 },  // Subcategory (column D)
      { wch: 15 }  // Subcategory (column E)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    // Generate the file
    let [year, month, time] = getCurrentDateInfo();
    month = getMonthName(month);
    const fileName = `Log_file_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showMessage('Log file exported successfully!', false);
  } catch (error) {
    showMessage('Error exporting log file: ' + error.message, true);
  }
}