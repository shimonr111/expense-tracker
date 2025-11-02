import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';
import { getDatabase, ref, get } from 'firebase/database';

const Edit = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [amountInput, setAmountInput] = useState('');

  // Load categories and subcategories combo boxes on mount
  useEffect(() => {
      initializeCategoryDropdowns(false);
  }, []);

  // Fetch current amount from Firebase when both category and subcategory are selected
  useEffect(() => {
    const fetchAmountFromFirebase = async () => {
      if (selectedCategory && selectedSubcategory) {
        try {
          const db = getDatabase();
          const expenseRef = ref(db, `expenses/${selectedCategory}/${selectedSubcategory}`);
          const snapshot = await get(expenseRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setAmountInput(data.amount || '');
          } else {
            setAmountInput('');
          }
        } catch (error) {
          console.error('Error fetching from Firebase:', error);
          setAmountInput('');
        }
      }
    };
    fetchAmountFromFirebase();
  }, [selectedCategory, selectedSubcategory]);

  // Handle form submission - triggered when "Update amount" button clicked
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      amount: amountInput,
      category: selectedCategory,
      subcategory: selectedSubcategory
    };
    const success = await submitExpense(formData, true);
    if (success) {
      e.target.reset();
      setAmountInput('');
      setSelectedCategory('');
      setSelectedSubcategory('');
      const subcategorySelect = document.getElementById('subcategory');
      if (subcategorySelect) {
        subcategorySelect.innerHTML = ''; // Clear subcategories if needed
      }
      // Remove seesion storage when expense is updated , so it will fetch again from firebase and not use cached data
      sessionStorage.removeItem("categories");
      sessionStorage.removeItem("subcategories");
    }
  };

  return (
    <div>
      <h1>Edit fixed expense</h1>
      <form id="expenseForm" onSubmit={handleSubmit}>
        <label>
          Category
          <select id="category" required onChange={(e) => setSelectedCategory(e.target.value)}></select>
        </label>
        <label>
          Subcategory
          <select id="subcategory" required onChange={(e) => setSelectedSubcategory(e.target.value)}></select>
        </label>
        <label>
          Amount
          <input type="number" step="0.01" id="amount" required value={amountInput} onChange={(e) => setAmountInput(e.target.value)}/>
        </label>
        <button id="saveExpenseBtn" type="submit">
          Update amount
        </button>
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Edit;
