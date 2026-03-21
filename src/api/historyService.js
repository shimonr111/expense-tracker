import api from "../config/api"

export async function fetchHistory() {
    const response = await api.get("/expenses/get-history");
    return response.data;
}