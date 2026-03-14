import { fetchExpenses } from "../api/expensesService.js";
import { fetchSalaries } from "../api/salariesService.js";

export const getStatsData = async () => {
    // Get reference to the expenses in the data base
    const expenses = await fetchExpenses();
    const salaries = await fetchSalaries();

    const categoryTotals = {};
    let grandTotal = 0;

    // Iterate over subcategories and calc the amount for each category, in addition calc the total amount
    for (const category in expenses) {
        const subcategories = expenses[category];
        let categorySum = 0;

        for (const subcategory in subcategories) {
            const amount = subcategories[subcategory]?.amount ?? 0;
            categorySum += parseFloat(amount) || 0;
        }

        categoryTotals[category] = (categoryTotals[category] || 0) + categorySum;
        grandTotal += categorySum;
    }

    // Convert to recharts format
    const formattedData = Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category,
        amount: parseFloat(amount.toFixed(2)),
        subcategories: Object.entries(expenses[category]).map(([sub, obj]) => ({
            name: sub,
            amount: parseFloat(obj?.amount ?? 0)
        }))
    }));

    let salariesTotal = 0;
    salariesTotal = Object.values(salaries).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const calculatedProfits = (salariesTotal - grandTotal).toFixed(2);

    return { formattedData, grandTotal, salariesTotal, calculatedProfits };
}