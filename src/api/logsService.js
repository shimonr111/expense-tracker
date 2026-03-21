import api from "../config/api"

export async function fetchLogs() {
    const response = await api.get("/logs/get-logs");
    return response.data;
}