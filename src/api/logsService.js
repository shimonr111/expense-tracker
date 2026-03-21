import api from "../config/api"

export async function fetchLogs() {
    const response = await api.get("/expenses/get-logs");
    return response.data;
}