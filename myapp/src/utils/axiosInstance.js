import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    // ✅ Public routes where token should NOT be sent
    const publicRoutes = [
      "/auth/login",
      "/auth/register",
      "/oauth2",
    ];

    const isPublic = publicRoutes.some((route) =>
      config.url?.includes(route)
    );

    // ✅ Attach token ONLY for protected routes
    if (!isPublic && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Do not force redirect here. Let page-level handlers decide the UX.
        // This avoids abrupt navigation during match polling/start flows.
        console.warn("Unauthorized request:", error.config?.url || "unknown-endpoint");
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
