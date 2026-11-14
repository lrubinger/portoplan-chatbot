import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

/** Rota que exige estar logado; se `superAdminOnly`, exige nível super_admin. */
export const ProtectedRoute: React.FC = () => {
  const { currentUser } = useChat()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/** Rota exclusiva do super administrador: bloqueia acesso direto pela URL. */
export const SuperAdminRoute: React.FC = () => {
  const { currentUser, isSuperAdmin } = useChat()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
          <ShieldAlert className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Acesso restrito</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Esta área é exclusiva do super administrador. Seu nível de acesso atual (
          {currentUser.accessLevel === 'admin' ? 'Administrador' : 'Usuário'}) não permite
          visualizá-la.
        </p>
      </div>
    )
  }

  return <Outlet />
}
