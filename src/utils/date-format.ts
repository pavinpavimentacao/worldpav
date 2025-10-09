/**
 * Utilitários para formatação de datas
 * Resolve problemas de timezone ao exibir datas no frontend
 */

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 * SEM passar pelo objeto Date do JavaScript (evita problemas de timezone)
 * 
 * @param dateString - Data no formato "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss"
 * @returns String no formato "DD/MM/YYYY"
 */
export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  // Remove a parte do horário se existir
  const datePart = dateString.split('T')[0];
  
  // Divide a data em partes
  const [year, month, day] = datePart.split('-');
  
  // Retorna no formato brasileiro
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data usando o objeto Date (para datas com hora)
 * Adiciona o timezone offset para evitar mudança de dia
 * 
 * @param dateString - Data no formato ISO
 * @returns String no formato "DD/MM/YYYY"
 */
export function formatDateTimeBR(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  
  // Adiciona o offset do timezone para corrigir a data
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  
  return localDate.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data do banco (YYYY-MM-DD) para exibição local
 * Usa abordagem segura sem conversão de timezone
 * 
 * @param dateString - Data no formato "YYYY-MM-DD"
 * @returns String no formato "DD/MM/YYYY"
 */
export function formatDatabaseDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  // Se a data tem horário, usa parseISO
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    // Força interpretação como data local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Se é apenas data (YYYY-MM-DD), converte diretamente
  return formatDateBR(dateString);
}

/**
 * Converte uma data do formato DD/MM/YYYY para YYYY-MM-DD
 * Útil para enviar datas para o backend
 * 
 * @param brDate - Data no formato "DD/MM/YYYY"
 * @returns String no formato "YYYY-MM-DD"
 */
export function formatDateToISO(brDate: string): string {
  if (!brDate) return '';
  
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Formata data e hora completa
 * 
 * @param dateString - Data no formato ISO
 * @returns String no formato "DD/MM/YYYY HH:mm"
 */
export function formatDateTimeFullBR(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

