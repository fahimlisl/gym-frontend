
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
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

const isNative = Capacitor.isNativePlatform();

// Helper to get token from appropriate storage
const getStoredToken = async () => {
  try {
    if (isNative) {
      const { value } = await Preferences.get({ key: "accessToken" });
      return value;
    } else {
      // Web: use localStorage
      return localStorage.getItem("accessToken");
    }
  } catch (error) {
    console.log("Error retrieving token:", error);
    return null;
  }
};

// Helper to set token in appropriate storage
const setStoredToken = async (token) => {
  try {
    if (isNative) {
      await Preferences.set({ key: "accessToken", value: token });
    } else {
      localStorage.setItem("accessToken", token);
    }
  } catch (error) {
    console.log("Error storing token:", error);
  }
};

// Helper to remove token
const removeStoredToken = async () => {
  try {
    if (isNative) {
      await Preferences.remove({ key: "accessToken" });
      await Preferences.remove({ key: "refreshToken" });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  } catch (error) {
    console.log("Error removing token:", error);
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error in request interceptor:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeStoredToken();
    }
    return Promise.reject(error);
  }
);

// Login request
export const loginRequest = async (endpoint, payload) => {
  const { data } = await api.post(endpoint, payload);
  const { accessToken, refreshToken } = data.data;
  
  if (accessToken) {
    await setStoredToken(accessToken);
  }
  if (refreshToken) {
    if (isNative) {
      await Preferences.set({ key: "refreshToken", value: refreshToken });
    } else {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }
  
  return data;
};

export const adminLogout = async () => {
  try {
    const response = await api.post("/admin/logout");
    await removeStoredToken();
    return response;
  } catch (error) {
    await removeStoredToken();
    throw error;
  }
};

export const changePasswordRequest = (payload) =>
  api.patch("/admin/change/password", payload);

export const requestResetToken = async (endpoint, payload) => {
  return await api.post(endpoint, payload);
};

export const resetPasswordRequest = async (endpoint, payload) => {
  return await api.post(endpoint, payload);
};

export const isUserLoggedIn = async () => {
  const token = await getStoredToken();
  return !!token;
};

export const getStoredAccessToken = getStoredToken;