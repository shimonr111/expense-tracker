import React from 'react';

const ExpenseTable = ({ expenses }) => (
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
            {expenses.map((exp, idx) => (
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
  );
  
  export default ExpenseTable;
  