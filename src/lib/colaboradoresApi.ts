/**
 * API para gerenciamento de Colaboradores
 * Conecta com a tabela 'colaboradores' no Supabase
 * 
 * NOTA: A tabela do banco tem apenas campos básicos.
 * Campos financeiros (salário, pagamentos) devem ser gerenciados
 * em outro módulo (ex: controle_diario, folha_pagamento)
 */

import { supabase } from './supabase'
import type {
  TipoEquipe,
  StatusColaborador
} from '../types/colaboradores'

// ============================================================================
// TIPOS PARA COLABORADORES (Baseados nos campos reais do banco)
// ============================================================================

export interface ColaboradorSimples {
  id: string
  company_id: string
  name: string
  cpf?: string | null
  rg?: string | null
  birth_date?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  position?: string | null
  tipo_equipe: 'pavimentacao' | 'maquinas' | 'apoio' // Valores reais do banco (enum tipo_equipe)
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado'
  hire_date?: string | null
  photo_url?: string | null
  // Campos financeiros adicionados na migration
  tipo_contrato: 'fixo' | 'diarista'
  salario_fixo: number
  data_pagamento_1?: string | null
  data_pagamento_2?: string | null
  valor_pagamento_1?: number | null
  valor_pagamento_2?: number | null
  registrado: boolean
  vale_transporte: boolean
  qtd_passagens_por_dia?: number | null
  equipamento_vinculado_id?: string | null
  equipe_id?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface ColaboradorInsertData {
  company_id: string
  name: string
  cpf?: string | null
  email?: string | null
  phone?: string | null
  position?: string | null
  tipo_equipe: 'pavimentacao' | 'maquinas' | 'apoio' // Valores reais do banco
  hire_date?: string | null
  // Campos financeiros
  tipo_contrato?: 'fixo' | 'diarista'
  salario_fixo?: number
  data_pagamento_1?: string | null
  data_pagamento_2?: string | null
  valor_pagamento_1?: number | null
  valor_pagamento_2?: number | null
  registrado?: boolean
  vale_transporte?: boolean
  qtd_passagens_por_dia?: number | null
  equipamento_vinculado_id?: string | null
  equipe_id?: string | null
}

export interface ColaboradorUpdateData {
  name?: string
  cpf?: string | null
  email?: string | null
  phone?: string | null
  position?: string | null
  tipo_equipe?: 'pavimentacao' | 'maquinas' | 'apoio' // Valores reais do banco
  status?: 'ativo' | 'inativo' | 'ferias' | 'afastado'
  hire_date?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  // Campos financeiros
  tipo_contrato?: 'fixo' | 'diarista'
  salario_fixo?: number
  data_pagamento_1?: string | null
  data_pagamento_2?: string | null
  valor_pagamento_1?: number | null
  valor_pagamento_2?: number | null
  registrado?: boolean
  vale_transporte?: boolean
  qtd_passagens_por_dia?: number | null
  equipamento_vinculado_id?: string | null
  equipe_id?: string | null
}

export interface ColaboradorFilters {
  searchTerm?: string
  tipo_equipe?: 'massa' | 'administrativa' | 'todos' | 'pavimentacao' | 'maquinas' | 'apoio'
  equipe_id?: string // ✅ Adicionar filtro por equipe_id
  status?: 'ativo' | 'inativo' | 'ferias' | 'afastado' | 'todos'
}

export interface ColaboradorStats {
  total: number
  massa: number
  administrativa: number
  ativos: number
  inativos: number
  por_funcao: Array<{
    funcao: string
    quantidade: number
  }>
}

// ============================================================================
// FUNÇÕES DA API
// ============================================================================

/**
 * Busca todos os colaboradores com filtros opcionais
 */
export async function getColaboradores(
  companyId: string,
  filters?: ColaboradorFilters
): Promise<ColaboradorSimples[]> {
  try {
    let query = supabase
      .from('colaboradores')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    // Aplicar filtros
    if (filters) {
      // Filtro de status
      if (filters.status && filters.status !== 'todos') {
        if (filters.status === 'ativo') {
          query = query.eq('status', 'ativo')
        } else if (filters.status === 'inativo') {
          query = query.eq('status', 'inativo')
        } else {
          query = query.eq('status', filters.status)
        }
      }

      // ✅ Filtro por equipe_id (prioritário sobre tipo_equipe)
      if (filters.equipe_id && filters.equipe_id.trim().length > 0) {
        query = query.eq('equipe_id', filters.equipe_id)
        console.log('🔍 [ColaboradoresApi] Filtrando por equipe_id:', filters.equipe_id)
      } else if (filters.tipo_equipe && filters.tipo_equipe !== 'todos') {
        // Filtro de tipo de equipe (fallback para compatibilidade)
        query = query.eq('tipo_equipe', filters.tipo_equipe)
        console.log('🔍 [ColaboradoresApi] Filtrando por tipo_equipe:', filters.tipo_equipe)
      }

      // Busca por nome
      if (filters.searchTerm && filters.searchTerm.trim()) {
        query = query.or(`name.ilike.%${filters.searchTerm.trim()}%,position.ilike.%${filters.searchTerm.trim()}%,cpf.ilike.%${filters.searchTerm.trim()}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar colaboradores:', error)
      console.error('Detalhes do erro:', error)
      throw new Error(`Erro ao buscar colaboradores: ${error.message}`)
    }

    console.log('✅ [ColaboradoresApi] Colaboradores encontrados:', data?.length || 0)
    
    // Log detalhado do primeiro colaborador para debug
    if (data && data.length > 0) {
      console.log('📋 [ColaboradoresApi] Primeiro colaborador:', {
        id: data[0].id,
        name: data[0].name,
        equipe_id: data[0].equipe_id,
        tipo_equipe: data[0].tipo_equipe
      });
    }
    
    return data || []
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
    throw error
  }
}

/**
 * Busca colaborador por ID
 */
export async function getColaboradorById(
  id: string
): Promise<ColaboradorSimples | null> {
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Não encontrado
      }
      console.error('Erro ao buscar colaborador:', error)
      throw new Error(`Erro ao buscar colaborador: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error)
    throw error
  }
}

/**
 * Cria novo colaborador
 */
export async function createColaborador(
  data: ColaboradorInsertData
): Promise<ColaboradorSimples> {
  try {
    const { data: created, error } = await supabase
      .from('colaboradores')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar colaborador:', error)
      throw new Error(`Erro ao criar colaborador: ${error.message}`)
    }

    return created
  } catch (error) {
    console.error('Erro ao criar colaborador:', error)
    throw error
  }
}

/**
 * Atualiza colaborador existente
 */
export async function updateColaborador(
  id: string,
  data: ColaboradorUpdateData
): Promise<ColaboradorSimples> {
  try {
    const { data: updated, error } = await supabase
      .from('colaboradores')
      .update(data)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar colaborador:', error)
      throw new Error(`Erro ao atualizar colaborador: ${error.message}`)
    }

    return updated
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error)
    throw error
  }
}

/**
 * Deleta colaborador (soft delete)
 */
export async function deleteColaborador(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('colaboradores')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar colaborador:', error)
      throw new Error(`Erro ao deletar colaborador: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error)
    throw error
  }
}

/**
 * Busca estatísticas de colaboradores
 */
export async function getEstatisticasColaboradores(
  companyId: string
): Promise<ColaboradorStats> {
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('tipo_equipe, position, status')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    const colaboradores = data || []

    // Contar por tipo de equipe
    const massa = colaboradores.filter(c => c.tipo_equipe === 'massa').length
    const administrativa = colaboradores.filter(c => c.tipo_equipe === 'administrativa').length

    // Contar por status
    const ativos = colaboradores.filter(c => c.status === 'ativo').length
    const inativos = colaboradores.filter(c => c.status !== 'ativo').length

    // Contar por função
    const funcoesCounts = colaboradores.reduce((acc, c) => {
      const funcao = c.position || 'Não definida'
      acc[funcao] = (acc[funcao] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const porFuncao = Object.entries(funcoesCounts).map(([funcao, quantidade]) => ({
      funcao,
      quantidade
    }))

    return {
      total: colaboradores.length,
      massa,
      administrativa,
      ativos,
      inativos,
      por_funcao: porFuncao
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}

/**
 * Busca colaboradores ativos (helper para selects)
 */
export async function getColaboradoresAtivos(
  companyId: string
): Promise<Array<{ id: string; name: string; position: string }>> {
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, name, position')
      .eq('company_id', companyId)
      .eq('status', 'ativo')
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar colaboradores ativos:', error)
      throw new Error(`Erro ao buscar colaboradores ativos: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar colaboradores ativos:', error)
    throw error
  }
}

/**
 * Busca estatísticas de colaboradores
 */
export async function getColaboradoresStats(
  companyId: string
): Promise<ColaboradorStats> {
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('status, tipo_equipe, position')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) throw error

    const stats: ColaboradorStats = {
      total: data?.length || 0,
      por_status: [],
      por_tipo_equipe: [],
      por_funcao: []
    }

    // Agrupar por status
    const statusCounts: Record<string, number> = {}
    const tipoEquipeCounts: Record<string, number> = {}
    const funcaoCounts: Record<string, number> = {}

    data?.forEach((col) => {
      statusCounts[col.status] = (statusCounts[col.status] || 0) + 1
      if (col.tipo_equipe) {
        tipoEquipeCounts[col.tipo_equipe] = (tipoEquipeCounts[col.tipo_equipe] || 0) + 1
      }
      if (col.position) {
        funcaoCounts[col.position] = (funcaoCounts[col.position] || 0) + 1
      }
    })

    stats.por_status = Object.entries(statusCounts).map(([status, quantidade]) => ({
      status,
      quantidade
    }))

    stats.por_tipo_equipe = Object.entries(tipoEquipeCounts).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }))

    stats.por_funcao = Object.entries(funcaoCounts).map(([funcao, quantidade]) => ({
      funcao,
      quantidade
    }))

    return stats
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}

/**
 * Busca equipes disponíveis para controle diário
 */
export async function getEquipes(
  companyId: string
): Promise<Array<{ id: string; nome: string; count: number; tipo_equipe: string }>> {
  try {
    console.log('🔍 [ColaboradoresApi] Buscando equipes da tabela equipes para company_id:', companyId);
    
    // ✅ Tentar buscar da tabela equipes primeiro
    try {
      const { data: equipesData, error: equipesError } = await supabase
        .from('equipes')
        .select('id, name, prefixo, descricao')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (!equipesError && equipesData && equipesData.length > 0) {
        console.log('✅ [ColaboradoresApi] Equipes encontradas na tabela equipes:', equipesData.length);
        
        // Contar colaboradores por equipe
        const equipesComContagem = await Promise.all(
          equipesData.map(async (equipe) => {
            const { count } = await supabase
              .from('colaboradores')
              .select('*', { count: 'exact', head: true })
              .eq('equipe_id', equipe.id)
              .is('deleted_at', null);

            return {
              id: equipe.id,
              nome: equipe.name,
              count: count || 0,
              tipo_equipe: equipe.descricao || 'equipe'
            };
          })
        );

        console.log('✅ [ColaboradoresApi] Retornando equipes da tabela:', equipesComContagem);
        return equipesComContagem;
      }
    } catch (e) {
      console.warn('⚠️ [ColaboradoresApi] Erro ao buscar da tabela equipes, usando fallback:', e);
    }
    
    // ✅ FALLBACK: Agrupar por tipo_equipe
    console.log('🔄 [ColaboradoresApi] Usando fallback por tipo_equipe...');
    
    const { data: colaboradoresData, error: colaboradoresError } = await supabase
      .from('colaboradores')
      .select('id, name, tipo_equipe')
      .eq('company_id', companyId)
      .eq('status', 'ativo')
      .is('deleted_at', null)
      .not('tipo_equipe', 'is', null);

    if (colaboradoresError) {
      console.error('Erro ao buscar colaboradores:', colaboradoresError);
      throw new Error(`Erro ao buscar colaboradores: ${colaboradoresError.message}`);
    }

    console.log(`Colaboradores encontrados: ${colaboradoresData?.length || 0}`);
    
    const colaboradoresPorTipo: Record<string, Array<{ id: string; name: string; tipo_equipe: string }>> = {};
    colaboradoresData?.forEach(col => {
      if (col.tipo_equipe) {
        if (!colaboradoresPorTipo[col.tipo_equipe]) {
          colaboradoresPorTipo[col.tipo_equipe] = [];
        }
        colaboradoresPorTipo[col.tipo_equipe].push(col);
      }
    });

    const equipes: Array<{ id: string; nome: string; count: number; tipo_equipe: string }> = []
    
    const mapeamentoEquipes: Record<string, string> = {
      'pavimentacao': 'Equipe A',
      'maquinas': 'Equipe B',
      'apoio': 'Equipe de Apoio'
    }

    Object.entries(colaboradoresPorTipo).forEach(([tipoEquipe, colaboradores]) => {
      const nomeEquipe = mapeamentoEquipes[tipoEquipe] || `Equipe ${tipoEquipe}`
      const equipeId = colaboradores[0].id
      
      equipes.push({
        id: equipeId,
        nome: nomeEquipe,
        count: colaboradores.length,
        tipo_equipe: tipoEquipe
      })
    })

    return equipes
  } catch (error) {
    console.error('Erro ao buscar equipes:', error)
    throw error
  }
}


// ============================================================================
// CAMADA DE COMPATIBILIDADE (para migração gradual)
// ============================================================================

/**
 * Converte ColaboradorSimples para formato antigo Colaborador
 * Usado para manter compatibilidade com componentes legados
 * @deprecated Use ColaboradorSimples diretamente nos novos componentes
 */
export function toColaboradorLegacy(simples: ColaboradorSimples): any {
  // Mapear tipo_equipe do banco para o frontend
  const mapearTipoEquipeBancoParaFrontend = (tipoEquipe: string): string => {
    const mapeamento: { [key: string]: string } = {
      'pavimentacao': 'equipe_a',
      'maquinas': 'equipe_b',
      'apoio': 'escritorio',
      // Valores antigos (compatibilidade)
      'massa': 'equipe_a',
      'administrativa': 'escritorio'
    };
    return mapeamento[tipoEquipe] || 'equipe_a';
  };

  const resultado = {
    id: simples.id,
    nome: simples.name,
    tipo_equipe: mapearTipoEquipeBancoParaFrontend(simples.tipo_equipe),
    funcao: simples.position || 'Ajudante',
    tipo_contrato: simples.tipo_contrato,
    salario_fixo: simples.salario_fixo,
    registrado: simples.registrado,
    vale_transporte: simples.vale_transporte,
    cpf: simples.cpf,
    telefone: simples.phone,
    email: simples.email,
    ativo: simples.status === 'ativo',
    company_id: simples.company_id,
    created_at: simples.created_at,
    updated_at: simples.updated_at,
    // Campos adicionais para compatibilidade
    data_pagamento_1: simples.data_pagamento_1,
    data_pagamento_2: simples.data_pagamento_2,
    valor_pagamento_1: simples.valor_pagamento_1,
    valor_pagamento_2: simples.valor_pagamento_2,
    qtd_passagens_por_dia: simples.qtd_passagens_por_dia,
    equipamento_vinculado_id: simples.equipamento_vinculado_id,
    equipe_id: simples.equipe_id
  };
  
  // Log para debug
  console.log('🔄 [toColaboradorLegacy] Convertendo colaborador:', {
    id: simples.id,
    name: simples.name,
    equipe_id_original: simples.equipe_id,
    equipe_id_resultado: resultado.equipe_id,
    tipo_equipe_original: simples.tipo_equipe,
    tipo_equipe_resultado: resultado.tipo_equipe
  });
  
  return resultado;
}




