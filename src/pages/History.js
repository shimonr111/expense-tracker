import React, { useEffect, useState } from "react";
import { Version } from "../App.js";
import { db } from '../utils/firebase-config.js'; 
import { ref, get } from "firebase/database";
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';

// History Page Component 
const History = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

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
      </div>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default History;
