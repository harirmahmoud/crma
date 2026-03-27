"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, setUser] = useState<{ username?: string; id?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(?:^|; )auth_token=([^;]*)/)
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

    if (token) {
      setIsSignedIn(true)
      // Mocking user object for now; ideally we fetch from backend or decode JWT
      setUser({ username: "user" })
    } else {
      setIsSignedIn(false)
      setUser(null)
    }

    setIsLoaded(true)
  }, [])

  const getToken = async () => {
    const tokenMatch = document.cookie.match(/(?:^|; )auth_token=([^;]*)/)
    return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null
  }

  const signOut = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsSignedIn(false)
    setUser(null)
    router.push("/login")
  }

  return {
    user,
    isLoaded,
    isSignedIn,
    getToken,
    signOut,
  }
}
