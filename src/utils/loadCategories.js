import { getCurrentDateInfo } from './helpFunctions.js';
import { db } from './firebase-config.js';
import { ref, set, get } from "firebase/database";
import { cleanLogFile } from '../utils/cleanLogFile.js';

// This function initialize the combo boxes of category and subcategory
export async function initializeCategoryDropdowns(ignoreFixedAmount) {
  // Use different sessionStorage keys for Home and Edit pages
  const categoriesCacheKey = ignoreFixedAmount ? "categories_home" : "categories_edit";
  const subcategoriesCacheKey = ignoreFixedAmount ? "subcategories_home" : "subcategories_edit";

  // Fetch cached data for categories and subcategories based on the current page
  let cachedCategories = sessionStorage.getItem(categoriesCacheKey);
  let cachedSubcategories = sessionStorage.getItem(subcategoriesCacheKey);

  const categorySelect = document.getElementById('category');
  const subcategorySelect = document.getElementById('subcategory');
  
  if (cachedCategories && cachedSubcategories) { // Use the cached data from Home page
    console.log(`Using cached data from ${ignoreFixedAmount ? 'home' : 'edit'} page...`);
    const categoriesData = JSON.parse(cachedCategories);
    const subcategoriesData = JSON.parse(cachedSubcategories);
    populateCategoryDropdown(categorySelect, categoriesData);
    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      populateSubcategoryDropdown(subcategorySelect, subcategoriesData[selectedCategory] || {});
    });
  }

  else { // There is no cached data so fetch from firebase
    console.log("Fetching from Firebase first...")
    const { categories, subcategories } = await loadCategoriesAndSubcategories('category', 'subcategory', ignoreFixedAmount);
    sessionStorage.setItem(categoriesCacheKey, JSON.stringify(categories));
    sessionStorage.setItem(subcategoriesCacheKey, JSON.stringify(subcategories));
  }
}

// This function responsible to load data from DB in firebase and load it into the combo boxes of category and subcategory
export async function loadCategoriesAndSubcategories(categoryId, subcategoryId, ignoreFixedAmount) {
  const categorySelect = document.getElementById(categoryId);
  const subcategorySelect = document.getElementById(subcategoryId);

  const expensesRef = ref(db, 'expenses');
  await checkIfResetAllAmounts(expensesRef);

  try {
    const snapshot = await get(expensesRef);
    const data = snapshot.val();
    if (!data) return { categories: {}, subcategories: {} };

    const categories = {};
    const subcategories = {};

    for (const category in data) {
      if (checkIfCategoryIsNotEmpty(data, category, ignoreFixedAmount)) {
        categories[category] = category;
        subcategories[category] = {};
        for (const sub in data[category]) {
          const subData = data[category][sub];
          if ((ignoreFixedAmount && subData["fixed amount"]) || (!ignoreFixedAmount && !subData["fixed amount"])) continue;
          subcategories[category][sub] = subData;
        }
      }
    }

    // Populate DOM
    populateCategoryDropdown(categorySelect, categories);
    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      populateSubcategoryDropdown(subcategorySelect, subcategories[selectedCategory] || {});
    });

    return { categories, subcategories };

  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { categories: {}, subcategories: {} };
  }
}


// This function is responsible if there is need to reset the entire amounts if it's a new month
async function checkIfResetAllAmounts(expensesRef) {
  const [currentYear, currentMonth, currentTime] = getCurrentDateInfo();

  try {
    const snapshot = await get(expensesRef); // await here
    const data = snapshot.val();
    if (!data) {
      alert("Expense not found.");
      return;
    }

    // Check one sample to compare month
    const sampleCategory = Object.values(data)[0];
    const sampleSubcategory = Object.values(sampleCategory)[0];
    const monthInDatabase = sampleSubcategory.month;
    // If month does not match → reset all amounts
    if (currentMonth !== monthInDatabase) {
      await backupExpensesAndLogsToHistory(data);
      // Reset amounts for the new month
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
      // Also reset the log node
      await cleanLogFile();
    }
  }
  catch (error) {
    console.error("Error fetching expense:", error);
  }
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

// Save a copy of current expenses and logs into history/{month_year}
async function backupExpensesAndLogsToHistory(expensesData) {
  // Build key
  const [currentYear, currentMonth] = getCurrentDateInfo();
  const fixedCurrentMonth = currentMonth - 1; // because its back up the last month, now its first day of the new month
  const historyKey = `${fixedCurrentMonth}_${currentYear}`; // e.g. "9_2025"
  // References
  const logsRef = ref(db, "log");
  const historyRef = ref(db, `history/${historyKey}`);
  // Fetch logs entry
  try {
    // Fetch logs entry
    const logsSnap = await get(logsRef);
    const logsData = logsSnap.exists() ? logsSnap.val() : {};
    // Save both expenses and logs under history
    await set(historyRef, {
      expenses: expensesData,
      log: logsData,
    });
    console.log(`Backup saved to history/${historyKey}`);
  } catch (err) {
    console.error("Error while backing up:", err);
  }
}

export function populateCategoryDropdown(selectElement, categories) {
  selectElement.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה ראשית</option>';
  Object.keys(categories).forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    selectElement.appendChild(option);
  });
}

export function populateSubcategoryDropdown(selectElement, subcategories) {
  selectElement.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה משנית</option>';
  Object.keys(subcategories).forEach(sub => {
    const option = document.createElement('option');
    option.value = sub;
    option.textContent = sub;
    selectElement.appendChild(option);
  });
  selectElement.disabled = false;
}


