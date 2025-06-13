import { fixedAmounts } from './fixedAmounts.js';

export function loadCategoriesAndSubcategories(categoryId, subcategoryId, jsonPath = 'categories.json') {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById(categoryId);
      const subcategorySelect = document.getElementById(subcategoryId);

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
