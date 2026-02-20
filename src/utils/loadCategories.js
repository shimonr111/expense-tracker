import { fetchExpenses } from "../api/expensesService.js";
import { mapCategories } from "../services/expensesMapper.js";
import { ensureMonthlyReset } from "../services/expenseMaintenanceService.js";
import { populateCategoryDropdown, populateSubcategoryDropdown} from "../ui/dropdown.js"
import { getSessionCache, setSessionCache } from "./cache.js";

// This function initialize the combo boxes of category and subcategory
export async function initializeCategoryDropdowns(ignoreFixedAmount) {
  // Use different sessionStorage keys for Home and Edit pages
  const categoriesCacheKey = ignoreFixedAmount ? "categories_home" : "categories_edit";
  const subcategoriesCacheKey = ignoreFixedAmount ? "subcategories_home" : "subcategories_edit";
  // Fetch cached data for categories and subcategories based on the current page
  const cachedCategories = getSessionCache(categoriesCacheKey);
  const cachedSubcategories = getSessionCache(subcategoriesCacheKey);

  const categorySelect = document.getElementById('category');
  const subcategorySelect = document.getElementById('subcategory');
  
  if (cachedCategories && cachedSubcategories) { // Use the cached data from Home page
    console.log(`Using cached data from ${ignoreFixedAmount ? 'home' : 'edit'} page...`);
    const categoriesData = cachedCategories;
    const subcategoriesData = cachedSubcategories;
    populateCategoryDropdown(categorySelect, categoriesData);
    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      populateSubcategoryDropdown(subcategorySelect, subcategoriesData[selectedCategory] || {});
    });
  }

  else { // There is no cached data so fetch from firebase
    console.log("Fetching from Firebase first...")
    const { categories, subcategories } = await loadCategoriesAndSubcategories('category', 'subcategory', ignoreFixedAmount);
    setSessionCache(categoriesCacheKey, categories);
    setSessionCache(subcategoriesCacheKey, subcategories);
  }
}

// This function responsible to load data from DB in firebase and load it into the combo boxes of category and subcategory
export async function loadCategoriesAndSubcategories(categoryId, subcategoryId, ignoreFixedAmount) {
  const categorySelect = document.getElementById(categoryId);
  const subcategorySelect = document.getElementById(subcategoryId);
  await ensureMonthlyReset();

  try {
    const data = await fetchExpenses();
    if (!data) return;

    const { categories, subcategories } = mapCategories(data, ignoreFixedAmount);

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