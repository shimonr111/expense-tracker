import api from "../config/api"

export async function checkUser(firebaseToken) {
  const response = await api.post("/login/check-user", { firebaseToken });
  return response.data;
}