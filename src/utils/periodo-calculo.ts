/**
 * Utilitários para cálculo de períodos de pagamento
 * 
 * Horas Extras: inicia dia 26 do mês atual e termina dia 25 do mês seguinte
 * Diárias: inicia dia 21 do mês atual e termina dia 20 do mês seguinte
 */

/**
 * Calcula o período de horas extras para uma data específica
 * Período: dia 26 do mês atual até dia 25 do mês seguinte
 * 
 * @param data - Data de referência (Date ou string YYYY-MM-DD)
 * @returns Objeto com dataInicio e dataFim do período
 */
export function calcularPeriodoHorasExtras(data: Date | string): { dataInicio: string; dataFim: string } {
  const dataRef = typeof data === 'string' ? new Date(data + 'T12:00:00') : data;
  
  const ano = dataRef.getFullYear();
  const mes = dataRef.getMonth(); // 0-11
  const dia = dataRef.getDate();
  
  let dataInicio: Date;
  let dataFim: Date;
  
  // Se a data está entre dia 1-25, o período é do dia 26 do mês anterior até dia 25 do mês atual
  // Se a data está entre dia 26-31, o período é do dia 26 do mês atual até dia 25 do mês seguinte
  if (dia <= 25) {
    // Período anterior: dia 26 do mês anterior até dia 25 do mês atual
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoInicio = mes === 0 ? ano - 1 : ano;
    
    dataInicio = new Date(anoInicio, mesAnterior, 26);
    dataFim = new Date(ano, mes, 25);
  } else {
    // Período atual: dia 26 do mês atual até dia 25 do mês seguinte
    const mesSeguinte = mes === 11 ? 0 : mes + 1;
    const anoFim = mes === 11 ? ano + 1 : ano;
    
    dataInicio = new Date(ano, mes, 26);
    dataFim = new Date(anoFim, mesSeguinte, 25);
  }
  
  return {
    dataInicio: formatarData(dataInicio),
    dataFim: formatarData(dataFim)
  };
}

/**
 * Calcula o período de diárias para uma data específica
 * Período: dia 21 do mês atual até dia 20 do mês seguinte
 * 
 * @param data - Data de referência (Date ou string YYYY-MM-DD)
 * @returns Objeto com dataInicio e dataFim do período
 */
export function calcularPeriodoDiarias(data: Date | string): { dataInicio: string; dataFim: string } {
  const dataRef = typeof data === 'string' ? new Date(data + 'T12:00:00') : data;
  
  const ano = dataRef.getFullYear();
  const mes = dataRef.getMonth(); // 0-11
  const dia = dataRef.getDate();
  
  let dataInicio: Date;
  let dataFim: Date;
  
  // Se a data está entre dia 1-20, o período é do dia 21 do mês anterior até dia 20 do mês atual
  // Se a data está entre dia 21-31, o período é do dia 21 do mês atual até dia 20 do mês seguinte
  if (dia <= 20) {
    // Período anterior: dia 21 do mês anterior até dia 20 do mês atual
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoInicio = mes === 0 ? ano - 1 : ano;
    
    dataInicio = new Date(anoInicio, mesAnterior, 21);
    dataFim = new Date(ano, mes, 20);
  } else {
    // Período atual: dia 21 do mês atual até dia 20 do mês seguinte
    const mesSeguinte = mes === 11 ? 0 : mes + 1;
    const anoFim = mes === 11 ? ano + 1 : ano;
    
    dataInicio = new Date(ano, mes, 21);
    dataFim = new Date(anoFim, mesSeguinte, 20);
  }
  
  return {
    dataInicio: formatarData(dataInicio),
    dataFim: formatarData(dataFim)
  };
}

/**
 * Formata uma data para o formato YYYY-MM-DD
 */
function formatarData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Obtém o período atual de horas extras baseado na data de hoje
 */
export function getPeriodoAtualHorasExtras(): { dataInicio: string; dataFim: string } {
  return calcularPeriodoHorasExtras(new Date());
}

/**
 * Obtém o período atual de diárias baseado na data de hoje
 */
export function getPeriodoAtualDiarias(): { dataInicio: string; dataFim: string } {
  return calcularPeriodoDiarias(new Date());
}


