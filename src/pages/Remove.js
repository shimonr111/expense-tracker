import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
import { db } from '../utils/firebase-config.js';
import { ref, remove } from 'firebase/database';
import { showMessage } from '../utils/helpFunctions.js';

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
        "Are you sure? You are going to remove element from DB"
    );
    if (!confirmed) return; // Stop if user clicks Cancel

    try {
      await remove(ref(db, `expenses/${selectedCategory}/${selectedSubcategory}`));
      showMessage(`Subcategory ${selectedSubcategory} removed successfully`);
      // Remove session storage caches so other pages fetch fresh data
      sessionStorage.removeItem("categories_home");
      sessionStorage.removeItem("subcategories_home");
      sessionStorage.removeItem("categories_edit");
      sessionStorage.removeItem("subcategories_edit");
      // Clear chart cache so Stats page refreshes
      sessionStorage.removeItem("chartData");
      sessionStorage.removeItem("total");
      clearDropdowns();
      initializeCategoryDropdowns(fixedCategories);
    } catch (error) {
      console.error("Firebase remove error:", error);
      showMessage("Failed to remove subcategory", true);
    }
  };

  return (
    <div>
      <h1>Remove Subcategory</h1>
      <form id="expenseForm" onSubmit={handleSubmit}>
        <label className="switch">
          <input type="checkbox" checked={fixedCategories} onChange={(e) => setFixedCategories(e.target.checked)}/>
          <span className="slider"></span>
          <span className="label-text">Non-fixed categories</span>
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
