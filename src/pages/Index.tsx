import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/context/ChatContext'

export default function Index() {
  const { currentUser } = useChat()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate('/inbox', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [currentUser, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-sm">
      Carregando Painel de Atendimento...
    </div>
  )
}
