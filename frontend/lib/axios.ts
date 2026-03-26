import axios from "axios"
import { auth } from "@clerk/nextjs/server"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the session token from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

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
