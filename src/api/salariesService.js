import api from "../config/api";

export async function fetchSalaries() {
  const response = await api.get("/salaries/get-salaries");
  return response.data;
}