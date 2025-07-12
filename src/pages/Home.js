import React, { useEffect } from 'react';
import { loadCategoriesAndSubcategories } from '../utils/loadCategories.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';
import { exportToExcel } from '../utils/exportToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
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
    //Calls the imported function to submit the expense data asynchronously
    const success = await submitExpense(formData, false);
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
          Category
          <select id="category" required></select>
        </label>
        <label>
          Subcategory
          <select id="subcategory" required></select>
        </label>
        <label>
          Amount
          <input type="number" step="0.01" id="amount" required />
        </label>
        <button id="saveExpenseBtn" type="submit">Save Expense</button>
        <button id="exportToExcelBtn" type="button" onClick={exportToExcel}>Export month to Excel file</button>
        <button id="exportLogBtn" type="button" onClick={exportLogFile}>Export logs file</button>
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};


export default Home;
