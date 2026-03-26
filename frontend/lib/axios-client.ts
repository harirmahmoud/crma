import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token (client-side)
axiosClient.interceptors.request.use(
  async (config) => {
    // Get the session token from Clerk client-side
    if (typeof window !== "undefined") {
      try {
        const { Clerk } = window as any
        if (Clerk?.session) {
          const token = await Clerk.session.getToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch (error) {
        console.error("[v0] Error getting Clerk token:", error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient
