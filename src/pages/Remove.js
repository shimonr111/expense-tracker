import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';

// Remove Page component
const Remove = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [fixedCategories, setFixedCategories] = useState(true);

  // This function clear comboboxes when checkbox selected/unselected
  const clearDropdowns = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    if (categorySelect) categorySelect.innerHTML = '';
    if (subcategorySelect) subcategorySelect.innerHTML = '';
  };

  useEffect(() => {
    // Clear selects first
    clearDropdowns();
    initializeCategoryDropdowns(fixedCategories);
  }, [fixedCategories]);

  // Handle form submission - triggered when "Remove subcategory" button clicked
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show confirmation popup
    const confirmed = window.confirm(
        "Are you sure? You are going to remove element from DB."
    );
    if (!confirmed) return; // Stop if user clicks Cancel

    const formData = {
      category: selectedCategory,
      subcategory: selectedSubcategory
    };
    //const success = await submitExpense(formData, true);
    const success = false;
    if (success) {
      e.target.reset();
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
      <h1>Remove Subcategory</h1>
      <form id="expenseForm" onSubmit={handleSubmit}>
        <label id="checkboxLabel">
          Non-fixed categories
          <input type="checkbox" checked={fixedCategories} onChange={(e) => setFixedCategories(e.target.checked)}/>
        </label>
        <label>
          Category
          <select id="category" required onChange={(e) => setSelectedCategory(e.target.value)}></select>
        </label>
        <label>
          Subcategory
          <select id="subcategory" required onChange={(e) => setSelectedSubcategory(e.target.value)}></select>
        </label>
        <button id="saveExpenseBtn" type="submit">
          Remove subcategory from DB
        </button>
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Remove;
