import { getMonthName, showMessage, getCurrentDateInfo, parseLogTimestamp } from './helpFunctions.js';
import { db } from './firebase-config.js';  
import { ref, get } from 'firebase/database';
import * as XLSX from 'xlsx';

// Exports logs (from /log in Firebase) into an Excel file with proper formatting
export async function exportLogFile(selectedMonth) {
  try {
    let logRef;
    if (!selectedMonth) {
      logRef = ref(db, "log");
    }
    else{
      logRef = ref(db, `history/${selectedMonth}/log`);
    }
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
        Comment: data.comment,
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
      { wch: 15 },  // User (column E)
      { wch: 15 }  // Comment (column F)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

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
    const fileName = `Log_file_${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showMessage('Log file exported successfully!', false);
  } catch (error) {
    showMessage('Error exporting log file: ' + error.message, true);
  }
}
