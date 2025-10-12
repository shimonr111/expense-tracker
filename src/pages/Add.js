import React, { useEffect, useState } from 'react';
import { Version } from '../App.js';
import { db } from '../utils/firebase-config.js';
import { ref, get, set } from 'firebase/database';
import { showMessage, getCurrentDateInfo } from '../utils/helpFunctions.js';

// Add Page component
const Add = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isFixed, setIsFixed] = useState(false);

  // Load existing categories on mount
  useEffect(() => {
    // Reads a cached value (if exist) from earlier visit in the same session
    const cachedCategories = sessionStorage.getItem("categories");
    if (cachedCategories) {
      const parsed = JSON.parse(cachedCategories);
      setCategories(Array.isArray(parsed) ? parsed : Object.keys(parsed));
      return;
    }


    const fetchCategories = async () => {
      const snapshot = await get(ref(db, 'expenses'));
      const data = snapshot.val();
      if (data) {
        setCategories(Object.keys(data));
        sessionStorage.setItem("categories", JSON.stringify(Object.keys(data)));
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryToUse = newCategory || selectedCategory;
    if (!categoryToUse || !subcategory) {
      showMessage('Please fill all required fields.', true);
      return;
    }
    const path = `expenses/${categoryToUse}/${subcategory}`;
    const [currentYear, currentMonth, currentTime] = getCurrentDateInfo();
    try {
      await set(ref(db, path), {
        amount: 0,
        category: categoryToUse,
        subcategory: subcategory,
        year: currentYear,
        month: currentMonth,
        time: currentTime,
        "fixed amount": isFixed
      });
      showMessage(`Added ${subcategory} under ${categoryToUse} successfully.`);
      // Reset fields
      setNewCategory('');
      setSelectedCategory('');
      setSubcategory('');
      setIsFixed(false);
    } catch (error) {
      console.error('Error saving to database:', error);
      showMessage('Failed to add entry.', true);
    } finally {
      // Remove seesion storage when expense is updated , so it will fetch again from firebase and not use cached data
      sessionStorage.removeItem("categories");
      sessionStorage.removeItem("subcategories");
    }
  };

  return (
    <div>
      <h1>Add new field</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Choose existing category:
          <select value={selectedCategory} onChange={(e) => { 
            setSelectedCategory(e.target.value); 
            setNewCategory('');}}>
            <option value="">בחר קטגוריה קיימת</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label>
          Or enter new category:
          <input type="text" value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setSelectedCategory('');}} />
        </label>
        <label>
          Subcategory name:
          <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} required/>
        </label>
        <label>
          Fixed amount?
          <select value={isFixed} onChange={(e) => setIsFixed(e.target.value === 'true')}>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </label>
        <button type="submit">Add Field</button>
      </form>
      <div className="message" id="message"></div>
      <div id="version-label">{Version}</div>
    </div>
  );
};

export default Add;
