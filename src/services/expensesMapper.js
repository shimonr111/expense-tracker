export function mapCategories(data, ignoreFixedAmount) {
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

  return { categories, subcategories };
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
