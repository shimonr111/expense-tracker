import React, { useEffect, useState } from "react";
import { Version } from "../App.js";
import { db } from '../utils/firebase-config.js'; 
import { ref, get } from "firebase/database";
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
import { parseLogTimestamp, formatTimestamp } from '../utils/helpFunctions.js';

// History Page Component 
const History = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lastExpenses, setLastExpenses] = useState([]); 

  // Load the combo box with the entries of history from firebase
  useEffect(() => {
    const fetchHistoryMonths = async () => {
      try {
        const historyRef = ref(db, "history");
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Extract months from history keys
          const monthList = Object.keys(data);
          setMonths(monthList);
          if (monthList.length > 0) {
            setSelectedMonth(monthList[0]); // default selection
          }
        } else {
          console.log("No history data available");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistoryMonths();
  }, []);

  // Fetch last 5 expenses using same logic as exportLogFile
  useEffect(() => {
    const fetchLastExpenses = async () => {
      try {
        let monthRef = ref(db, "log");
        const snapshot = await get(monthRef);
        if (!snapshot.exists()) {
          setLastExpenses([]);
          return;
        }
        const logs = snapshot.val();
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

        setLastExpenses(rows.slice(0, 5)); // take last 5
      } catch (err) {
        console.error("Error fetching last expenses:", err);
      }
    };
    fetchLastExpenses();
  }, []);


  return (
    <div>
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
        {/* Last 5 expenses table */}
        {lastExpenses.length > 0 && (
          <table style={{ marginTop: "20px", borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#a09898ff" }}>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Timestamp</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Category</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Subcategory</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Comment</th>
              </tr>
            </thead>
            <tbody>
              {lastExpenses.map((exp, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#9bcbd3ff" : "#c4a6c4ff" }}>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{exp.Timestamp}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{exp.Category || "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{exp.Subcategory || "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{exp.Amount || "-"}</td>
                  <td style={{ border: "1px solid #ccc", padding: "5px" }}>{exp.Comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default History;
