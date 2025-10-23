/**
 * Exemplos de uso da integração JWT
 * 
 * Este arquivo demonstra como usar as funcionalidades JWT implementadas
 */

import { JWTAuthService, LoginCredentials } from '../../lib/jwt-auth-service'
import { HTTPInterceptor } from '../../lib/http-interceptor'
import { useJWT, useJWTUser } from '../../lib/jwt-hooks'

// ===== EXEMPLO 1: Login com JWT =====
export async function exemploLogin() {
  const credentials: LoginCredentials = {
    email: 'usuario@exemplo.com',
    password: 'senha123'
  }

  try {
    const result = await JWTAuthService.login(credentials)
    
    if (result.success) {
      console.log('Login realizado com sucesso!')
      console.log('Token:', result.token)
      console.log('Refresh Token:', result.refreshToken)
      console.log('Usuário:', result.user)
    } else {
      console.error('Erro no login:', result.error)
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// ===== EXEMPLO 2: Cadastro com JWT =====
export async function exemploCadastro() {
  const userData = {
    email: 'novo@exemplo.com',
    password: 'senha123',
    fullName: 'João Silva',
    companyName: 'Empresa Exemplo'
  }

  try {
    const result = await JWTAuthService.signUp(userData)
    
    if (result.success) {
      console.log('Cadastro realizado com sucesso!')
      console.log('Usuário:', result.user)
    } else {
      console.error('Erro no cadastro:', result.error)
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// ===== EXEMPLO 3: Renovação de Token =====
export async function exemploRenovarToken() {
  try {
    const result = await JWTAuthService.refreshToken()
    
    if (result.success) {
      console.log('Token renovado com sucesso!')
      console.log('Novo Token:', result.token)
    } else {
      console.error('Erro ao renovar token:', result.error)
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// ===== EXEMPLO 4: Requisições HTTP com JWT =====
export async function exemploRequisiçãoHTTP() {
  try {
    // Faz uma requisição que automaticamente inclui o token JWT
    const response = await HTTPInterceptor.fetch('/api/dados', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Dados recebidos:', data)
    } else {
      console.error('Erro na requisição:', response.status)
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// ===== EXEMPLO 5: Uso em Componente React =====
export function ExemploComponenteReact() {
  // Hook para trabalhar com JWT
  const { getToken, isAuthenticated, refreshToken } = useJWT()
  
  // Hook para obter dados do usuário
  const { user, userId, email, companyId, fullName } = useJWTUser()

  const handleRenovarToken = async () => {
    try {
      await refreshToken()
      console.log('Token renovado!')
    } catch (error) {
      console.error('Erro ao renovar token:', error)
    }
  }

  const handleFazerRequisição = async () => {
    if (!isAuthenticated()) {
      console.log('Usuário não autenticado')
      return
    }

    try {
      const token = getToken()
      console.log('Token atual:', token)
      
      // Faz requisição com token JWT
      const response = await HTTPInterceptor.fetch('/api/protegido', {
        method: 'GET'
      })

      const data = await response.json()
      console.log('Dados protegidos:', data)
    } catch (error) {
      console.error('Erro na requisição:', error)
    }
  }

  return {
    user,
    userId,
    email,
    companyId,
    fullName,
    isAuthenticated: isAuthenticated(),
    handleRenovarToken,
    handleFazerRequisição
  }
}

// ===== EXEMPLO 6: Verificação de Token =====
export function exemploVerificacaoToken() {
  const token = JWTAuthService.getToken()
  
  if (token) {
    const user = JWTAuthService.getCurrentUser()
    console.log('Usuário autenticado:', user)
    
    const isValid = JWTAuthService.isAuthenticated()
    console.log('Token válido:', isValid)
  } else {
    console.log('Nenhum token encontrado')
  }
}

// ===== EXEMPLO 7: Logout =====
export async function exemploLogout() {
  try {
    await JWTAuthService.logout()
    console.log('Logout realizado com sucesso!')
  } catch (error) {
    console.error('Erro no logout:', error)
  }
}

// ===== EXEMPLO 8: Interceptor em Axios (se estiver usando) =====
export function exemploAxiosInterceptor() {
  // Se você estiver usando Axios, pode configurar um interceptor assim:
  /*
  import axios from 'axios'

  axios.interceptors.request.use((config) => {
    const token = JWTAuthService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        try {
          await JWTAuthService.refreshToken()
          // Tenta a requisição novamente
          return axios.request(error.config)
        } catch (refreshError) {
          await JWTAuthService.logout()
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )
  */
}




