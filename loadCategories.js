export function loadCategories(selectId, jsonPath = 'categories.json') {
  fetch(jsonPath)
    .then(response => response.json())
    .then(categories => {
      const select = document.getElementById(selectId);
      if (!select) return;

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Failed to load categories:", error);
    });
}
