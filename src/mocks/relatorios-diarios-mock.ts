/**
 * DADOS MOCKADOS - Relatórios Diários
 * Armazena relatórios criados via confirmação de obra ou criação manual
 */

import type { RelatorioDiario, RelatorioDiarioCompleto, RelatorioDiarioMaquinario } from '../types/relatorios-diarios';

/**
 * Array mutável de relatórios diários
 * Novos relatórios são adicionados aqui ao confirmar obras
 */
export const mockRelatoriosDiarios: RelatorioDiarioCompleto[] = [];

/**
 * Contador para gerar números sequenciais de relatórios
 */
let contadorRelatorios = 1;

/**
 * Helper: Adicionar novo relatório diário
 */
export function adicionarRelatorioDiario(dados: {
  cliente_id: string;
  cliente_nome: string;
  obra_id: string;
  obra_nome: string;
  rua_id: string;
  rua_nome: string;
  equipe_id?: string;
  equipe_nome?: string;
  equipe_is_terceira: boolean;
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  metragem_feita: number;
  toneladas_aplicadas: number;
  observacoes?: string;
  maquinarios: Array<{
    id: string;
    nome: string;
    is_terceiro: boolean;
    parceiro_id?: string;
    parceiro_nome?: string;
  }>;
}): RelatorioDiarioCompleto {
  const ano = new Date().getFullYear();
  const numero = `RD-${ano}-${String(contadorRelatorios).padStart(3, '0')}`;
  contadorRelatorios++;

  const espessuraCalculada = dados.metragem_feita > 0 
    ? (dados.toneladas_aplicadas / dados.metragem_feita) * 4.17 
    : 0;

  const maquinariosRelatorio: RelatorioDiarioMaquinario[] = dados.maquinarios.map(maq => ({
    id: `rel-maq-${Date.now()}-${Math.random()}`,
    relatorio_id: numero,
    maquinario_id: maq.id,
    maquinario_nome: maq.nome,
    is_terceiro: maq.is_terceiro,
    parceiro_id: maq.parceiro_id,
    parceiro_nome: maq.parceiro_nome,
    created_at: new Date().toISOString(),
  }));

  const novoRelatorio: RelatorioDiarioCompleto = {
    id: `relatorio-${Date.now()}`,
    numero,
    cliente_id: dados.cliente_id,
    cliente_nome: dados.cliente_nome,
    obra_id: dados.obra_id,
    obra_nome: dados.obra_nome,
    rua_id: dados.rua_id,
    rua_nome: dados.rua_nome,
    equipe_id: dados.equipe_id,
    equipe_nome: dados.equipe_nome,
    equipe_is_terceira: dados.equipe_is_terceira,
    data_inicio: dados.data_inicio,
    data_fim: dados.data_fim,
    horario_inicio: dados.horario_inicio,
    metragem_feita: dados.metragem_feita,
    toneladas_aplicadas: dados.toneladas_aplicadas,
    espessura_calculada: espessuraCalculada,
    observacoes: dados.observacoes,
    status: 'finalizado',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    maquinarios: maquinariosRelatorio,
  };

  mockRelatoriosDiarios.push(novoRelatorio);
  
  console.log('✅ Relatório adicionado ao mock:', numero);
  console.log('Total de relatórios:', mockRelatoriosDiarios.length);
  
  return novoRelatorio;
}

/**
 * Helper: Buscar relatório por ID
 */
export function getRelatorioDiarioById(id: string): RelatorioDiarioCompleto | undefined {
  return mockRelatoriosDiarios.find(r => r.id === id);
}

/**
 * Helper: Buscar relatório por número
 */
export function getRelatorioDiarioByNumero(numero: string): RelatorioDiarioCompleto | undefined {
  return mockRelatoriosDiarios.find(r => r.numero === numero);
}

/**
 * Helper: Listar todos os relatórios
 */
export function listarRelatoriosDiarios(): RelatorioDiarioCompleto[] {
  return [...mockRelatoriosDiarios].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Helper: Buscar relatórios por obra
 */
export function getRelatoriosByObraId(obraId: string): RelatorioDiarioCompleto[] {
  return mockRelatoriosDiarios.filter(r => r.obra_id === obraId);
}

/**
 * Helper: Buscar relatórios por cliente
 */
export function getRelatoriosByClienteId(clienteId: string): RelatorioDiarioCompleto[] {
  return mockRelatoriosDiarios.filter(r => r.cliente_id === clienteId);
}

/**
 * Helper: Estatísticas
 */
export function getEstatisticasRelatorios() {
  const total = mockRelatoriosDiarios.length;
  const totalMetragem = mockRelatoriosDiarios.reduce((acc, r) => acc + r.metragem_feita, 0);
  const totalToneladas = mockRelatoriosDiarios.reduce((acc, r) => acc + r.toneladas_aplicadas, 0);
  const espessuraMedia = total > 0 
    ? mockRelatoriosDiarios.reduce((acc, r) => acc + r.espessura_calculada, 0) / total 
    : 0;

  return {
    total,
    totalMetragem,
    totalToneladas,
    espessuraMedia,
  };
}


