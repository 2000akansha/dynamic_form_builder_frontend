import axios from "axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { store } from "../redux/store";
import { userLogout } from "../redux/apis/auth";
import { setAccessToken } from "../redux/slices/userDetailsSlice";
import toast from "react-hot-toast";
import { showSingleSessionModal } from "../components/ShowSingleSessionModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const SECRET_KEY = import.meta.env.VITE_HMAC_SECRET_KEY;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1/`,
  withCredentials: true,
});

let csrfTokenCache = null;
let csrfTokenPromise = null;

const formDataToString = (formData) => {
  const sortedEntries = [...formData.entries()]
    .map(([key, value]) => {
      if (value instanceof File) {
        return `${key}=${value.name}`;
      }
      return `${key}=${value}`;
    })
    .sort((a, b) => a.localeCompare(b))
    .join("&");
  return sortedEntries;
};

const getCsrfToken = async () => {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = (async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/csrf-token`, {
        withCredentials: true,
        headers: {
          skipAuth: true,
          "Content-Type": "application/json",
        },
      });

      csrfTokenCache = res.data.csrfToken;
      return csrfTokenCache;
    } catch (err) {
      csrfTokenCache = null;
      throw err;
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
};

const clearCsrfToken = () => {
  csrfTokenCache = null;
  csrfTokenPromise = null;
};

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.headers["skipAuth"]) {
      const state = store.getState();
      const token = state.userDetailsSlice.details.accessToken;

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } else {
      delete config.headers["skipAuth"];
    }

    let payloadString;
    if (config.data instanceof FormData) {
      payloadString = formDataToString(config.data);
    } else {
      payloadString = JSON.stringify(config.data || {});
    }

    if (!payloadString || payloadString === "{}" || payloadString === "null") {
      payloadString = "";
    }

    const hash = CryptoJS.HmacSHA256(payloadString, SECRET_KEY).toString();
    config.headers["X-Signature"] = hash;

    const unsafeMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (unsafeMethods.includes(config.method.toUpperCase())) {
      if (!config.headers["Content-Type"]?.includes("multipart/form-data")) {
        try {
          const csrfToken = await getCsrfToken();
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        } catch (err) {}
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      (error.response?.data?.code === "CSRF_ERROR" ||
        error.response?.data?.message?.includes("CSRF"))
    ) {
      clearCsrfToken();
      if (!originalRequest._csrfRetry) {
        originalRequest._csrfRetry = true;
        try {
          const csrfToken = await getCsrfToken();
          if (csrfToken) {
            originalRequest.headers["X-CSRF-Token"] = csrfToken;
            return apiClient(originalRequest);
          }
        } catch {}
      }
    }

    // Do not trigger blocking modals on 401; allow caller to handle auth
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "SINGLE_SESSION_VIOLATION"
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Something went wrong";

    toast.error(message);

    return Promise.reject(error);
  }
);
export default apiClient;
