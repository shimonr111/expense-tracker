export function loadCategoriesAndSubcategories(categoryId, subcategoryId, jsonPath = 'categories.json') {
  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const categorySelect = document.getElementById(categoryId);
      const subcategorySelect = document.getElementById(subcategoryId);

      // Fill categories
      categorySelect.innerHTML = '<option value="">Select category</option>';
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
          subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
          data[selectedCat].forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
          });
        } else {
          subcategorySelect.disabled = true;
          subcategorySelect.innerHTML = '<option value="">No subcategories</option>';
        }
      });
    })
    .catch(error => console.error("Failed to load categories:", error));
}
