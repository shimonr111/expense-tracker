import React, { useEffect, useState } from 'react';
import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
import { Version } from '../App.js';
import { renderSmallLoading } from '../utils/helpFunctions.js';
import axios from 'axios';

// Home Page Component 
const Home = () => {
  const [loading, setLoading] = useState(false);
  //setSubtractAmount
  const [subtractAmount, setSubtractAmount] = useState(false);

  // Runs once to load category and subcategory combo boxes
  useEffect(() => {
    initializeCategoryDropdowns(true);
  }, []);

  // Declare a handler when the form is submitted (by submitting new expense)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let amountValue = parseFloat(e.target.amount.value);
    // Convert to negative if checkbox is checked
    if (subtractAmount) {
      amountValue = -Math.abs(amountValue);
    }
    // Collect the form input values (amount, category and subcategory)
    const formData = {
      amount: amountValue,
      category: e.target.category.value,
      subcategory: e.target.subcategory.value
    };
    const comment = e.target.comment.value
    //Calls the imported function to submit the expense data asynchronously
    const success = await submitExpense(formData, false, comment);
    if (success) {
      e.target.subcategory.innerHTML = ""; // clear subcategory options if needed
      e.target.reset();
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Update new expense</h1>
      <form id="expenseForm" onSubmit={handleSubmit}>
      <label>
          Category <span className="required">*</span>
          <select id="category" required></select>
        </label>
        <label>
          Subcategory <span className="required">*</span>
          <select id="subcategory" required></select>
        </label>
        <label>
          Amount <span className="required">*</span>
          {/*<input type="number" step="0.01" id="amount" required/>*/}
          <input type="text" inputMode="numeric" pattern="-?[0-9]*" id="amount" required/>
        </label>
        <label>
          Comment
          <input type="text" id="comment" />
        </label>
        <label className="switch">
          <input type="checkbox" checked={subtractAmount} onChange={(e) => setSubtractAmount(e.target.checked)}/>
          <span className="slider"></span>
          <span className="label-text">Subtract the amount</span>
        </label>
        <button id="saveExpenseBtn" type="submit">Save Expense</button>
        <button id="exportMonthToExcelBtn" type="button" onClick={() => exportMonthToExcel(null)}>Export month to Excel file</button>
        <button id="exportLogBtn" type="button" onClick={() => exportLogFile(null)}>Export logs to Excel file</button>
        {loading && renderSmallLoading("Saving expense, please wait...")}
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};


export default Home;