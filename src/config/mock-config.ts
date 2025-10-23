/**
 * Configuração centralizada de Mocks
 * Altere USE_MOCK para false quando o banco de dados estiver configurado
 */

export const USE_MOCK = false;

/**
 * Helper para log de operações mockadas
 */
export function logMockOperation(operation: string, details?: any) {
  if (USE_MOCK) {
    console.log(`✅ [MOCK] ${operation}`, details || '');
  }
}

/**
 * Helper para simular delay de operações
 */
export async function mockDelay(ms: number = 500) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}



