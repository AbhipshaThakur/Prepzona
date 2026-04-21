import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "./components/Dashboard"
import Login     from "./components/Login"
import Home      from "./components/Home"
import Interview from "./components/Interview"
import Stats     from "./components/Stats"
import Feedback  from "./components/Feedback"

import ThemeProvider             from "./theme/ThemeProvider"
import { AuthProvider, useAuth } from "./context/AuthContext"
import AppBackground             from "./components/layout/AppBackground"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <AppBackground>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/stats"     element={<Stats />} />
        <Route path="/feedback"  element={<Feedback />} />
        <Route path="/home"      element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AppBackground>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App