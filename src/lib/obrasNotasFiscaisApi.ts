/**
 * API para gerenciar Notas Fiscais de Obras
 */

import { supabase } from './supabase'
import type {
  ObraNotaFiscal,
  CreateNotaFiscalInput,
  UpdateNotaFiscalInput,
  NotaFiscalFilters
} from '../types/obras-financeiro'
import { calcularValorLiquido, verificarVencimento } from '../utils/notas-fiscais-utils'

/**
 * Busca todas as notas fiscais de uma obra
 */
export async function getNotasFiscaisByObra(
  obraId: string,
  filters?: NotaFiscalFilters
): Promise<ObraNotaFiscal[]> {
  let query = supabase
    .from('obras_notas_fiscais')
    .select('*')
    .eq('obra_id', obraId)
    .order('vencimento', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.data_inicio) {
    query = query.gte('vencimento', filters.data_inicio)
  }
  
  if (filters?.data_fim) {
    query = query.lte('vencimento', filters.data_fim)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    throw new Error('Erro ao buscar notas fiscais')
  }
  
  return data || []
}

/**
 * Busca uma nota fiscal por ID
 */
export async function getNotaFiscalById(id: string): Promise<ObraNotaFiscal | null> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar nota fiscal:', error)
    return null
  }
  
  return data
}

/**
 * Cria uma nova nota fiscal
 */
export async function createNotaFiscal(input: CreateNotaFiscalInput): Promise<ObraNotaFiscal> {
  // Calcula o valor líquido
  const valorLiquido = calcularValorLiquido(
    input.valor_nota,
    input.desconto_inss || 0,
    input.desconto_iss || 0,
    input.outro_desconto || 0
  )
  
  // Verifica se já está vencido
  const isVencido = verificarVencimento(input.vencimento)
  const status = isVencido ? 'vencido' : 'pendente'
  
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .insert({
      obra_id: input.obra_id,
      numero_nota: input.numero_nota,
      valor_nota: input.valor_nota,
      vencimento: input.vencimento,
      desconto_inss: input.desconto_inss || 0,
      desconto_iss: input.desconto_iss || 0,
      outro_desconto: input.outro_desconto || 0,
      valor_liquido: valorLiquido,
      status,
      arquivo_nota_url: input.arquivo_nota_url,
      observacoes: input.observacoes
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar nota fiscal:', error)
    throw new Error('Erro ao criar nota fiscal')
  }
  
  return data
}

/**
 * Atualiza uma nota fiscal (marca como renegociado)
 */
export async function updateNotaFiscal(
  id: string,
  input: UpdateNotaFiscalInput
): Promise<ObraNotaFiscal> {
  // Busca a nota atual para recalcular o valor líquido
  const notaAtual = await getNotaFiscalById(id)
  
  if (!notaAtual) {
    throw new Error('Nota fiscal não encontrada')
  }
  
  // Calcula o novo valor líquido
  const valorNota = input.valor_nota ?? notaAtual.valor_nota
  const descontoInss = input.desconto_inss ?? notaAtual.desconto_inss
  const descontoIss = input.desconto_iss ?? notaAtual.desconto_iss
  const outroDesconto = input.outro_desconto ?? notaAtual.outro_desconto
  
  const valorLiquido = calcularValorLiquido(
    valorNota,
    descontoInss,
    descontoIss,
    outroDesconto
  )
  
  const updateData: any = {
    ...input,
    valor_liquido: valorLiquido,
    status: 'renegociado' // Sempre marca como renegociado ao editar
  }
  
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar nota fiscal:', error)
    throw new Error('Erro ao atualizar nota fiscal')
  }
  
  return data
}

/**
 * Marca uma nota fiscal como paga
 */
export async function marcarNotaComoPaga(
  id: string,
  dataPagamento: string
): Promise<ObraNotaFiscal> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .update({
      status: 'pago',
      data_pagamento: dataPagamento
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao marcar nota como paga:', error)
    throw new Error('Erro ao marcar nota como paga')
  }
  
  return data
}

/**
 * Deleta uma nota fiscal
 */
export async function deleteNotaFiscal(id: string): Promise<void> {
  // Verifica se há medições vinculadas
  const { data: medicoes } = await supabase
    .from('obras_medicoes')
    .select('id')
    .eq('nota_fiscal_id', id)
    .limit(1)
  
  if (medicoes && medicoes.length > 0) {
    throw new Error('Não é possível excluir uma nota fiscal que possui medições vinculadas')
  }
  
  const { error } = await supabase
    .from('obras_notas_fiscais')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar nota fiscal:', error)
    throw new Error('Erro ao deletar nota fiscal')
  }
}

/**
 * Verifica e atualiza notas vencidas de uma obra
 */
export async function verificarNotasVencidas(obraId: string): Promise<number> {
  const hoje = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .update({ status: 'vencido' })
    .eq('obra_id', obraId)
    .eq('status', 'pendente')
    .lt('vencimento', hoje)
    .select()
  
  if (error) {
    console.error('Erro ao verificar notas vencidas:', error)
    return 0
  }
  
  return data?.length || 0
}

/**
 * Busca todas as notas fiscais (para página de recebimentos)
 */
export async function getAllNotasFiscais(
  filters?: NotaFiscalFilters
): Promise<Array<ObraNotaFiscal & { obra_nome?: string }>> {
  let query = supabase
    .from('obras_notas_fiscais')
    .select(`
      *,
      obras (
        nome
      )
    `)
    .order('vencimento', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.data_inicio) {
    query = query.gte('vencimento', filters.data_inicio)
  }
  
  if (filters?.data_fim) {
    query = query.lte('vencimento', filters.data_fim)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    throw new Error('Erro ao buscar notas fiscais')
  }
  
  // Transforma os dados para incluir o nome da obra
  return (data || []).map((nota: any) => ({
    ...nota,
    obra_nome: nota.obras?.nome
  }))
}

/**
 * Calcula o faturamento bruto (soma de todas as notas fiscais da obra)
 */
export async function getFaturamentoBruto(obraId: string): Promise<number> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_nota')
    .eq('obra_id', obraId)
  
  if (error) {
    console.error('Erro ao calcular faturamento bruto:', error)
    return 0
  }
  
  return data?.reduce((total, nota) => total + (nota.valor_nota || 0), 0) || 0
}

/**
 * Busca KPIs de recebimentos
 */
export interface RecebimentosKPIs {
  total_a_receber: number
  total_recebido: number
  total_vencido: number
  proximos_vencimentos: number
}

export async function getRecebimentosKPIs(): Promise<RecebimentosKPIs> {
  const hoje = new Date().toISOString().split('T')[0]
  const proximosDias = new Date()
  proximosDias.setDate(proximosDias.getDate() + 7)
  const dataProximos = proximosDias.toISOString().split('T')[0]
  
  // Total a receber (pendentes + vencidos)
  const { data: aReceber } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_liquido')
    .in('status', ['pendente', 'vencido'])
  
  // Total recebido (pagos)
  const { data: recebido } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_liquido')
    .eq('status', 'pago')
  
  // Total vencido
  const { data: vencido } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_liquido')
    .eq('status', 'vencido')
  
  // Próximos vencimentos (próximos 7 dias)
  const { data: proximos } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_liquido')
    .eq('status', 'pendente')
    .gte('vencimento', hoje)
    .lte('vencimento', dataProximos)
  
  return {
    total_a_receber: aReceber?.reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0,
    total_recebido: recebido?.reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0,
    total_vencido: vencido?.reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0,
    proximos_vencimentos: proximos?.reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0
  }
}






