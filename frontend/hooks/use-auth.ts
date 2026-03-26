"use client"

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs"

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken, signOut } = useClerkAuth()

  return {
    user,
    isLoaded,
    isSignedIn,
    getToken,
    signOut,
  }
}
