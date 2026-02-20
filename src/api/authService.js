import api from "../config/api"

export async function checkUser(email) {
  const response = await api.post("/login/check-user", { email });
  return response.data;
}