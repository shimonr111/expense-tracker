import { getCurrentDateInfo } from './helpFunctions.js';
import { db } from './firebase-config.js';
import { ref, set, get } from "firebase/database";

// This function responsible to load data from DB in firebase and load it into the combo boxes of category and subcategory
export function loadCategoriesAndSubcategories(categoryId, subcategoryId, ignoreFixedAmount) {
    const categorySelect = document.getElementById(categoryId);
    const subcategorySelect = document.getElementById(subcategoryId);

    const expensesRef = ref(db, 'expenses');
    checkIfResetAllAmounts(expensesRef); // check if there is need to reset the amounts for new month

    get(expensesRef).then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        alert("Expense not found.");
        return
      }
      // Load categories into the combobox first
      categorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה ראשית</option>';
      for (const category in data) {
        // Check if add this category because it might be empty from subcategories
        if (checkIfCategoryIsNotEmpty(data, category, ignoreFixedAmount)){
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categorySelect.appendChild(option);
        }
      }
      // When category changes, load the subcategories into the combo box
      categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        subcategorySelect.innerHTML = '';
        subcategorySelect.disabled = false;
        subcategorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה משנית</option>';
        const subcategories = data[selectedCategory]; 
        for (const subcategory in subcategories){
          const subcategoryData = subcategories[subcategory];
          if ((ignoreFixedAmount && subcategoryData["fixed amount"]) || (!ignoreFixedAmount && !subcategoryData["fixed amount"])){ // Fixed amount for this subcategory
            continue;
          }
          const option = document.createElement('option');
          option.value = subcategory;
          option.textContent = subcategory;
          subcategorySelect.appendChild(option);
        }
      });


    })
  .catch(error => {
    console.error("Error fetching expense:", error);
  });
}

// This function is responsible if there is need to reset the entire amounts if it's a new month
function checkIfResetAllAmounts(expensesRef) {
  const [currentYear, currentMonth, currentTime] = getCurrentDateInfo();
  get(expensesRef).then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      alert("Expense not found.");
      return
    }
    // Check one sample to compare month
    const sampleCategory = Object.values(data)[0];
    const sampleSubcategory = Object.values(sampleCategory)[0];
    const monthInDatabase = sampleSubcategory.month;
    // If month does not match → reset all amounts
    if (currentMonth !== monthInDatabase) {
      const updates = [];

      for (const category in data) {
        for (const subcategory in data[category]) {
          const expensePath = `expenses/${category}/${subcategory}`;
          const existingFixed = data[category][subcategory]["fixed amount"] || false;
          let newAmount = existingFixed ? data[category][subcategory]["amount"] : 0;
          // Prepare the data
          const fixedData = {
                amount: newAmount,
                category,
                subcategory,
                year: currentYear,
                month: currentMonth,
                time: currentTime,
                "fixed amount": existingFixed
          };
          updates.push(set(ref(db, expensePath), fixedData)); // Overwrite the data in the DB
        }
      }
      return Promise.all(updates);
    }
  })
  .catch(error => {
    console.error("Error fetching expense:", error);
  });
}

// Check if category is not empty based on the condition, if its Home page or Edit page
// Home page display the subcategories that are not fixed amount
// Edit page displplay the subcategories that are fixed amount
function checkIfCategoryIsNotEmpty(data, category, ignoreFixedAmount) {
  const subcategories = data[category];
  for (const sub in subcategories) {
    const isFixed = subcategories[sub]["fixed amount"];
    if (ignoreFixedAmount ? !isFixed : isFixed) return true;
  }
  return false;
}

