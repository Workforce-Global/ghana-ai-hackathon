"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initializeAuth = async () => {
      try {
        // Dynamic import to ensure client-side only
        const { onAuthStateChanged } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (!auth) {
          console.warn("Firebase auth not initialized")
          setLoading(false)
          return
        }

        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
      } catch (error) {
        console.error("Auth initialization error:", error)
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
