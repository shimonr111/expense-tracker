// import React, { useEffect, useState } from 'react';
// import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
// import { ref, get } from 'firebase/database';
// import { db } from '../utils/firebase-config.js';
// import { submitExpense } from '../utils/saveExpenseLogic.js';
// import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
// import { exportLogFile } from '../utils/exportLogFile.js';
// import { Version } from '../App.js';
// import { renderSmallLoading } from '../utils/helpFunctions.js';

// // Home Page Component 
// const Home = () => {
//   const [loading, setLoading] = useState(false);

//   //
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedSubcategory, setSelectedSubcategory] = useState('');
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const snapshot = await get(ref(db, 'expenses'));
//         const data = snapshot.val() || {};

//         const categoriesList = [];
//         const subcategoriesMap = {};

//         for (const category in data) {
//           const subs = {};
//           for (const sub in data[category]) {
//             const subData = data[category][sub];
//             if (!subData['fixed amount']) { // ignore fixed ones for Home page
//               subs[sub] = subData;
//             }
//           }
//           if (Object.keys(subs).length > 0) {
//             categoriesList.push(category);
//             subcategoriesMap[category] = subs;
//           }
//         }

//         setCategories(categoriesList);
//         setSubcategories(subcategoriesMap);
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//       }
//     };

//     fetchCategories();
//   }, []);
//   //

//   // Runs once to load category and subcategory combo boxes
//   // useEffect(() => {
//   //   initializeCategoryDropdowns(true);
//   // }, []);

  

//   // Declare a handler when the form is submitted (by submitting new expense)
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   // Collect the form input values (amount, category and subcategory)
//   //   const formData = {
//   //     amount: e.target.amount.value,
//   //     category: e.target.category.value,
//   //     subcategory: e.target.subcategory.value
//   //   };
//   //   const comment = e.target.comment.value
//   //   //Calls the imported function to submit the expense data asynchronously
//   //   const success = await submitExpense(formData, false, comment);
//   //   if (success) {
//   //     e.target.subcategory.innerHTML = ""; // clear subcategory options if needed
//   //     e.target.reset();
//   //   }
//   //   setLoading(false);
//   // };

//   //
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const amount = e.target.amount.value;
//     const comment = e.target.comment.value;
//     const success = await submitExpense(
//       { amount, category: selectedCategory, subcategory: selectedSubcategory },
//       false,
//       comment
//     );

//     if (success) {
//       setSelectedCategory('');
//       setSelectedSubcategory('');
//       e.target.reset();
//     }

//     setLoading(false);
//   };
//   //



//   return (
//     <div>
//       <h1>Update new expense</h1>
//       <form id="expenseForm" onSubmit={handleSubmit}>
//         <label>
//           Category <span className="required">*</span>
//           {/*<select id="category" required></select>*/}
//           <select
//             value={selectedCategory}
//             onChange={(e) => {
//               setSelectedCategory(e.target.value);
//               setSelectedSubcategory('');
//             }}
//             required
//           >
//             <option value="" disabled>
//               Select a category
//             </option>
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </label>
//         <label>
//           Subcategory <span className="required">*</span>
//           {/*<select id="subcategory" required></select>*/}
//           <select
//             value={selectedSubcategory}
//             onChange={(e) => setSelectedSubcategory(e.target.value)}
//             disabled={!selectedCategory}
//             required
//           >
//             <option value="" disabled>
//               Select a subcategory
//             </option>
//             {selectedCategory &&
//               Object.keys(subcategories[selectedCategory] || {}).map((sub) => (
//                 <option key={sub} value={sub}>
//                   {sub}
//                 </option>
//               ))}
//           </select>
//         </label>
//         <label>
//           Amount <span className="required">*</span>
//           <input type="number" step="0.01" id="amount" required />
//         </label>
//         <label>
//           Comment
//           <input type="text" id="comment" />
//         </label>
//         <button id="saveExpenseBtn" type="submit">Save Expense</button>
//         <button id="exportMonthToExcelBtn" type="button" onClick={() => exportMonthToExcel(null)}>Export month to Excel file</button>
//         <button id="exportLogBtn" type="button" onClick={() => exportLogFile(null)}>Export logs to Excel file</button>
//         {loading && renderSmallLoading("Saving expense, please wait...")}
//       </form>
//       <div className="message" id="message"></div>
//       <div id="version-label">{Version}</div>
//     </div>
//   );
// };


// export default Home;

import React, { useEffect, useState, useRef } from 'react';
import { initializeCategoryDropdowns } from '../utils/loadCategories.js';
import { ref, get } from 'firebase/database';
import { db } from '../utils/firebase-config.js';
import { submitExpense } from '../utils/saveExpenseLogic.js';
import { exportMonthToExcel } from '../utils/exportMonthToExcel.js';
import { exportLogFile } from '../utils/exportLogFile.js';
import { Version } from '../App.js';
import { renderSmallLoading } from '../utils/helpFunctions.js';

// Home Page Component 
const Home = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Use refs to prevent Safari focus issues
  const subcategorySelectRef = useRef(null);
  const preventBlurRef = useRef(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await get(ref(db, 'expenses'));
        const data = snapshot.val() || {};

        const categoriesList = [];
        const subcategoriesMap = {};

        for (const category in data) {
          const subs = {};
          for (const sub in data[category]) {
            const subData = data[category][sub];
            if (!subData['fixed amount']) { // ignore fixed ones for Home page
              subs[sub] = subData;
            }
          }
          if (Object.keys(subs).length > 0) {
            categoriesList.push(category);
            subcategoriesMap[category] = subs;
          }
        }

        setCategories(categoriesList);
        setSubcategories(subcategoriesMap);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Handle category change with Safari-specific fix
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    
    // Use setTimeout to batch state updates and prevent Safari focus issues
    preventBlurRef.current = true;
    
    setSelectedCategory(newCategory);
    setSelectedSubcategory('');
    
    // Allow a brief moment for state to settle before allowing subcategory interaction
    setTimeout(() => {
      preventBlurRef.current = false;
      // Optionally focus the subcategory select after state settles
      if (subcategorySelectRef.current && newCategory) {
        subcategorySelectRef.current.focus();
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const amount = e.target.amount.value;
    const comment = e.target.comment.value;
    const success = await submitExpense(
      { amount, category: selectedCategory, subcategory: selectedSubcategory },
      false,
      comment
    );

    if (success) {
      setSelectedCategory('');
      setSelectedSubcategory('');
      e.target.reset();
    }

    setLoading(false);
  };

  // Get current subcategory options
  const currentSubcategories = selectedCategory ? Object.keys(subcategories[selectedCategory] || {}) : [];

  return (
    <div>
      <h1>Update new expense</h1>
      <form id="expenseForm" onSubmit={handleSubmit}>
        <label>
          Category <span className="required">*</span>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label>
          Subcategory <span className="required">*</span>
          <select
            ref={subcategorySelectRef}
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
            required
            key={selectedCategory} // Force re-render when category changes
          >
            <option value="" disabled>
              Select a subcategory
            </option>
            {currentSubcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
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
