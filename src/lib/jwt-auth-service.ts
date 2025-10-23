import { supabase } from './supabase'
import { generateJWT, generateRefreshToken, verifyJWT, JWTPayload, decodeJWT, isTokenExpired } from './jwt-utils'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  token?: string
  refreshToken?: string
  user?: {
    id: string
    email: string
    fullName?: string
    companyId?: string
  }
  error?: string
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
  companyName?: string
}

/**
 * Serviço de autenticação JWT integrado com Supabase
 */
export class JWTAuthService {
  private static readonly TOKEN_KEY = 'jwt_token'
  private static readonly REFRESH_TOKEN_KEY = 'jwt_refresh_token'

  /**
   * Realiza login do usuário e gera tokens JWT
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Autentica com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        return {
          success: false,
          error: authError.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Usuário não encontrado'
        }
      }

      // Busca dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_id')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.warn('Erro ao buscar dados do usuário:', userError)
        // Continua mesmo sem dados adicionais
      }

      // Prepara payload para JWT
      const jwtPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: authData.user.id,
        email: authData.user.email || credentials.email,
        companyId: userData?.company_id,
        fullName: userData?.full_name || authData.user.user_metadata?.full_name
      }

      // Gera tokens JWT
      const token = await generateJWT(jwtPayload)
      const refreshToken = await generateRefreshToken(jwtPayload)

      // Armazena tokens no localStorage
      this.storeTokens(token, refreshToken)

      return {
        success: true,
        token,
        refreshToken,
        user: {
          id: authData.user.id,
          email: authData.user.email || credentials.email,
          fullName: userData?.full_name || authData.user.user_metadata?.full_name,
          companyId: userData?.company_id
        }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no login'
      }
    }
  }

  /**
   * Registra um novo usuário
   */
  static async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Cria usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName
          }
        }
      })

      if (authError) {
        return {
          success: false,
          error: authError.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Erro ao criar usuário'
        }
      }

      // Se uma empresa foi fornecida, cria ou busca a empresa
      let companyId = null
      if (data.companyName) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('name', data.companyName)
          .single()

        if (companyError && companyError.code === 'PGRST116') {
          // Empresa não existe, cria uma nova
          const { data: newCompany, error: createCompanyError } = await supabase
            .from('companies')
            .insert({ name: data.companyName })
            .select('id')
            .single()

          if (createCompanyError) {
            console.error('Erro ao criar empresa:', createCompanyError)
          } else {
            companyId = newCompany?.id
          }
        } else if (companyData) {
          companyId = companyData.id
        }
      }

      // Cria entrada na tabela users
      const { error: userError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          company_id: companyId
        })

      if (userError) {
        console.warn('Erro ao criar dados do usuário:', userError)
        // Continua mesmo com erro
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: data.email,
          fullName: data.fullName,
          companyId
        }
      }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no cadastro'
      }
    }
  }

  /**
   * Renova o token usando o refresh token
   */
  static async refreshToken(): Promise<AuthResult> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        return {
          success: false,
          error: 'Refresh token não encontrado'
        }
      }

      // Verifica o refresh token
      const decoded = verifyJWT(refreshToken)
      
      // Busca dados atualizados do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_id')
        .eq('id', decoded.userId)
        .single()

      if (userError) {
        return {
          success: false,
          error: 'Erro ao buscar dados do usuário'
        }
      }

      // Gera novos tokens
      const newToken = await generateJWT({
        userId: decoded.userId,
        email: decoded.email,
        companyId: userData?.company_id,
        fullName: userData?.full_name
      })

      const newRefreshToken = await generateRefreshToken({
        userId: decoded.userId,
        email: decoded.email,
        companyId: userData?.company_id,
        fullName: userData?.full_name
      })

      // Armazena novos tokens
      this.storeTokens(newToken, newRefreshToken)

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: decoded.userId,
          email: decoded.email,
          fullName: userData?.full_name,
          companyId: userData?.company_id
        }
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return {
        success: false,
        error: 'Erro ao renovar token'
      }
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(): Promise<void> {
    try {
      // Remove tokens do localStorage
      this.clearTokens()
      
      // Faz logout do Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  /**
   * Obtém o token atual
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Obtém o refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Armazena tokens no localStorage
   */
  private static storeTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.TOKEN_KEY, token)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  /**
   * Remove tokens do localStorage
   */
  private static clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    // Verifica se o token não está expirado (sem fazer verificação completa)
    return !isTokenExpired(token)
  }

  /**
   * Obtém dados do usuário do token atual
   */
  static getCurrentUser(): JWTPayload | null {
    const token = this.getToken()
    if (!token) return null

    // Decodifica sem verificar assinatura para performance
    return decodeJWT(token)
  }
}
