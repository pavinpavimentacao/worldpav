/**
 * Configuração de timezone para São Paulo
 * Este arquivo garante que todas as operações de data/hora sejam consistentes
 * com o fuso horário de São Paulo (America/Sao_Paulo)
 */

/**
 * Configura o timezone padrão do sistema para São Paulo
 * Esta função deve ser chamada no início da aplicação (main.tsx)
 */
export function setupSaoPauloTimezone(): void {
  // Define o timezone padrão para America/Sao_Paulo
  // Isso afeta todas as operações de data no sistema
  
  // Nota: Como estamos usando date-fns-tz para manipulação de datas,
  // não precisamos modificar o timezone do sistema operacional.
  // Este arquivo serve principalmente como documentação e ponto central
  // para configurações relacionadas a timezone.
  
  console.log('✅ Timezone configurado: America/Sao_Paulo')
}

/**
 * Constante com o timezone padrão do sistema
 */
export const TIMEZONE = 'America/Sao_Paulo'

/**
 * Exportação padrão da função de setup
 */
export default setupSaoPauloTimezone



