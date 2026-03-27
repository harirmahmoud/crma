import axios from "axios"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // If we are in the browser, extracting token from document.cookie
    if (typeof window !== "undefined") {
      const tokenMatch = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

    }
    // Alternatively for server-side usage, we'd pass token explicitly.
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401 - only in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
