// =====================================================
// API PARA DOCUMENTOS PESSOAIS DOS COLABORADORES
// =====================================================

import { supabase } from './supabase';
import { DocumentoPessoal, DocumentoPessoalInsert, DocumentoPessoalUpdate } from '../types/documentos';

/**
 * Busca todos os documentos de um colaborador
 */
export async function getDocumentosByColaborador(colaboradorId: string): Promise<DocumentoPessoal[]> {
  try {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos:', error);
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
}

/**
 * Busca um documento específico
 */
export async function getDocumentoById(id: string): Promise<DocumentoPessoal | null> {
  try {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Erro ao buscar documento:', error);
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    throw error;
  }
}

/**
 * Cria um novo documento
 */
export async function createDocumento(documento: DocumentoPessoalInsert): Promise<DocumentoPessoal> {
  try {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .insert([documento])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar documento:', error);
      throw new Error(`Erro ao criar documento: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error;
  }
}

/**
 * Atualiza um documento existente
 */
export async function updateDocumento(id: string, updates: DocumentoPessoalUpdate): Promise<DocumentoPessoal> {
  try {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar documento:', error);
      throw new Error(`Erro ao atualizar documento: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
}

/**
 * Deleta um documento (soft delete)
 */
export async function deleteDocumento(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('colaboradores_documentos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar documento:', error);
      throw new Error(`Erro ao deletar documento: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
}

/**
 * Busca documentos por tipo
 */
export async function getDocumentosByType(
  colaboradorId: string, 
  documentType: string
): Promise<DocumentoPessoal[]> {
  try {
    const { data, error } = await supabase
      .from('colaboradores_documentos')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .eq('document_type', documentType)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos por tipo:', error);
      throw new Error(`Erro ao buscar documentos por tipo: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar documentos por tipo:', error);
    throw error;
  }
}

/**
 * Busca CNH de um colaborador
 */
export async function getCNHByColaborador(colaboradorId: string): Promise<DocumentoPessoal | null> {
  try {
    const documentos = await getDocumentosByType(colaboradorId, 'CNH');
    return documentos.length > 0 ? documentos[0] : null;
  } catch (error) {
    console.error('Erro ao buscar CNH:', error);
    throw error;
  }
}

/**
 * Salva ou atualiza CNH de um colaborador
 */
export async function saveCNH(
  colaboradorId: string, 
  cnhData: { numero: string; categoria: string; validade: string; arquivo_url?: string }
): Promise<DocumentoPessoal> {
  try {
    // Verificar se já existe CNH
    const cnhExistente = await getCNHByColaborador(colaboradorId);
    
    if (cnhExistente) {
      // Atualizar CNH existente
      return await updateDocumento(cnhExistente.id, {
        file_name: `CNH_${cnhData.numero}.pdf`,
        file_url: cnhData.arquivo_url || cnhExistente.file_url,
        expiry_date: cnhData.validade,
        observations: `Categoria: ${cnhData.categoria}`,
        status: 'ativo'
      });
    } else {
      // Criar nova CNH
      return await createDocumento({
        colaborador_id: colaboradorId,
        document_type: 'CNH',
        file_name: `CNH_${cnhData.numero}.pdf`,
        file_url: cnhData.arquivo_url || '',
        expiry_date: cnhData.validade,
        observations: `Categoria: ${cnhData.categoria}`,
        status: 'ativo'
      });
    }
  } catch (error) {
    console.error('Erro ao salvar CNH:', error);
    throw error;
  }
}

/**
 * Define data de vencimento padrão para documentos
 */
export function getVencimentoPadrao(documentType: string): string {
  const hoje = new Date();
  
  switch (documentType) {
    case 'CNH':
      // CNH vence em 5 anos
      return new Date(hoje.getFullYear() + 5, hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0];
    
    case 'RG':
      // RG não vence (válido por 20 anos)
      return new Date(hoje.getFullYear() + 20, hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0];
    
    case 'CPF':
      // CPF não vence
      return new Date(hoje.getFullYear() + 50, hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0];
    
    case 'Comprovante_Residencia':
      // Comprovante vence em 3 meses
      return new Date(hoje.getFullYear(), hoje.getMonth() + 3, hoje.getDate()).toISOString().split('T')[0];
    
    case 'Certidao_Nascimento':
      // Certidão não vence
      return new Date(hoje.getFullYear() + 50, hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0];
    
    default:
      // Outros documentos vencem em 1 ano
      return new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate()).toISOString().split('T')[0];
  }
}

