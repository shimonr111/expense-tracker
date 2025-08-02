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

    // Convert and sort logs
    const rows = Object.entries(logs)
      .map(([key, data]) => ({
        Timestamp: key,
        Amount: data.amount,
        Category: data.category,
        Subcategory: data.subcategory,
        User: data.user,
        _sortDate: parseLogTimestamp(key)
      }))
      .sort((a, b) => a._sortDate - b._sortDate) // Sort chronologically
      .map(({ _sortDate, ...rest }) => rest); // Remove _sortDate before export


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

function parseLogTimestamp(ts) {
  try {
    // Example format: "07-33-24 at Thursday 24-7-2025"
    const [timePart] = ts.split(' at ');
    const dateStr = ts.split(' ').slice(-1)[0]; // Gets "24-7-2025"
    
    const [hours, minutes, seconds] = timePart.split('-').map(Number);
    const [day, month, year] = dateStr.split('-').map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch {
    return new Date(0); // fallback for invalid format
  }
}
