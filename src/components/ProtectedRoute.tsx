import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useChat } from '@/context/ChatContext'

export const ProtectedRoute: React.FC = () => {
  const { currentUser } = useChat()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
