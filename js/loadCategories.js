import { fixedAmounts } from '../data/fixedAmounts.js';

// This function responsible to load data from categories.json and load it in the combo boxes of category and subcategory
export function loadCategoriesAndSubcategories(categoryId, subcategoryId, jsonPath = 'data/categories.json') {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById(categoryId);
      const subcategorySelect = document.getElementById(subcategoryId);

      checkIfResetAllAmounts(); // check if there is need to reset the amounts for new month

      // Fill categories
      categorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה ראשית</option>';
      for (const category in data) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      }

      // When category changes, update subcategories
      categorySelect.addEventListener('change', () => {
        const selectedCat = categorySelect.value;
        subcategorySelect.innerHTML = '';

        if (selectedCat && data[selectedCat].length > 0) {
          subcategorySelect.disabled = false;
          subcategorySelect.innerHTML = '<option value="" disabled selected style="color: gray;">בחר קטגוריה משנית</option>';
          data[selectedCat].forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            // Disable if subcategory is in fixedAmounts
            if (fixedAmounts.hasOwnProperty(subcat)) {
              option.disabled = true;
              option.textContent += " (קבוע)";
              option.style.color = "gray";
            }
            subcategorySelect.appendChild(option);
          });
        } else {
          subcategorySelect.disabled = true;
          subcategorySelect.innerHTML = '<option value="">אין קטגוריה משנית</option>';
        }
      });
    })
    .catch(error => console.error("Failed to load categories:", error));
}

// This function is responsible if there is need to reset the entire amounts if it's a new month
function checkIfResetAllAmounts() {
  const now = new Date();
      const currentMonth = now.getMonth() + 1; // 0-based (0 = January), so add 1
      const expensesRef = firebase.database().ref("expenses"); // reference to expenses object in the DB
      expensesRef.once("value")
      .then(snapshot => {
        const data = snapshot.val();
        if (!data) {
          alert("Expense not found.");
        }
        // Check one sample to compare month
        const sampleCategory = Object.values(data)[0];
        const sampleSubcategory = Object.values(sampleCategory)[0];
        const monthInDatabase = sampleSubcategory.month;
        // If month does not match → reset all amounts
        if (currentMonth !== monthInDatabase) {
          for (const category in data) {
            for (const subcategory in data[category]) {
              const expensePath = `expenses/${category}/${subcategory}/amount`;
              firebase.database().ref(expensePath).set(0);
            }
          }
          console.log("All amounts reset to 0.");
        }
      })
      .catch(error => {
        console.error("Error fetching expense:", error);
      });
}
