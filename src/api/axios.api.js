// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   //   headers: {
//   //   'Content-Type': 'application/json',
//   // },
//   withCredentials: true,
// });

// export default api;

import axios from "axios";
import { getPanelScope } from "../utils/panelScope";

const baseURL = import.meta.env.VITE_API_URL;

// Normal API client
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Separate client ONLY for refresh.
// No interceptor attached to this one.
const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

const getRefreshEndpoint = () => {
  const role = getPanelScope();

  switch (role) {
    case "admin":
      return "/admin/refresh";

    case "trainer":
      return "/trainer/refresh";

    case "member":
    case "user":
      return "/user/refresh";

    default:
      return "/user/refresh";
  }
};

// Prevent multiple simultaneous refresh requests
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    /*
      Never try refreshing the refresh request itself.
    */
    if (
      originalRequest?.url?.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    /*
      Don't refresh login/reset-password failures.
    */
    if (
      originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes(
        "/reset/password"
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post(getRefreshEndpoint())
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      /*
        Refresh succeeded.
        Retry the original request.
      */
      return api(originalRequest);

    } catch (refreshError) {

      /*
        IMPORTANT FIX

        If Login.jsx itself caused the
        session check, we're already at /login.

        Don't reload /login again.
      */
      if (
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;