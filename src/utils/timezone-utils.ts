/**
 * Utilitários para manipulação de datas com timezone
 * Garante que todas as operações de data/hora sejam consistentes com o timezone de São Paulo
 */

import { SYSTEM_TIMEZONE } from '../config/timezone';

/**
 * Obtém a data atual no timezone de São Paulo
 * @returns Data atual no formato YYYY-MM-DD
 */
export function getCurrentDateISOInSaoPauloTimezone(): string {
  // Cria uma data no timezone local
  const now = new Date();
  
  // Ajusta para o timezone de São Paulo (UTC-3)
  // São Paulo está 3 horas atrás do UTC
  const saoPauloOffset = -3 * 60; // minutos
  const localOffset = now.getTimezoneOffset(); // minutos
  const totalOffset = saoPauloOffset - localOffset; // diferença em minutos
  
  // Ajusta a data para o timezone de São Paulo
  const saoPauloDate = new Date(now.getTime() + totalOffset * 60 * 1000);
  
  // Formata como YYYY-MM-DD
  const year = saoPauloDate.getFullYear();
  const month = String(saoPauloDate.getMonth() + 1).padStart(2, '0');
  const day = String(saoPauloDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formata a data atual no timezone de São Paulo no formato DD/MM/YYYY
 * @returns String no formato "DD/MM/YYYY"
 */
export function getCurrentDateBRInSaoPauloTimezone(): string {
  // Obter a data ISO e converter para formato BR
  const isoDate = getCurrentDateISOInSaoPauloTimezone();
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}