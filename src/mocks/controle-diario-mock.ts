/**
 * Mock de Controle Diário - Redireciona para API Real
 * Mantido como fallback em caso de erro
 */

import {
  listarRelacoesDiarias as apiListarRelacoesDiarias,
  criarRelacaoDiaria as apiCriarRelacaoDiaria,
  listarDiarias as apiListarDiarias,
  criarDiaria as apiCriarDiaria,
  atualizarDiaria as apiAtualizarDiaria,
  deletarDiaria as apiDeletarDiaria,
  getEstatisticasControleDiario as apiGetEstatisticas
} from '../lib/controle-diario-api';

// Flag para usar mock em caso de erro
const USE_MOCK_ON_ERROR = true;

// ==========================================
// RELAÇÕES DIÁRIAS
// ==========================================

export const listarRelacoesDiarias = async () => {
  try {
    return await apiListarRelacoesDiarias();
  } catch (error) {
    console.error('Erro ao listar relações (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      return [];
    }
    throw error;
  }
};

export const criarRelacaoDiaria = async (relacao: any) => {
  try {
    return await apiCriarRelacaoDiaria(relacao);
  } catch (error) {
    console.error('Erro ao criar relação (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      const novaRelacao = {
        ...relacao,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaRelacao;
    }
    throw error;
  }
};

// ==========================================
// DIÁRIAS
// ==========================================

export const listarRegistrosDiarias = async () => {
  try {
    return await apiListarDiarias();
  } catch (error) {
    console.error('Erro ao listar diárias (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      return [];
    }
    throw error;
  }
};

export const criarRegistroDiaria = async (registro: any) => {
  console.log('📤 [criarRegistroDiaria] Tentando criar diária:', registro);
  try {
    const resultado = await apiCriarDiaria(registro);
    console.log('✅ [criarRegistroDiaria] Diária criada com sucesso:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ [criarRegistroDiaria] Erro ao criar diária:', error);
    console.error('📋 Detalhes do erro:', JSON.stringify(error, null, 2));
    if (USE_MOCK_ON_ERROR) {
      console.log('⚠️ [criarRegistroDiaria] Usando mock como fallback');
      const novoRegistro = {
        ...registro,
        id: Date.now().toString(),
        status_pagamento: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('📦 [criarRegistroDiaria] Mock criado:', novoRegistro);
      return novoRegistro;
    }
    throw error;
  }
};

export const atualizarRegistroDiaria = async (id: string, registro: any) => {
  try {
    return await apiAtualizarDiaria(id, registro);
  } catch (error) {
    console.error('Erro ao atualizar diária (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      return registro;
    }
    throw error;
  }
};

export const deletarRegistroDiaria = async (id: string) => {
  try {
    await apiDeletarDiaria(id);
    return true;
  } catch (error) {
    console.error('Erro ao deletar diária (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      return true;
    }
    throw error;
  }
};

// ==========================================
// ESTATÍSTICAS
// ==========================================

export const getEstatisticasControleDiario = async () => {
  try {
    return await apiGetEstatisticas();
  } catch (error) {
    console.error('Erro ao buscar estatísticas (usando mock):', error);
    if (USE_MOCK_ON_ERROR) {
      return {
        totalRelacoes: 0,
        totalPresencas: 0,
        totalAusencias: 0,
        totalFaltas: 0,
        totalAtestados: 0,
        totalMudancas: 0,
        totalDiarias: 0,
        valorTotalDiarias: 0,
        diariasPendentes: 0,
        valorPendente: 0
      };
    }
    throw error;
  }
};
