import React, { useEffect } from 'react';
import { loadCategoriesAndSubcategories } from '../utils/loadCategories.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
import { cleanLogFile } from '../utils/cleanLogFile.js';
import { Version } from '../App.js';

// Home Page Component 
const Home = () => {

  // Runs once to load category and subcategory combo boxes
  useEffect(() => {
    loadCategoriesAndSubcategories('category', 'subcategory', true);
  }, []);

  // Declare a handler when the form is submitted (by submitting new expense)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Collect the form input values (amount, category and subcategory)
    const formData = {
      amount: e.target.amount.value,
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
  };

  return (
    <div>
      <h1>Add new expense</h1>
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
          <input type="number" step="0.01" id="amount" required />
        </label>
        <label>
          Comment
          <input type="text" id="comment" />
        </label>
        <button id="saveExpenseBtn" type="submit">Save Expense</button>
        <button id="exportMonthToExcelBtn" type="button" onClick={exportMonthToExcel}>Export month to Excel file</button>
        <button id="exportLogBtn" type="button" onClick={exportLogFile}>Export logs to Excel file</button>
        <button id="cleanLogBtn" type="button" onClick={cleanLogFile}>Clean logs data</button>
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};


export default Home;
