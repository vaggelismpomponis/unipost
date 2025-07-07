import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Box, Skeleton } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute 