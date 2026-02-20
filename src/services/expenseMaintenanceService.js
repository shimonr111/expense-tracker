import { getCurrentDateInfo } from '../utils/helpFunctions.js';
import { cleanLogFile, resetSalaries } from '../utils/cleanDb.js';
import { db } from '../utils/firebase-config.js';
import { fetchExpenses } from "../api/expensesService.js";

// This function is responsible if there is need to reset the entire amounts if it's a new month
export async function ensureMonthlyReset() {
    const [currentYear, currentMonth, currentTime] = getCurrentDateInfo();
  
    try {
      const data = await fetchExpenses();
      if (!data) {
        alert("Expense not found.");
        return;
      }
  
      // Check one sample to compare month
      const sampleCategory = Object.values(data)[0];
      const sampleSubcategory = Object.values(sampleCategory)[0];
      const monthInDatabase = sampleSubcategory.month;
      const yearInDatabase = sampleSubcategory.year;
      // If month does not match → reset all amounts
      if (currentMonth !== monthInDatabase) {
        await backupExpensesAndLogsToHistory(data, monthInDatabase, yearInDatabase);
        // Reset amounts for the new month
        const updates = [];
        for (const category in data) {
          for (const subcategory in data[category]) {
            const expensePath = `expenses/${category}/${subcategory}`;
            const existingFixed = data[category][subcategory]["fixed amount"] || false;
            let newAmount = existingFixed ? data[category][subcategory]["amount"] : 0;
            // Prepare the data
            const fixedData = {
                  amount: newAmount,
                  category,
                  subcategory,
                  year: currentYear,
                  month: currentMonth,
                  time: currentTime,
                  "fixed amount": existingFixed
            };
            updates.push(set(ref(db, expensePath), fixedData)); // Overwrite the data in the DB
          }
        }
        // Also reset the log node and the salaries
        await cleanLogFile();
        await resetSalaries();
      }
    }
    catch (error) {
      console.error("Error fetching expense:", error);
    }
  }

  // Save a copy of current expenses and logs into history/{month_year}
async function backupExpensesAndLogsToHistory(expensesData, month, year) {
    const historyKey = `${month}_${year}`; // e.g. "9_2025"
    // References
    const logsRef = ref(db, "log");
    const salariesRef = ref(db, "Salaries");
    const historyRef = ref(db, `history/${historyKey}`);
    try {
      // Fetch logs and salaries
      const logsSnap = await get(logsRef);
      const logsData = logsSnap.exists() ? logsSnap.val() : {};
      const salariesSnap = await get(salariesRef);
      const salariesData = salariesSnap.exists() ? salariesSnap.val() : {};
      // Save both expenses, logs and references under history
      await set(historyRef, {
        expenses: expensesData,
        log: logsData,
        Salaries: salariesData,
      });
      console.log(`Backup saved to history/${historyKey}`);
    } catch (err) {
      console.error("Error while backing up:", err);
    }
  }