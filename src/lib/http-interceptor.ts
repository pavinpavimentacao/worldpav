import { JWTAuthService } from './jwt-auth-service'

/**
 * Interceptor HTTP para incluir automaticamente o token JWT nas requisições
 */
export class HTTPInterceptor {
  /**
   * Adiciona o token JWT ao header Authorization de uma requisição
   */
  static addAuthHeader(headers: HeadersInit = {}): HeadersInit {
    const token = JWTAuthService.getToken()
    
    if (token) {
      return {
        ...headers,
        'Authorization': `Bearer ${token}`
      }
    }
    
    return headers
  }

  /**
   * Verifica se uma resposta HTTP indica token expirado
   */
  static isTokenExpiredResponse(response: Response): boolean {
    return response.status === 401 || response.status === 403
  }

  /**
   * Intercepta uma resposta HTTP e renova o token se necessário
   */
  static async handleAuthResponse(response: Response): Promise<Response> {
    if (this.isTokenExpiredResponse(response)) {
      try {
        // Tenta renovar o token
        const refreshResult = await JWTAuthService.refreshToken()
        
        if (refreshResult.success) {
          // Retorna a resposta original para que o cliente possa tentar novamente
          return response
        } else {
          // Se não conseguiu renovar, redireciona para login
          await JWTAuthService.logout()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return response
        }
      } catch (error) {
        console.error('Erro ao renovar token:', error)
        await JWTAuthService.logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return response
      }
    }
    
    return response
  }

  /**
   * Wrapper para fetch que inclui automaticamente autenticação JWT
   */
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Adiciona o token JWT aos headers
    const headers = this.addAuthHeader(options.headers)
    
    // Faz a requisição
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    // Verifica se precisa renovar o token
    return this.handleAuthResponse(response)
  }
}

/**
 * Hook para usar o interceptor HTTP em requisições
 */
export function useHTTPInterceptor() {
  return {
    fetch: HTTPInterceptor.fetch,
    addAuthHeader: HTTPInterceptor.addAuthHeader,
    isTokenExpired: HTTPInterceptor.isTokenExpiredResponse
  }
}
