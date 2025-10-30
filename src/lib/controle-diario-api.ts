/**
 * API de Controle Diário
 * Serviços para gerenciar relações diárias, presenças e diárias
 */

import { supabase } from './supabase';
import { getCurrentCompanyId, getCurrentUserId } from './utils';
import {
  RelacaoDiaria,
  RelacaoDiariaCompleta,
  CreateRelacaoDiariaData,
  RegistroDiaria,
  CreateRegistroDiariaData,
  EstatisticasControleDiario
} from '../types/controle-diario';

// ==========================================
// RELAÇÕES DIÁRIAS
// ==========================================

/**
 * Listar todas as relações diárias
 */
export async function listarRelacoesDiarias(filters?: {
  data_inicio?: string;
  data_fim?: string;
  equipe_id?: string;
  obra_id?: string;
}): Promise<RelacaoDiariaCompleta[]> {
  try {
    let query = supabase
      .from('controle_diario_relacoes')
      .select('*')
      .is('deleted_at', null) // Filtrar relações deletadas (soft delete)
      .order('date', { ascending: false });

    // Aplicar filtros
    if (filters?.data_inicio) {
      query = query.gte('date', filters.data_inicio);
    }
    if (filters?.data_fim) {
      query = query.lte('date', filters.data_fim);
    }
    if (filters?.equipe_id) {
      query = query.eq('equipe_id', filters.equipe_id);
    }
    if (filters?.obra_id) {
      query = query.eq('obra_id', filters.obra_id);
    }

    const { data: relacoes, error } = await query;

    if (error) throw error;

    // Buscar registros de presença para cada relação
    const relacoesCompletas = await Promise.all(
      (relacoes || []).map(async (relacao) => {
        const { data: presencas, error: presencasError } = await supabase
          .from('controle_diario_presencas')
          .select('*')
          .eq('relacao_id', relacao.id);

        if (presencasError) {
          console.error(`❌ Erro ao buscar presenças para relação ${relacao.id}:`, presencasError);
        } else {
          console.log(`✅ ${presencas?.length || 0} presenças encontradas para relação ${relacao.id}`);
        }

        // Buscar dados dos colaboradores
        const presencasCompletas = await Promise.all(
          (presencas || []).map(async (presenca) => {
            const { data: colaborador } = await supabase
              .from('colaboradores')
              .select('name, position')
              .eq('id', presenca.colaborador_id)
              .single();

            return {
              id: presenca.id,
              relacao_diaria_id: presenca.relacao_id,
              colaborador_id: presenca.colaborador_id,
              colaborador_nome: colaborador?.name || '',
              colaborador_funcao: colaborador?.position || '',
              status: presenca.status as any,
              equipe_destino_id: presenca.equipe_destino_id,
              observacoes: presenca.observacoes,
              created_at: presenca.created_at,
              updated_at: presenca.updated_at
            };
          })
        );

        // Calcular totais a partir dos registros reais (mais confiável)
        const totalPresentesCalculado = presencasCompletas.filter(p => p.status === 'presente').length;
        const totalAusenciasCalculado = presencasCompletas.filter(p => p.status !== 'presente').length;

        // Detectar inconsistência entre banco e registros
        const usarTotaisDoBanco = presencasCompletas.length === 0 && 
          (relacao.total_presentes > 0 || relacao.total_ausencias > 0);

        if (!usarTotaisDoBanco && 
            (relacao.total_presentes !== totalPresentesCalculado || relacao.total_ausencias !== totalAusenciasCalculado)) {
          console.warn(`⚠️ Inconsistência detectada na relação ${relacao.id}:`, {
            total_presentes_banco: relacao.total_presentes,
            total_presentes_calculado: totalPresentesCalculado,
            total_ausencias_banco: relacao.total_ausencias,
            total_ausencias_calculado: totalAusenciasCalculado,
            registros_encontrados: presencasCompletas.length
          });
        }

        // Usar totais calculados, mas se não houver registros e houver totais no banco, usar os do banco
        const totalPresentesFinal = usarTotaisDoBanco ? relacao.total_presentes || 0 : totalPresentesCalculado;
        const totalAusenciasFinal = usarTotaisDoBanco ? relacao.total_ausencias || 0 : totalAusenciasCalculado;

        // Buscar nome da equipe se houver equipe_id
        let equipeNome = '';
        if (relacao.equipe_id) {
          try {
            // Tentar buscar equipe nas tabelas de parceiros (equipes terceiras)
            const { data: equipeParceiro } = await supabase
              .from('parceiros_equipes')
              .select('nome')
              .eq('id', relacao.equipe_id)
              .maybeSingle();

            if (equipeParceiro?.nome) {
              equipeNome = equipeParceiro.nome;
            } else {
              // Se não encontrou nas equipes de parceiros, pode ser uma equipe própria
              // Baseado no tipo_equipe dos colaboradores da relação
              const tiposEquipe: Record<string, string> = {
                'pavimentacao': 'Equipe de Pavimentação',
                'maquinas': 'Equipe de Máquinas',
                'apoio': 'Equipe de Apoio'
              };
              
              // Buscar tipo_equipe dos colaboradores da relação para determinar o nome
              if (presencasCompletas.length > 0) {
                const primeiroColaborador = presencasCompletas[0];
                // Buscar colaborador para obter tipo_equipe
                const { data: colab } = await supabase
                  .from('colaboradores')
                  .select('tipo_equipe')
                  .eq('id', primeiroColaborador.colaborador_id)
                  .maybeSingle();
                
                if (colab?.tipo_equipe && tiposEquipe[colab.tipo_equipe]) {
                  equipeNome = tiposEquipe[colab.tipo_equipe];
                }
              } else {
                // Se não há colaboradores, tentar identificar pelo UUID conhecido
                const equipesUUIDs: Record<string, string> = {
                  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 'Equipe de Pavimentação',
                  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12': 'Equipe de Máquinas',
                  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13': 'Equipe de Apoio'
                };
                
                if (equipesUUIDs[relacao.equipe_id]) {
                  equipeNome = equipesUUIDs[relacao.equipe_id];
                }
              }
            }
          } catch (error) {
            console.warn(`Erro ao buscar nome da equipe ${relacao.equipe_id}:`, error);
          }
        }

        return {
          id: relacao.id,
          data: relacao.date,
          equipe_id: relacao.equipe_id || '',
          equipe_nome: equipeNome,
          total_presentes: totalPresentesFinal, // Usar valor calculado ou do banco
          total_ausencias: totalAusenciasFinal, // Usar valor calculado ou do banco
          observacoes_dia: relacao.observacoes || '',
          created_at: relacao.created_at,
          updated_at: relacao.updated_at,
          registros: presencasCompletas
        };
      })
    );

    return relacoesCompletas;
  } catch (error: any) {
    console.error('Erro ao listar relações diárias:', error);
    throw new Error(`Erro ao listar relações diárias: ${error.message}`);
  }
}

/**
 * Buscar relação diária por ID
 */
export async function getRelacaoDiariaById(id: string): Promise<RelacaoDiariaCompleta | null> {
  try {
    const { data: relacao, error } = await supabase
      .from('controle_diario_relacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!relacao) return null;

    // Buscar presenças
    const { data: presencas } = await supabase
      .from('controle_diario_presencas')
      .select('*')
      .eq('relacao_id', id);

    const presencasCompletas = await Promise.all(
      (presencas || []).map(async (presenca) => {
        const { data: colaborador } = await supabase
          .from('colaboradores')
          .select('name, position')
          .eq('id', presenca.colaborador_id)
          .single();

        return {
          id: presenca.id,
          relacao_diaria_id: presenca.relacao_id,
          colaborador_id: presenca.colaborador_id,
          colaborador_nome: colaborador?.name || '',
          colaborador_funcao: colaborador?.position || '',
          status: presenca.status as any,
          equipe_destino_id: presenca.equipe_destino_id,
          observacoes: presenca.observacoes,
          created_at: presenca.created_at,
          updated_at: presenca.updated_at
        };
      })
    );

    return {
      id: relacao.id,
      data: relacao.date,
      equipe_id: relacao.equipe_id || '',
      total_presentes: relacao.total_presentes || 0,
      total_ausencias: relacao.total_ausencias || 0,
      observacoes_dia: relacao.observacoes || '',
      created_at: relacao.created_at,
      updated_at: relacao.updated_at,
      registros: presencasCompletas
    };
  } catch (error: any) {
    console.error('Erro ao buscar relação diária:', error);
    throw new Error(`Erro ao buscar relação diária: ${error.message}`);
  }
}

/**
 * Criar nova relação diária
 */
export async function criarRelacaoDiaria(data: CreateRelacaoDiariaData): Promise<RelacaoDiariaCompleta> {
  try {
    // 1. Buscar company_id e user_id do JWT
    let companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();

    // Se não encontrou company_id, usar o padrão do WorldPav
    if (!companyId) {
      console.warn('⚠️ Company ID não encontrado, usando WorldPav como padrão');
      const { WORLDPAV_COMPANY_ID } = await import('./company-utils');
      companyId = WORLDPAV_COMPANY_ID;
    }

    // Verificar se a empresa existe, se não existir, criar ou usar fallback
    const { data: companyExists } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .maybeSingle();

    if (!companyExists) {
      console.warn(`⚠️ Empresa ${companyId} não encontrada, tentando criar ou usar padrão`);
      const { getOrCreateDefaultCompany } = await import('./company-utils');
      companyId = await getOrCreateDefaultCompany();
    }

    // Verificar se userId existe na tabela profiles antes de usar
    let validUserId = null;
    if (userId) {
      const { data: profileExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileExists) {
        validUserId = userId;
      } else {
        console.warn(`⚠️ User ID ${userId} não encontrado na tabela profiles, usando null`);
      }
    }

    // 2. Criar relação
    const insertData: any = {
      company_id: companyId,
      date: data.data,
      equipe_id: data.equipe_id,
      observacoes: data.observacoes_dia,
      status: 'finalizada'
    };

    // Só adicionar created_by se for válido
    if (validUserId) {
      insertData.created_by = validUserId;
    }

    const { data: relacao, error: relacaoError } = await supabase
      .from('controle_diario_relacoes')
      .insert(insertData)
      .select()
      .single();

    if (relacaoError) throw relacaoError;
    if (!relacao) throw new Error('Erro ao criar relação');

    // 3. Criar registros de presença (presentes)
    const presencasPresentes = data.colaboradores_presentes.map(colab_id => ({
      relacao_id: relacao.id,
      colaborador_id: colab_id,
      status: 'presente'
    }));

    if (presencasPresentes.length > 0) {
      const { error: presentesError } = await supabase
        .from('controle_diario_presencas')
        .insert(presencasPresentes);

      if (presentesError) throw presentesError;
    }

    // 4. Criar registros de presença (ausentes)
    const presencasAusentes = data.ausencias.map(ausencia => ({
      relacao_id: relacao.id,
      colaborador_id: ausencia.colaborador_id,
      status: ausencia.status,
      equipe_destino_id: ausencia.equipe_destino_id,
      observacoes: ausencia.observacoes
    }));

    if (presencasAusentes.length > 0) {
      const { error: ausentesError } = await supabase
        .from('controle_diario_presencas')
        .insert(presencasAusentes);

      if (ausentesError) throw ausentesError;
    }

    // 5. Buscar relação completa
    const relacaoCompleta = await getRelacaoDiariaById(relacao.id);
    if (!relacaoCompleta) throw new Error('Erro ao buscar relação criada');

    return relacaoCompleta;
  } catch (error: any) {
    console.error('Erro ao criar relação diária:', error);
    throw new Error(`Erro ao criar relação diária: ${error.message}`);
  }
}

/**
 * Atualizar relação diária
 */
export async function atualizarRelacaoDiaria(
  id: string,
  data: Partial<CreateRelacaoDiariaData>
): Promise<RelacaoDiariaCompleta> {
  try {
    const updateData: any = {};
    if (data.data) updateData.date = data.data;
    if (data.equipe_id !== undefined) updateData.equipe_id = data.equipe_id;
    if (data.observacoes_dia !== undefined) updateData.observacoes = data.observacoes_dia;

    const { error } = await supabase
      .from('controle_diario_relacoes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Se houve mudanças nas presenças, atualizar
    if (data.colaboradores_presentes || data.ausencias) {
      // Remover todas as presenças atuais
      await supabase
        .from('controle_diario_presencas')
        .delete()
        .eq('relacao_id', id);

      // Recriar presenças
      if (data.colaboradores_presentes) {
        const presentes = data.colaboradores_presentes.map(colab_id => ({
          relacao_id: id,
          colaborador_id: colab_id,
          status: 'presente'
        }));
        await supabase.from('controle_diario_presencas').insert(presentes);
      }

      if (data.ausencias) {
        const ausentes = data.ausencias.map(ausencia => ({
          relacao_id: id,
          colaborador_id: ausencia.colaborador_id,
          status: ausencia.status,
          equipe_destino_id: ausencia.equipe_destino_id,
          observacoes: ausencia.observacoes
        }));
        await supabase.from('controle_diario_presencas').insert(ausentes);
      }
    }

    const relacao = await getRelacaoDiariaById(id);
    if (!relacao) throw new Error('Relação não encontrada');

    return relacao;
  } catch (error: any) {
    console.error('Erro ao atualizar relação diária:', error);
    throw new Error(`Erro ao atualizar relação diária: ${error.message}`);
  }
}

/**
 * Deletar relação diária (soft delete)
 */
export async function deletarRelacaoDiaria(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('controle_diario_relacoes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao deletar relação diária:', error);
    throw new Error(`Erro ao deletar relação diária: ${error.message}`);
  }
}

// ==========================================
// DIÁRIAS
// ==========================================

/**
 * Listar diárias
 */
export async function listarDiarias(filters?: {
  colaborador_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status_pagamento?: string;
}): Promise<RegistroDiaria[]> {
  try {
    let query = supabase
      .from('controle_diario_diarias')
      .select('*, relacao_id(*)')
      .order('date', { ascending: false });

    if (filters?.colaborador_id) {
      query = query.eq('colaborador_id', filters.colaborador_id);
    }
    if (filters?.data_inicio) {
      query = query.gte('date', filters.data_inicio);
    }
    if (filters?.data_fim) {
      query = query.lte('date', filters.data_fim);
    }
    if (filters?.status_pagamento) {
      query = query.eq('status_pagamento', filters.status_pagamento);
    }

    const { data: diarias, error } = await query;

    if (error) throw error;

    // Buscar dados dos colaboradores
    const diariasCompletas = await Promise.all(
      (diarias || []).map(async (diaria) => {
        const { data: colaborador } = await supabase
          .from('colaboradores')
          .select('name, position')
          .eq('id', diaria.colaborador_id)
          .single();

        return {
          id: diaria.id,
          colaborador_id: diaria.colaborador_id,
          colaborador_nome: colaborador?.name || '',
          colaborador_funcao: colaborador?.position || '',
          quantidade: diaria.quantidade || 1,
          valor_unitario: diaria.valor_unitario,
          adicional: diaria.adicional || 0,
          desconto: diaria.desconto || 0,
          valor_total: diaria.valor_total,
          data_diaria: diaria.data_diaria,
          data_pagamento: diaria.data_pagamento || undefined,
          status_pagamento: (diaria.status_pagamento || 'pendente') as any,
          observacoes: diaria.observacoes || '',
          relacao_diaria_id: diaria.relacao_id,
          created_at: diaria.created_at,
          updated_at: diaria.updated_at
        };
      })
    );

    return diariasCompletas;
  } catch (error: any) {
    console.error('Erro ao listar diárias:', error);
    throw new Error(`Erro ao listar diárias: ${error.message}`);
  }
}

/**
 * Criar diária
 */
export async function criarDiaria(data: CreateRegistroDiariaData): Promise<RegistroDiaria> {
  console.log('🔍 [criarDiaria] Iniciando criação de diária:', data);
  try {
    // 1. Buscar company_id e user_id
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();

    console.log('📋 [criarDiaria] Company ID:', companyId);
    console.log('📋 [criarDiaria] User ID:', userId);

    if (!companyId) throw new Error('Company ID não encontrado');
    // userId pode ser null se não autenticado - não é obrigatório

    // 2. Verificar ou criar relação diária para a data
    let relacaoId = data.relacao_diaria_id;

    console.log('🔍 [criarDiaria] Verificando relação diária para:', data.data_diaria);

    if (!relacaoId) {
      // Buscar relação existente para a data
      const { data: relacaoExistente, error: buscaError } = await supabase
        .from('controle_diario_relacoes')
        .select('id')
        .eq('company_id', companyId)
        .eq('date', data.data_diaria)
        .is('deleted_at', null)
        .maybeSingle();

      if (relacaoExistente && !buscaError) {
        relacaoId = relacaoExistente.id;
        console.log('✅ [criarDiaria] Usando relação existente:', relacaoId);
      } else {
        console.log('⚠️ [criarDiaria] Relação não encontrada, criando nova...');
        // Criar nova relação diária
        const insertData: any = {
          company_id: companyId,
          date: data.data_diaria,
          status: 'finalizada'
        };
        
        // Verificar se userId existe na tabela profiles antes de usar
        let validUserId = null;
        if (userId) {
          const { data: profileExists } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
          
          if (profileExists) {
            validUserId = userId;
            console.log('✅ [criarDiaria] User ID válido, adicionando created_by');
          } else {
            console.log('⚠️ [criarDiaria] User ID não encontrado na tabela profiles, ignorando created_by');
          }
        }
        
        // Só adicionar created_by se userId for válido
        if (validUserId) {
          insertData.created_by = validUserId;
        }
        
        const { data: novaRelacao, error: relacaoError } = await supabase
          .from('controle_diario_relacoes')
          .insert(insertData)
          .select()
          .single();

        if (relacaoError) {
          console.error('❌ [criarDiaria] Erro ao criar relação:', relacaoError);
          console.error('📋 [criarDiaria] Código:', relacaoError.code);
          console.error('📋 [criarDiaria] Mensagem:', relacaoError.message);
          console.error('📋 [criarDiaria] Detalhes:', relacaoError.details);
          throw new Error(`Erro ao criar relação diária: ${relacaoError.message}`);
        }

        if (!novaRelacao) throw new Error('Erro ao criar relação diária');
        relacaoId = novaRelacao.id;
        console.log('✅ [criarDiaria] Relação criada:', relacaoId);
      }
    }

    // 3. Calcular valor_total
    const quantidade = data.quantidade || 1;
    const valorUnitario = data.valor_unitario || 0;
    const adicional = data.adicional || 0;
    const desconto = data.desconto || 0;
    const valorTotal = (quantidade * valorUnitario) + adicional - desconto;

    // 4. Inserir diária
    const dadosInsert = {
      relacao_id: relacaoId,
      colaborador_id: data.colaborador_id,
      date: data.data_diaria,
      data_diaria: data.data_diaria,
      quantidade: quantidade,
      valor_unitario: valorUnitario,
      adicional: adicional,
      desconto: desconto,
      valor_total: valorTotal,
      data_pagamento: data.data_pagamento || null,
      status_pagamento: 'pendente',
      observacoes: data.observacoes || null
    };

    console.log('📤 [criarDiaria] Inserindo diária no banco:', dadosInsert);

    const { data: diaria, error } = await supabase
      .from('controle_diario_diarias')
      .insert(dadosInsert)
      .select()
      .single();

    if (error) {
      console.error('❌ [criarDiaria] Erro ao inserir diária:', error);
      console.error('📋 [criarDiaria] Código do erro:', error.code);
      console.error('📋 [criarDiaria] Mensagem:', error.message);
      console.error('📋 [criarDiaria] Detalhes:', error.details);
      // Se for erro de duplicata, informar adequadamente
      if (error.code === '23505') {
        throw new Error('Já existe uma diária para este colaborador nesta data');
      }
      throw error;
    }

    console.log('✅ [criarDiaria] Diária inserida no banco:', diaria);

    if (!diaria) throw new Error('Erro ao criar diária');

    // 5. Buscar dados completos
    const diarias = await listarDiarias();
    const diariaCompleta = diarias.find(d => d.id === diaria.id);

    if (!diariaCompleta) throw new Error('Erro ao buscar diária criada');

    return diariaCompleta;
  } catch (error: any) {
    console.error('Erro ao criar diária:', error);
    throw new Error(`Erro ao criar diária: ${error.message}`);
  }
}

/**
 * Atualizar diária
 */
export async function atualizarDiaria(id: string, data: Partial<CreateRegistroDiariaData>): Promise<RegistroDiaria> {
  try {
    console.log('🔍 [atualizarDiaria] Iniciando atualização para ID:', id);
    console.log('🔍 [atualizarDiaria] Dados para atualizar:', data);
    
    // Buscar diária atual para calcular valor_total
    const { data: diariaAtual, error: buscaError } = await supabase
      .from('controle_diario_diarias')
      .select('quantidade, valor_unitario, adicional, desconto')
      .eq('id', id)
      .single();

    if (buscaError) {
      console.error('❌ [atualizarDiaria] Erro ao buscar diária:', buscaError);
      throw buscaError;
    }
    if (!diariaAtual) throw new Error('Diária não encontrada');

    console.log('✅ [atualizarDiaria] Diária atual encontrada:', diariaAtual);

    const updateData: any = {};
    if (data.quantidade !== undefined) updateData.quantidade = data.quantidade;
    if (data.valor_unitario !== undefined) updateData.valor_unitario = data.valor_unitario;
    if (data.adicional !== undefined) updateData.adicional = data.adicional;
    if (data.desconto !== undefined) updateData.desconto = data.desconto;
    if (data.data_pagamento !== undefined) updateData.data_pagamento = data.data_pagamento;
    if (data.status_pagamento !== undefined) updateData.status_pagamento = data.status_pagamento;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    // Adicionar updated_at
    updateData.updated_at = new Date().toISOString();

    // Calcular novo valor_total
    const quantidade = updateData.quantidade ?? diariaAtual.quantidade ?? 1;
    const valorUnitario = updateData.valor_unitario ?? diariaAtual.valor_unitario ?? 0;
    const adicional = updateData.adicional ?? diariaAtual.adicional ?? 0;
    const desconto = updateData.desconto ?? diariaAtual.desconto ?? 0;
    const valorTotal = (quantidade * valorUnitario) + adicional - desconto;
    
    updateData.valor_total = valorTotal;

    console.log('📤 [atualizarDiaria] Dados para UPDATE:', updateData);

    const { data: updatedData, error } = await supabase
      .from('controle_diario_diarias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [atualizarDiaria] Erro no UPDATE:', error);
      throw error;
    }

    console.log('✅ [atualizarDiaria] UPDATE realizado com sucesso:', updatedData);

    const diarias = await listarDiarias();
    const diaria = diarias.find(d => d.id === id);
    if (!diaria) throw new Error('Diária não encontrada após atualização');

    return diaria;
  } catch (error: any) {
    console.error('❌ [atualizarDiaria] Erro ao atualizar diária:', error);
    throw new Error(`Erro ao atualizar diária: ${error.message}`);
  }
}

/**
 * Marcar diária como paga
 */
export async function marcarDiariaComoPaga(id: string): Promise<RegistroDiaria> {
  try {
    const { error } = await supabase
      .from('controle_diario_diarias')
      .update({ status_pagamento: 'pago', data_pagamento: new Date().toISOString().split('T')[0] })
      .eq('id', id);

    if (error) throw error;

    const diarias = await listarDiarias();
    const diaria = diarias.find(d => d.id === id);
    if (!diaria) throw new Error('Diária não encontrada');

    return diaria;
  } catch (error: any) {
    console.error('Erro ao marcar diária como paga:', error);
    throw new Error(`Erro ao marcar diária como paga: ${error.message}`);
  }
}

/**
 * Deletar diária
 */
export async function deletarDiaria(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('controle_diario_diarias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao deletar diária:', error);
    throw new Error(`Erro ao deletar diária: ${error.message}`);
  }
}

// ==========================================
// ESTATÍSTICAS
// ==========================================

/**
 * Buscar estatísticas do controle diário
 */
export async function getEstatisticasControleDiario(): Promise<EstatisticasControleDiario> {
  try {
    // Buscar todas as relações
    const relacoes = await listarRelacoesDiarias();

    // Calcular estatísticas
    const totalRelacoes = relacoes.length;
    const totalPresencas = relacoes.reduce((sum, r) => sum + r.total_presentes, 0);
    const totalAusencias = relacoes.reduce((sum, r) => sum + r.total_ausencias, 0);

    // Buscar diárias
    const diarias = await listarDiarias();
    const totalDiarias = diarias.length;
    const valorTotalDiarias = diarias.reduce((sum, d) => sum + d.valor_total, 0);
    const diariasPendentes = diarias.filter(d => d.status_pagamento === 'pendente').length;
    const valorPendente = diarias
      .filter(d => d.status_pagamento === 'pendente')
      .reduce((sum, d) => sum + d.valor_total, 0);

    // Calcular por tipo de ausência
    const totalFaltas = relacoes.reduce((sum, r) => {
      return sum + r.registros.filter(reg => reg.status === 'falta').length;
    }, 0);

    const totalAtestados = relacoes.reduce((sum, r) => {
      return sum + r.registros.filter(reg => reg.status === 'atestado').length;
    }, 0);

    const totalMudancas = relacoes.reduce((sum, r) => {
      return sum + r.registros.filter(reg => reg.status === 'mudanca_equipe').length;
    }, 0);

    return {
      totalRelacoes,
      totalPresencas,
      totalAusencias,
      totalFaltas,
      totalAtestados,
      totalMudancas,
      totalDiarias,
      valorTotalDiarias,
      diariasPendentes,
      valorPendente
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
  }
}
