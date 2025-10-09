import { useAuth } from './auth-hooks'
import { JWTAuthService } from './jwt-auth-service'
import { JWTPayload } from './jwt-utils'
import { useCallback } from 'react'

/**
 * Hook personalizado para trabalhar com JWT
 */
export function useJWT() {
  const { jwtUser, refreshAuth } = useAuth()

  /**
   * Obtém o token JWT atual
   */
  const getToken = useCallback(() => {
    return JWTAuthService.getToken()
  }, [])

  /**
   * Obtém o refresh token atual
   */
  const getRefreshToken = useCallback(() => {
    return JWTAuthService.getRefreshToken()
  }, [])

  /**
   * Verifica se o usuário está autenticado via JWT
   */
  const isAuthenticated = useCallback(() => {
    return JWTAuthService.isAuthenticated()
  }, [])

  /**
   * Obtém dados do usuário do JWT
   */
  const getCurrentUser = useCallback((): JWTPayload | null => {
    return JWTAuthService.getCurrentUser()
  }, [])

  /**
   * Renova o token JWT
   */
  const refreshToken = useCallback(async () => {
    await refreshAuth()
  }, [refreshAuth])

  /**
   * Faz logout e limpa os tokens
   */
  const logout = useCallback(async () => {
    await JWTAuthService.logout()
  }, [])

  return {
    jwtUser,
    getToken,
    getRefreshToken,
    isAuthenticated,
    getCurrentUser,
    refreshToken,
    logout
  }
}

/**
 * Hook para obter informações do usuário JWT
 */
export function useJWTUser() {
  const { jwtUser } = useAuth()
  
  return {
    user: jwtUser,
    userId: jwtUser?.userId,
    email: jwtUser?.email,
    companyId: jwtUser?.companyId,
    fullName: jwtUser?.fullName,
    isAuthenticated: !!jwtUser
  }
}




