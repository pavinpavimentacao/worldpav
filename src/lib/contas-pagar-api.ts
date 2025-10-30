/**
 * API para Contas a Pagar
 * Sistema WorldPav - Gestão de Asfalto
 * 
 * Este arquivo faz o mapeamento entre:
 * - Campos em PORTUGUÊS (usados no código/app) ↔ Campos em INGLÊS (banco de dados)
 * - Status com primeira letra maiúscula (app) ↔ Status em minúsculas (enum do banco)
 */

import { supabase } from './supabase'
import { getOrCreateDefaultCompany } from './company-utils'
import type { 
  ContaPagar,
  ContaPagarFormData, 
  ContaPagarEstatisticas,
  StatusContaPagar,
  ContaPagarFiltros
} from '../types/contas-pagar'

// ============================================
// TIPOS INTERNOS (Banco de Dados)
// ============================================

interface ContaPagarBanco {
  id: string
  company_id: string
  obra_id?: string | null
  description: string
  category?: string | null
  supplier?: string | null
  amount: number
  due_date: string
  payment_date?: string | null
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado'
  payment_method?: string | null
  invoice_number?: string | null
  invoice_url?: string | null
  observations?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface ContaPagarInsertBanco {
  company_id: string
  obra_id?: string | null
  description: string
  category?: string | null
  supplier?: string | null
  amount: number
  due_date: string
  payment_date?: string | null
  status?: 'pendente' | 'pago' | 'atrasado' | 'cancelado'
  payment_method?: string | null
  invoice_number?: string | null
  invoice_url?: string | null
  observations?: string | null
}

// ============================================
// FUNÇÕES DE MAPEAMENTO
// ============================================

/**
 * Mapeia status do app (Pendente/Paga/etc) para status do banco (pendente/pago/etc)
 */
function mapearStatusAppParaBanco(status: StatusContaPagar): 'pendente' | 'pago' | 'atrasado' | 'cancelado' {
  switch (status) {
    case 'Pendente':
      return 'pendente'
    case 'Paga':
      return 'pago'
    case 'Atrasada':
      return 'atrasado'
    case 'Cancelada':
      return 'cancelado'
    default:
      console.warn('Status desconhecido, usando "pendente" como padrão:', status)
      return 'pendente'
  }
}

/**
 * Mapeia status do banco (pendente/pago/etc) para status do app (Pendente/Paga/etc)
 */
function mapearStatusBancoParaApp(status: string): StatusContaPagar {
  switch (status.toLowerCase()) {
    case 'pendente':
      return 'Pendente'
    case 'pago':
      return 'Paga'
    case 'atrasado':
      return 'Atrasada'
    case 'cancelado':
      return 'Cancelada'
    default:
      console.warn('Status desconhecido do banco, usando "Pendente" como padrão:', status)
      return 'Pendente'
  }
}

/**
 * Mapeia dados do formulário (português) para formato do banco (inglês)
 */
function mapearFormDataParaBanco(
  formData: ContaPagarFormData,
  companyId: string
): ContaPagarInsertBanco {
  // Criar description a partir de numero_nota + descricao
  const description = formData.numero_nota 
    ? `${formData.numero_nota}${formData.descricao ? ` - ${formData.descricao}` : ''}`
    : formData.descricao || 'Conta a pagar'

  const dados: ContaPagarInsertBanco = {
    company_id: companyId,
    description: description,
    amount: formData.valor,
    due_date: formData.data_vencimento,
    status: mapearStatusAppParaBanco(formData.status),
    category: formData.categoria || null,
    supplier: formData.fornecedor || null,
    invoice_number: formData.numero_nota || null,
    observations: formData.observacoes || null,
    payment_method: formData.forma_pagamento || null,
  }

  // Campos condicionais
  if (formData.status === 'Paga' && formData.data_pagamento) {
    dados.payment_date = formData.data_pagamento
  }

  // Anexo será tratado separadamente no upload
  // invoice_url será preenchido após upload

  return dados
}

/**
 * Mapeia dados do banco (inglês) para formato do app (português)
 */
function mapearBancoParaApp(banco: ContaPagarBanco): ContaPagar {
  // Extrair numero_nota do invoice_number ou do início do description
  let numero_nota = banco.invoice_number || ''
  if (!numero_nota && banco.description) {
    // Tentar extrair do início do description (formato: "NF-001 - Descrição")
    const match = banco.description.match(/^([A-Z0-9-]+)(?:\s*-\s*)?/)
    if (match) {
      numero_nota = match[1]
    }
  }

  // Extrair descricao (remover numero_nota do início do description se existir)
  let descricao = banco.description || ''
  if (numero_nota && descricao.startsWith(numero_nota)) {
    descricao = descricao.substring(numero_nota.length).replace(/^\s*-\s*/, '').trim()
  }
  if (!descricao) descricao = banco.description || null

  // Data de emissão: usar created_at (já que data_emissao não existe no banco)
  const data_emissao = banco.created_at ? banco.created_at.split('T')[0] : ''

  return {
    id: banco.id,
    numero_nota: numero_nota,
    valor: Number(banco.amount),
    data_emissao: data_emissao,
    data_vencimento: banco.due_date,
    status: mapearStatusBancoParaApp(banco.status),
    fornecedor: banco.supplier || null,
    descricao: descricao,
    categoria: banco.category || null,
    data_pagamento: banco.payment_date || null,
    valor_pago: banco.payment_date ? Number(banco.amount) : null, // Se pago, usar amount
    forma_pagamento: banco.payment_method || null,
    observacoes: banco.observations || null,
    anexo_url: banco.invoice_url || null,
    anexo_nome: banco.invoice_url ? banco.invoice_url.split('/').pop() || null : null,
    created_at: banco.created_at,
    updated_at: banco.updated_at,
    created_by: null, // Campo não existe no banco na migration atual
    updated_by: null, // Campo não existe no banco na migration atual
  } as ContaPagar
}

// ============================================
// FUNÇÕES DA API
// ============================================

/**
 * Busca todas as contas a pagar com filtros opcionais
 */
export async function getContasPagar(
  companyId: string,
  filtros?: ContaPagarFiltros
): Promise<ContaPagar[]> {
  try {
    console.log('🔍 [ContasPagar API] Buscando contas...', { companyId, filtros })

    let query = supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null) // Não mostrar deletadas

    // Filtro por status
    if (filtros?.status && filtros.status.length > 0) {
      const statusBanco = filtros.status.map(s => mapearStatusAppParaBanco(s))
      query = query.in('status', statusBanco)
    }

    // Filtro por busca textual
    if (filtros?.numero_nota || filtros?.fornecedor) {
      const searchTerms: string[] = []
      const searchTerm = filtros.numero_nota || filtros.fornecedor || ''
      
      if (searchTerm) {
        // Buscar em múltiplos campos
        searchTerms.push(`invoice_number.ilike.%${searchTerm}%`)
        searchTerms.push(`description.ilike.%${searchTerm}%`)
        searchTerms.push(`supplier.ilike.%${searchTerm}%`)
        searchTerms.push(`category.ilike.%${searchTerm}%`)
      }
      
      if (searchTerms.length > 0) {
        query = query.or(searchTerms.join(','))
      }
    }

    // Filtro por categoria
    if (filtros?.categoria) {
      query = query.eq('category', filtros.categoria)
    }

    // Filtro por data
    if (filtros?.data_inicio) {
      query = query.gte('due_date', filtros.data_inicio)
    }
    if (filtros?.data_fim) {
      query = query.lte('due_date', filtros.data_fim)
    }

    // Ordenar por data de vencimento
    query = query.order('due_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao buscar contas:', error)
      throw new Error(`Erro ao buscar contas a pagar: ${error.message}`)
    }

    const contas = (data || []).map(mapearBancoParaApp)
    console.log(`✅ [ContasPagar API] ${contas.length} conta(s) encontrada(s)`)
    
    return contas
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Busca uma conta a pagar por ID
 */
export async function getContaPagarById(id: string): Promise<ContaPagar | null> {
  try {
    console.log('🔍 [ContasPagar API] Buscando conta por ID:', id)

    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        console.log('⚠️  [ContasPagar API] Conta não encontrada:', id)
        return null
      }
      console.error('❌ [ContasPagar API] Erro ao buscar conta:', error)
      throw new Error(`Erro ao buscar conta a pagar: ${error.message}`)
    }

    if (!data) {
      return null
    }

    const conta = mapearBancoParaApp(data as ContaPagarBanco)
    console.log('✅ [ContasPagar API] Conta encontrada:', conta.numero_nota)
    
    return conta
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Cria uma nova conta a pagar
 */
export async function createContaPagar(
  formData: ContaPagarFormData,
  companyId: string,
  userId?: string
): Promise<ContaPagar> {
  try {
    console.log('📝 [ContasPagar API] Criando nova conta...', { formData: { ...formData, anexo: '[File]' } })

    if (!companyId) {
      throw new Error('Company ID é obrigatório para criar conta a pagar')
    }

    // Mapear dados para formato do banco
    const dadosBanco = mapearFormDataParaBanco(formData, companyId)

    console.log('📤 [ContasPagar API] Dados para inserir:', dadosBanco)

    const { data, error } = await supabase
      .from('contas_pagar')
      .insert(dadosBanco)
      .select()
      .single()

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao criar conta:', error)
      throw new Error(`Erro ao criar conta a pagar: ${error.message}`)
    }

    const conta = mapearBancoParaApp(data as ContaPagarBanco)
    console.log('✅ [ContasPagar API] Conta criada com sucesso:', conta.numero_nota)
    
    return conta
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Atualiza uma conta a pagar existente
 */
export async function updateContaPagar(
  id: string,
  formData: Partial<ContaPagarFormData>,
  userId?: string
): Promise<ContaPagar> {
  try {
    console.log('✏️  [ContasPagar API] Atualizando conta:', id)

    // Obter company_id da conta existente (necessário para RLS)
    const contaExistente = await getContaPagarById(id)
    if (!contaExistente) {
      throw new Error('Conta a pagar não encontrada')
    }

    // Buscar company_id (precisamos dele para mapeamento)
    const companyId = await getOrCreateDefaultCompany()

    // Mapear dados atualizados
    const dadosAtualizados: Partial<ContaPagarInsertBanco> = {}

    if (formData.numero_nota !== undefined || formData.descricao !== undefined) {
      const description = formData.numero_nota 
        ? `${formData.numero_nota}${formData.descricao ? ` - ${formData.descricao}` : ''}`
        : formData.descricao || contaExistente.descricao || ''
      dadosAtualizados.description = description
      if (formData.numero_nota) {
        dadosAtualizados.invoice_number = formData.numero_nota
      }
    }

    if (formData.valor !== undefined) {
      dadosAtualizados.amount = formData.valor
    }

    if (formData.data_vencimento !== undefined) {
      dadosAtualizados.due_date = formData.data_vencimento
    }

    if (formData.status !== undefined) {
      dadosAtualizados.status = mapearStatusAppParaBanco(formData.status)
    }

    if (formData.fornecedor !== undefined) {
      dadosAtualizados.supplier = formData.fornecedor || null
    }

    if (formData.categoria !== undefined) {
      dadosAtualizados.category = formData.categoria || null
    }

    if (formData.data_pagamento !== undefined) {
      dadosAtualizados.payment_date = formData.data_pagamento || null
    }

    if (formData.forma_pagamento !== undefined) {
      dadosAtualizados.payment_method = formData.forma_pagamento || null
    }

    if (formData.observacoes !== undefined) {
      dadosAtualizados.observations = formData.observacoes || null
    }

    // Não atualizar invoice_url aqui (será feito separadamente após upload)

    const { data, error } = await supabase
      .from('contas_pagar')
      .update(dadosAtualizados)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao atualizar conta:', error)
      throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`)
    }

    const conta = mapearBancoParaApp(data as ContaPagarBanco)
    console.log('✅ [ContasPagar API] Conta atualizada com sucesso:', conta.numero_nota)
    
    return conta
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Deleta uma conta a pagar (soft delete usando deleted_at)
 */
export async function deleteContaPagar(id: string): Promise<void> {
  try {
    console.log('🗑️  [ContasPagar API] Deletando conta:', id)

    // Soft delete usando deleted_at
    const { error } = await supabase
      .from('contas_pagar')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao deletar conta:', error)
      throw new Error(`Erro ao deletar conta a pagar: ${error.message}`)
    }

    console.log('✅ [ContasPagar API] Conta deletada com sucesso')
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Atualiza o URL do anexo/invoice
 */
export async function updateAnexoUrl(
  id: string,
  anexoUrl: string,
  anexoNome?: string
): Promise<void> {
  try {
    console.log('📎 [ContasPagar API] Atualizando URL do anexo:', id)

    const { error } = await supabase
      .from('contas_pagar')
      .update({ invoice_url: anexoUrl })
      .eq('id', id)

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao atualizar anexo:', error)
      throw new Error(`Erro ao atualizar anexo: ${error.message}`)
    }

    console.log('✅ [ContasPagar API] Anexo atualizado com sucesso')
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

/**
 * Calcula estatísticas de contas a pagar
 */
export async function getEstatisticas(
  companyId: string
): Promise<ContaPagarEstatisticas> {
  try {
    console.log('📊 [ContasPagar API] Calculando estatísticas...', companyId)

    const { data, error } = await supabase
      .from('contas_pagar')
      .select('status, amount, due_date, payment_date')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) {
      console.error('❌ [ContasPagar API] Erro ao buscar estatísticas:', error)
      throw new Error(`Erro ao calcular estatísticas: ${error.message}`)
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const stats: ContaPagarEstatisticas = {
      total_contas: 0,
      total_pendente: 0,
      total_pago: 0,
      total_atrasado: 0,
      valor_total_pendente: 0,
      valor_total_pago: 0,
      valor_total_atrasado: 0,
      valor_total_geral: 0,
    }

    if (!data || data.length === 0) {
      console.log('⚠️  [ContasPagar API] Nenhum dado para calcular estatísticas')
      return stats
    }

    data.forEach((item) => {
      const statusApp = mapearStatusBancoParaApp(item.status)
      const amount = Number(item.amount) || 0
      const dueDate = item.due_date ? new Date(item.due_date) : null

      stats.total_contas++
      stats.valor_total_geral += amount

      if (statusApp === 'Paga') {
        stats.total_pago++
        stats.valor_total_pago += amount
      } else if (statusApp === 'Pendente') {
        stats.total_pendente++
        stats.valor_total_pendente += amount

        // Verificar se está atrasada
        if (dueDate && dueDate < hoje) {
          stats.total_atrasado++
          stats.valor_total_atrasado += amount
        }
      } else if (statusApp === 'Atrasada') {
        stats.total_atrasado++
        stats.valor_total_atrasado += amount
      }
    })

    console.log('✅ [ContasPagar API] Estatísticas calculadas:', stats)
    return stats
  } catch (error) {
    console.error('❌ [ContasPagar API] Erro inesperado:', error)
    throw error
  }
}

