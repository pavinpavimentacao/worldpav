import { type ClassValue, clsx } from "clsx"
import { decodeJWT } from './jwt-utils';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Obtém o company_id atual do usuário logado através do JWT
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      // Se não tem token, usar o company_id padrão do WorldPav
      const { WORLDPAV_COMPANY_ID } = await import('./company-utils');
      console.log('⚠️ Token não encontrado, usando WorldPav como padrão:', WORLDPAV_COMPANY_ID);
      return WORLDPAV_COMPANY_ID;
    }

    const decoded = decodeJWT(token);
    const companyId = decoded?.companyId || null;
    
    if (!companyId) {
      // Se não tem companyId no token, usar o padrão do WorldPav
      const { WORLDPAV_COMPANY_ID } = await import('./company-utils');
      console.log('⚠️ Company ID não encontrado no token, usando WorldPav como padrão:', WORLDPAV_COMPANY_ID);
      return WORLDPAV_COMPANY_ID;
    }
    
    return companyId;
  } catch (error) {
    console.error('Erro ao obter company_id:', error);
    // Em caso de erro, usar o padrão do WorldPav
    const { WORLDPAV_COMPANY_ID } = await import('./company-utils');
    return WORLDPAV_COMPANY_ID;
  }
}

/**
 * Obtém o user_id atual do usuário logado através do JWT
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error('Erro ao obter user_id:', error);
    return null;
  }
}

