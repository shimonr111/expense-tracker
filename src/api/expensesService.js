import api from "../config/api"

export async function fetchExpenses() {
    const response = await api.get("/expenses/get-expenses");
    return response.data;
}

export async function resetExpenses() {
    const response = await api.post("/expenses/monthly-reset");
    return response.data;
}