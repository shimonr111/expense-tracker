import React, { useEffect, useState } from "react";
import { Version } from "../App.js";
import { fetchHistory } from "../api/historyService.js";
import { fetchLogs } from "../api/logsService.js";
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
import { parseLogTimestamp, formatTimestamp } from '../utils/helpFunctions.js';
import { renderSmallLoading } from '../utils/helpFunctions.js';
import HistoryTable from "../ui/HistoryTable.js";

// History Page Component 
const History = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lastExpenses, setLastExpenses] = useState([]); 
  const [loading, setLoading] = useState(true); 

  // Load the combo box with the entries of history from firebase
  useEffect(() => {
    // Reads a cached value (if exist) from earlier visit in the same session
    const cachedMonths = sessionStorage.getItem("months");
    const cachedSelectedMonth = sessionStorage.getItem("selectedMonth");
    if (cachedMonths && cachedSelectedMonth) { // If cached, show it immediately
      setMonths(JSON.parse(cachedMonths));
      setSelectedMonth(JSON.parse(cachedSelectedMonth));
      return;
    }

    const fetchHistoryMonths = async () => {
      try {
        const data = await fetchHistory();
        // Extract months from history keys
        const monthList = Object.keys(data);
        setMonths(monthList);
        if (monthList.length > 0) {
          setSelectedMonth(monthList[0]); // default selection
          sessionStorage.setItem("months", JSON.stringify(monthList));
          sessionStorage.setItem("selectedMonth", JSON.stringify(monthList[0]));
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistoryMonths();
  }, []);

  // Fetch last 5 expenses using same logic as exportLogFile
  useEffect(() => {
    const cached = sessionStorage.getItem("lastExpenses"); // Reads a cached value (if exist) from earlier visit in the same session
    if (cached) { // If cached, show it immediately without extracting from firebase
      setLastExpenses(JSON.parse(cached));
      setLoading(false); // show immediately
      return;
    }

    const fetchLastExpenses = async () => {
      try {
        setLoading(true); // If not cached (first visit of that session or after data updated), show loading message
        const logs = await fetchLogs();
        // Convert and sort logs (same as exportLogFile)
        const rows = Object.entries(logs)
        .map(([key, data]) => ({
          Timestamp: formatTimestamp(key),
          Amount: data.amount,
          Category: data.category,
          Subcategory: data.subcategory,
          User: data.user,
          Comment: data.comment,
          _sortDate: parseLogTimestamp(key)
        }))
        .sort((a, b) => b._sortDate - a._sortDate) // descending for last expenses
        .map(({ _sortDate, ...rest }) => rest); 
        const last5 = rows.slice(0, 5);
        setLastExpenses(last5);
        sessionStorage.setItem("lastExpenses", JSON.stringify(last5)); // Cached reslut so next time it won't need to fetch from firebase
      } catch (err) {
        console.error("Error fetching last expenses:", err);
      } finally {
        setLoading(false); // hide loading
      }
    };
    fetchLastExpenses();
  }, []);


  return (
    <div className="page-container">
      <h1>Expenses History</h1>
      <div style={{ marginTop: "20px" }}>
        <label>
          Select Month:
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <div style={{ marginTop: "10px" }}>
          <button id="exportMonthToExcelBtn" type="button" onClick={() => exportMonthToExcel(selectedMonth)}>Export month to Excel file</button>
          <button id="exportLogBtn" type="button" onClick={() => exportLogFile(selectedMonth)}>Export logs to Excel file</button>
        </div>
        {loading ? (
          <>
          {renderSmallLoading("Loading last 5 expenses...")}
          </>
        ) : (
          <>
            {/* Last 5 expenses table */}
            {lastExpenses.length > 0 && (
              <HistoryTable expenses={lastExpenses} />
            )}
          </>
        )}
      </div>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default History;
