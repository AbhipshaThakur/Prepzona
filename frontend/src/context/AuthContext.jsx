import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getMe } from "@/services/ApiService"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      getMe().then(data => {
        if (data?.id) setUser(data)
        else clearAuth()
      }).catch(() => {
        clearAuth()
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [clearAuth])

  const login = (userData, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
