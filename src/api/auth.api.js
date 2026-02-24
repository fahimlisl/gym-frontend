
// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });


// // will be shifting  admin things to admin.api.js
// export const loginRequest = async (endpoint, payload) => {
//   const { data } = await api.post(endpoint, payload);
//   return data;
// };


// export const adminLogout = () =>
//   api.post("/admin/logout");

// export const changePasswordRequest = (payload) =>
//   api.patch("/admin/change/password", payload);



// export const requestResetToken = async (endpoint, payload) => {
//   return await api.post(endpoint, payload);
// };

// export const resetPasswordRequest = async (endpoint, payload) => {
//   return await api.post(endpoint, payload);
// };

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request interceptor - attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log("Sending token:", token); // debug line
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - clear token on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    return Promise.reject(error);
  }
);

// Login - store token in localStorage
export const loginRequest = async (endpoint, payload) => {
  const response = await api.post(endpoint, payload);

  console.log("FULL LOGIN RESPONSE:", response.data);

  const accessToken = response.data?.accessToken || response.data?.data?.accessToken;
  const refreshToken = response.data?.refreshToken || response.data?.data?.refreshToken;

  console.log("Extracted tokens:", accessToken, refreshToken);

  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

  return response.data;
};

export const adminLogout = async () => {
  try {
    const response = await api.post("/admin/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return response;
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

export const changePasswordRequest = (payload) =>
  api.patch("/admin/change/password", payload);

export const requestResetToken = async (endpoint, payload) =>
  await api.post(endpoint, payload);

export const resetPasswordRequest = async (endpoint, payload) =>
  await api.post(endpoint, payload);

export const isUserLoggedIn = () => !!localStorage.getItem("accessToken");