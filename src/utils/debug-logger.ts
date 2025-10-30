/**
 * Utilitário para logs de depuração formatados
 * Facilita rastreamento de problemas em ambiente de desenvolvimento e produção
 */

// Flag para controlar se os logs são exibidos ou não
// Em produção, pode ser alterado para false
const DEBUG_ENABLED = true;

// Cores para console
const colors = {
  info: '#0066ff',
  success: '#00cc66',
  warning: '#ff9900',
  error: '#ff0033',
  debug: '#9933cc',
};

/**
 * Logger para diagnóstico e depuração
 */
export const debugLogger = {
  /**
   * Log de informação
   */
  info: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[INFO] ${context}:%c ${message}`, 
      `font-weight: bold; color: ${colors.info}`, 
      'color: inherit'
    );
    
    if (data !== undefined) {
      console.log(
        `%c[DATA]:%c`, 
        `font-weight: bold; color: ${colors.info}`, 
        'color: inherit', 
        data
      );
    }
  },
  
  /**
   * Log de sucesso
   */
  success: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[SUCCESS] ${context}:%c ${message}`, 
      `font-weight: bold; color: ${colors.success}`, 
      'color: inherit'
    );
    
    if (data !== undefined) {
      console.log(
        `%c[DATA]:%c`, 
        `font-weight: bold; color: ${colors.success}`, 
        'color: inherit', 
        data
      );
    }
  },
  
  /**
   * Log de aviso
   */
  warning: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[WARNING] ${context}:%c ${message}`, 
      `font-weight: bold; color: ${colors.warning}`, 
      'color: inherit'
    );
    
    if (data !== undefined) {
      console.log(
        `%c[DATA]:%c`, 
        `font-weight: bold; color: ${colors.warning}`, 
        'color: inherit', 
        data
      );
    }
  },
  
  /**
   * Log de erro
   */
  error: (context: string, message: string, error?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[ERROR] ${context}:%c ${message}`, 
      `font-weight: bold; color: ${colors.error}`, 
      'color: inherit'
    );
    
    if (error) {
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(error.stack);
      } else {
        console.error('Error details:', error);
      }
    }
  },
  
  /**
   * Log de depuração com mais detalhes (somente desenvolvimento)
   */
  debug: (context: string, message: string, data?: any) => {
    if (!DEBUG_ENABLED) return;
    
    console.log(
      `%c[DEBUG] ${context}:%c ${message}`, 
      `font-weight: bold; color: ${colors.debug}`, 
      'color: inherit'
    );
    
    if (data !== undefined) {
      console.log(
        `%c[DATA]:%c`, 
        `font-weight: bold; color: ${colors.debug}`, 
        'color: inherit', 
        data
      );
    }
  }
};

// Exportar por padrão
export default debugLogger;

