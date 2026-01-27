
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const loginRequest = async (endpoint, payload) => {
  const { data } = await api.post(endpoint, payload);
  return data;
};


export const adminLogout = () =>
  api.post("/admin/logout");
