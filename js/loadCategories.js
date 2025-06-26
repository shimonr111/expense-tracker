import { expensesData } from '../data/expensesDataBase.js';

// This function responsible to load data from data/categories.json and load it into the combo boxes of category and subcategory
export function loadCategoriesAndSubcategories(categoryId, subcategoryId) {
    const categorySelect = document.getElementById(categoryId);
    const subcategorySelect = document.getElementById(subcategoryId);

    checkIfResetAllAmounts(); // check if there is need to reset the amounts for new month

    // Load categories into the combobox first
    categorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה ראשית</option>';
    const seenCategories = new Set();
    for (const item of expensesData) {
      if (!seenCategories.has(item.category)) {
        const option = document.createElement('option');
        option.value = item.category;
        option.textContent = item.category;
        categorySelect.appendChild(option);
        seenCategories.add(item.category);
      }
    }

    // When category changes, load the subcategories into the combo box
    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      subcategorySelect.innerHTML = '';
      subcategorySelect.disabled = false;
      subcategorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה משנית</option>';
      for (const item of expensesData){
        if (item.category == selectedCategory){
          const option = document.createElement('option');
          option.value = item.subcategory;
          option.textContent = item.subcategory;
          if (item.amount != null){ // Fixed amount for this subcategory
            option.disabled = true;
            option.textContent += " (קבוע)";
            option.style.color = "gray";
          }
          subcategorySelect.appendChild(option);
        }
      }
    });
}

// This function is responsible if there is need to reset the entire amounts if it's a new month
function checkIfResetAllAmounts() {
  const [currentYear, currentMonth, currentTime] = getCurrentDateInfo();
  const expensesRef = firebase.database().ref("expenses"); // reference to expenses objects from the DB
  expensesRef.once("value") // Reading the data from the DB
  .then(snapshot => {
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
          const item = expensesData.find(entry => entry.subcategory === subcategory);
          let newAmount = item.amount == null ? 0 : item.amount
          // Prepare the data
          const fixedData = {
                amount: newAmount,
                category,
                subcategory,
                year: currentYear,
                month: currentMonth,
                time: currentTime
          };
          updates.push(firebase.database().ref(expensePath).set(fixedData)); // Overwrite the data in the DB
        }
      }
      return Promise.all(updates);
    }
  })
  .catch(error => {
    console.error("Error fetching expense:", error);
  });
}
