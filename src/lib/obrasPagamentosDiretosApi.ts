import { supabase } from './supabase'
import type { 
  ObraPagamentoDireto, 
  CreatePagamentoDiretoInput, 
  UpdatePagamentoDiretoInput,
  PagamentoDiretoFilters,
  ResumoFinanceiroObra,
  RecebimentosKPIs
} from '../types/obras-pagamentos'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = false

// Função auxiliar para mapear dados do banco (inglês) para TypeScript (português)
function mapDatabaseToTypeScript(data: any): ObraPagamentoDireto {
  return {
    id: data.id,
    obra_id: data.obra_id,
    descricao: data.description || data.descricao,
    valor: data.amount || data.valor,
    data_pagamento: data.payment_date || data.data_pagamento,
    forma_pagamento: data.payment_method || data.forma_pagamento,
    comprovante_url: data.document_url || data.comprovante_url,
    observacoes: data.observations || data.observacoes,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at
  }
}

// Função auxiliar para mapear dados TypeScript (português) para banco (inglês)
function mapTypeScriptToDatabase(input: any): any {
  return {
    obra_id: input.obra_id,
    description: input.descricao,
    amount: input.valor,
    payment_date: input.data_pagamento,
    payment_method: input.forma_pagamento,
    document_url: input.comprovante_url,
    observations: input.observacoes
  }
}

// Mock data para desenvolvimento
const mockPagamentosDiretos: ObraPagamentoDireto[] = [
  {
    id: '1',
    obra_id: '1',
    descricao: 'PIX - Avanço de Pagamento',
    valor: 15000.00,
    data_pagamento: '2025-01-15',
    forma_pagamento: 'pix',
    comprovante_url: 'https://exemplo.com/comprovantes/pix-avancao.pdf',
    observacoes: 'Avanço de 30% do valor total',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    descricao: 'Transferência - Pagamento Final',
    valor: 25000.00,
    data_pagamento: '2025-01-20',
    forma_pagamento: 'transferencia',
    comprovante_url: 'https://exemplo.com/comprovantes/transferencia-final.pdf',
    observacoes: 'Pagamento final da obra',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    obra_id: '2',
    descricao: 'PIX - Pagamento Mensal',
    valor: 12000.00,
    data_pagamento: '2025-01-25',
    forma_pagamento: 'pix',
    observacoes: 'Pagamento mensal de janeiro',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export async function createPagamentoDireto(input: CreatePagamentoDiretoInput): Promise<ObraPagamentoDireto> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const novoPagamento: ObraPagamentoDireto = {
      id: Date.now().toString(),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockPagamentosDiretos.push(novoPagamento)
    return novoPagamento
  }

  // Mapear de português para inglês antes de inserir
  const dbInput = mapTypeScriptToDatabase(input)
  
  const { data, error } = await supabase
    .from('obras_pagamentos_diretos')
    .insert(dbInput)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar pagamento direto: ${error.message}`)
  }

  // Mapear de volta para português
  return mapDatabaseToTypeScript(data)
}

export async function getPagamentosDiretosByObra(obraId: string): Promise<ObraPagamentoDireto[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPagamentosDiretos.filter(p => p.obra_id === obraId)
  }

  const { data, error } = await supabase
    .from('obras_pagamentos_diretos')
    .select('*')
    .eq('obra_id', obraId)
    .order('payment_date', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar pagamentos diretos: ${error.message}`)
  }

  // Mapear todos os resultados de inglês para português
  return (data || []).map(mapDatabaseToTypeScript)
}

export async function getAllPagamentosDiretos(filters?: PagamentoDiretoFilters): Promise<ObraPagamentoDireto[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let resultado = [...mockPagamentosDiretos]
    
    if (filters?.obra_id) {
      resultado = resultado.filter(p => p.obra_id === filters.obra_id)
    }
    
    if (filters?.forma_pagamento) {
      resultado = resultado.filter(p => p.forma_pagamento === filters.forma_pagamento)
    }
    
    if (filters?.data_inicio) {
      resultado = resultado.filter(p => p.data_pagamento >= filters.data_inicio!)
    }
    
    if (filters?.data_fim) {
      resultado = resultado.filter(p => p.data_pagamento <= filters.data_fim!)
    }
    
    if (filters?.valor_min) {
      resultado = resultado.filter(p => p.valor >= filters.valor_min!)
    }
    
    if (filters?.valor_max) {
      resultado = resultado.filter(p => p.valor <= filters.valor_max!)
    }
    
    return resultado
  }

  let query = supabase
    .from('obras_pagamentos_diretos')
    .select('*')
    .order('payment_date', { ascending: false })

  if (filters?.obra_id) {
    query = query.eq('obra_id', filters.obra_id)
  }

  if (filters?.forma_pagamento) {
    query = query.eq('payment_method', filters.forma_pagamento)
  }

  if (filters?.data_inicio) {
    query = query.gte('payment_date', filters.data_inicio)
  }

  if (filters?.data_fim) {
    query = query.lte('payment_date', filters.data_fim)
  }

  if (filters?.valor_min) {
    query = query.gte('amount', filters.valor_min)
  }

  if (filters?.valor_max) {
    query = query.lte('amount', filters.valor_max)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar pagamentos diretos: ${error.message}`)
  }

  // Mapear todos os resultados de inglês para português
  const pagamentosMapeados = (data || []).map(mapDatabaseToTypeScript)
  
  // Buscar nomes das obras para cada pagamento
  const pagamentosComObra = await Promise.all(
    pagamentosMapeados.map(async (pagamento) => {
      try {
        const { data: obra } = await supabase
          .from('obras')
          .select('name')
          .eq('id', pagamento.obra_id)
          .single()
        
        return {
          ...pagamento,
          obra_nome: obra?.name || 'Obra não encontrada'
        }
      } catch (e) {
        console.error(`Erro ao buscar obra ${pagamento.obra_id}:`, e)
        return {
          ...pagamento,
          obra_nome: 'Obra não encontrada'
        }
      }
    })
  )
  
  return pagamentosComObra
}

export async function updatePagamentoDireto(id: string, input: UpdatePagamentoDiretoInput): Promise<ObraPagamentoDireto> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = mockPagamentosDiretos.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Pagamento direto não encontrado')
    }
    
    mockPagamentosDiretos[index] = {
      ...mockPagamentosDiretos[index],
      ...input,
      updated_at: new Date().toISOString()
    }
    
    return mockPagamentosDiretos[index]
  }

  // Mapear de português para inglês antes de atualizar
  const dbInput = mapTypeScriptToDatabase(input)
  
  const { data, error } = await supabase
    .from('obras_pagamentos_diretos')
    .update(dbInput)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar pagamento direto: ${error.message}`)
  }

  // Mapear de volta para português
  return mapDatabaseToTypeScript(data)
}

export async function deletePagamentoDireto(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockPagamentosDiretos.findIndex(p => p.id === id)
    if (index !== -1) {
      mockPagamentosDiretos.splice(index, 1)
    }
    return
  }

  const { error } = await supabase
    .from('obras_pagamentos_diretos')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao excluir pagamento direto: ${error.message}`)
  }
}

export async function getResumoFinanceiroObra(obraId: string): Promise<ResumoFinanceiroObra> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock data para resumo financeiro
    return {
      obra_id: obraId,
      obra_nome: 'Pavimentação Rua das Flores - Osasco',
      faturamento_notas_fiscais: {
        total_emitido: 176500.00,
        total_pago: 36375.00,
        total_pendente: 74100.00,
        total_vencido: 49400.00
      },
      pagamentos_diretos: {
        total_pago: 40000.00,
        quantidade: 2
      },
      faturamento_total: 216500.00, // 176500 + 40000
      total_recebido: 76375.00, // 36375 + 40000
      total_a_receber: 123500.00 // 74100 + 49400
    }
  }

  // Buscar notas fiscais da obra
  const { data: notasFiscais, error: errorNotas } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_nota, status')
    .eq('obra_id', obraId)

  if (errorNotas) {
    throw new Error(`Erro ao buscar notas fiscais: ${errorNotas.message}`)
  }

  // Buscar pagamentos diretos da obra
  const { data: pagamentosDiretos, error: errorPagamentos } = await supabase
    .from('obras_pagamentos_diretos')
    .select('amount')
    .eq('obra_id', obraId)

  if (errorPagamentos) {
    throw new Error(`Erro ao buscar pagamentos diretos: ${errorPagamentos.message}`)
  }

  // Calcular totais das notas fiscais
  const totalEmitido = notasFiscais?.reduce((sum, nota) => sum + nota.valor_nota, 0) || 0
  const totalPago = notasFiscais?.filter(nota => nota.status === 'pago').reduce((sum, nota) => sum + nota.valor_nota, 0) || 0
  const totalPendente = notasFiscais?.filter(nota => nota.status === 'pendente').reduce((sum, nota) => sum + nota.valor_nota, 0) || 0
  const totalVencido = notasFiscais?.filter(nota => nota.status === 'vencido').reduce((sum, nota) => sum + nota.valor_nota, 0) || 0

  // Calcular totais dos pagamentos diretos (usar 'amount' do banco)
  const totalPagamentosDiretos = pagamentosDiretos?.reduce((sum, pag) => sum + (pag.amount || 0), 0) || 0

  return {
    obra_id: obraId,
    obra_nome: 'Nome da Obra', // Buscar do banco se necessário
    faturamento_notas_fiscais: {
      total_emitido: totalEmitido,
      total_pago: totalPago,
      total_pendente: totalPendente,
      total_vencido: totalVencido
    },
    pagamentos_diretos: {
      total_pago: totalPagamentosDiretos,
      quantidade: pagamentosDiretos?.length || 0
    },
    faturamento_total: totalEmitido + totalPagamentosDiretos,
    total_recebido: totalPago + totalPagamentosDiretos,
    total_a_receber: totalPendente + totalVencido
  }
}

export async function getRecebimentosKPIsConsolidado(): Promise<RecebimentosKPIs> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      // Notas Fiscais
      total_notas_fiscais: 5,
      total_notas_pagas: 1,
      total_notas_pendentes: 3,
      total_notas_vencidas: 1,
      
      // Pagamentos Diretos
      total_pagamentos_diretos: 3,
      total_pix: 2,
      total_transferencias: 1,
      total_dinheiro: 0,
      
      // Valores
      faturamento_bruto: 216500.00,
      recebido_notas_fiscais: 36375.00,
      recebido_pagamentos_diretos: 52000.00,
      total_recebido: 88375.00,
      total_a_receber: 123500.00
    }
  }

  // Implementação real com banco de dados
  // ... (código para buscar dados reais)
  
  throw new Error('Implementação real não disponível ainda')
}





