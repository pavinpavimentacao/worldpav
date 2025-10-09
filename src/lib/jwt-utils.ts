import { SignJWT, jwtVerify, decodeJwt } from 'jose'

// Chave JWT fornecida pelo usuário (convertida para Uint8Array)
const JWT_SECRET = new TextEncoder().encode('O385WpSuerqzLGGcKEPR4YOP+50LJ9ABnp9LCXX8pZivZlucyX8Alo3C66Quh/Z0+jJv4mcsY35YZ0KZhVnQ6Q==')

// Interface para o payload do JWT
export interface JWTPayload {
  userId: string
  email: string
  companyId?: string
  fullName?: string
  iat?: number
  exp?: number
}

// Interface para o token decodificado
export interface DecodedToken extends JWTPayload {
  iat: number
  exp: number
}

/**
 * Gera um token JWT para o usuário
 */
export async function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)
    
    return token
  } catch (error) {
    console.error('Erro ao gerar JWT:', error)
    throw new Error('Erro ao gerar token de autenticação')
  }
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyJWT(token: string): Promise<DecodedToken> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as DecodedToken
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('Token expirado')
      } else if (error.message.includes('invalid')) {
        throw new Error('Token inválido')
      }
    }
    console.error('Erro ao verificar JWT:', error)
    throw new Error('Erro ao verificar token')
  }
}

/**
 * Decodifica um token JWT sem verificar a assinatura (para debug)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const decoded = decodeJwt(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error)
    return null
  }
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

/**
 * Extrai o token JWT do header Authorization
 */
export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Cria um header Authorization com o token JWT
 */
export function createAuthHeader(token: string): string {
  return `Bearer ${token}`
}

/**
 * Valida se um token JWT é válido para uso
 */
export async function validateToken(token: string): Promise<{ valid: boolean; error?: string; payload?: DecodedToken }> {
  try {
    const payload = await verifyJWT(token)
    return { valid: true, payload }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Token inválido' 
    }
  }
}

/**
 * Gera um refresh token (com expiração maior)
 */
export async function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    return token
  } catch (error) {
    console.error('Erro ao gerar refresh token:', error)
    throw new Error('Erro ao gerar refresh token')
  }
}

/**
 * Extrai informações do usuário do token JWT
 */
export async function getUserFromToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = await verifyJWT(token)
    return {
      userId: decoded.userId,
      email: decoded.email,
      companyId: decoded.companyId,
      fullName: decoded.fullName
    }
  } catch (error) {
    console.error('Erro ao extrair usuário do token:', error)
    return null
  }
}
