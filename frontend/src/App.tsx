import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './components/ProfileSetup'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import GradesFetchPage from './pages/GradesFetchPage'

function App() {
  const { checkUser } = useAuthStore()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />
        <Route path="/grades-fetch" element={<GradesFetchPage />} />
      </Routes>
    </Box>
  )
}

export default App 