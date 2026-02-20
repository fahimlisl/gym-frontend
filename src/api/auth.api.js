
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});


// will be shifting  admin things to admin.api.js
export const loginRequest = async (endpoint, payload) => {
  const { data } = await api.post(endpoint, payload);
  return data;
};


export const adminLogout = () =>
  api.post("/admin/logout");

export const changePasswordRequest = (payload) =>
  api.patch("/admin/change/password", payload);



export const requestResetToken = async (endpoint, payload) => {
  return await api.post(endpoint, payload);
};

export const resetPasswordRequest = async (endpoint, payload) => {
  return await api.post(endpoint, payload);
};
