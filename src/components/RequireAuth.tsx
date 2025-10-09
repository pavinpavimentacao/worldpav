import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-hooks'
import { Loading } from './Loading'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, jwtUser, loading } = useAuth()

  if (loading) {
    return <Loading size="lg" text="Verificando autenticação..." />
  }

  // Verifica tanto o usuário Supabase quanto o JWT
  if (!user && !jwtUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}








