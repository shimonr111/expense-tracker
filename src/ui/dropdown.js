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