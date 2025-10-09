import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { useToast } from './toast-hooks'
import { JWTAuthService, LoginCredentials, SignUpData } from './jwt-auth-service'
import { JWTPayload } from './jwt-utils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  jwtUser: JWTPayload | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [jwtUser, setJwtUser] = useState<JWTPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    // Função para verificar e carregar dados JWT
    const checkJWTAuth = async () => {
      try {
        const currentJwtUser = JWTAuthService.getCurrentUser()
        if (currentJwtUser) {
          setJwtUser(currentJwtUser)
        }
      } catch (error) {
        console.warn('Erro ao verificar JWT:', error)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkJWTAuth()
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkJWTAuth()
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Usa o serviço JWT para autenticação
      const result = await JWTAuthService.login({ email, password })
      
      if (!result.success) {
        addToast({
          message: result.error || 'Erro no login',
          type: 'error'
        })
        throw new Error(result.error || 'Erro no login')
      }

      // Atualiza o estado com os dados do usuário JWT
      if (result.user) {
        setJwtUser({
          userId: result.user.id,
          email: result.user.email,
          companyId: result.user.companyId,
          fullName: result.user.fullName
        })
      }

      addToast({
        message: 'Login realizado com sucesso!',
        type: 'success'
      })
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      setLoading(true)
      
      // Usa o serviço JWT para cadastro
      const result = await JWTAuthService.signUp({
        email,
        password,
        fullName: metadata?.full_name
      })

      if (!result.success) {
        addToast({
          message: result.error || 'Erro no cadastro',
          type: 'error'
        })
        throw new Error(result.error || 'Erro no cadastro')
      }

      addToast({
        message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
        type: 'success'
      })
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Usa o serviço JWT para logout
      await JWTAuthService.logout()
      
      // Limpa o estado JWT
      setJwtUser(null)

      addToast({
        message: 'Logout realizado com sucesso!',
        type: 'success'
      })
    } catch (error) {
      console.error('Sign out error:', error)
      addToast({
        message: 'Erro ao fazer logout',
        type: 'error'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    try {
      const result = await JWTAuthService.refreshToken()
      
      if (result.success && result.user) {
        setJwtUser({
          userId: result.user.id,
          email: result.user.email,
          companyId: result.user.companyId,
          fullName: result.user.fullName
        })
      } else {
        // Se não conseguiu renovar, faz logout
        await signOut()
      }
    } catch (error) {
      console.error('Erro ao renovar autenticação:', error)
      await signOut()
    }
  }

  const value = {
    user,
    session,
    loading,
    jwtUser,
    signIn,
    signUp,
    signOut,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

