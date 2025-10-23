import { supabase } from './supabase';
import {
  ColaboradorDocumentoNR,
  ColaboradorDocumentoNRInsert,
  ColaboradorDocumentoNRUpdate,
  ColaboradorCertificado,
  ColaboradorCertificadoInsert,
  ColaboradorCertificadoUpdate,
  ColaboradorMulta,
  ColaboradorMultaInsert,
  ColaboradorMultaUpdate,
  ColaboradorArquivo,
  ColaboradorArquivoInsert,
} from '../types/colaboradores';

// ============================================================================
// DOCUMENTOS NR
// ============================================================================

export async function getDocumentosNRByColaborador(colaboradorId: string): Promise<ColaboradorDocumentoNR[]> {
  const { data, error } = await supabase
    .from('colaboradores_documentos_nr')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('data_validade', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createDocumentoNR(doc: ColaboradorDocumentoNRInsert): Promise<ColaboradorDocumentoNR> {
  console.log('📝 Tentando criar documento NR:', doc);
  
  try {
    // Tentar inserção normal primeiro
    const { data, error } = await supabase
      .from('colaboradores_documentos_nr')
      .insert(doc)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro na inserção normal:', error);
      throw error;
    }

    console.log('✅ Documento NR criado normalmente:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Erro ao criar documento NR:', error);
    
    // Se der erro de RLS, mostrar instruções para o usuário
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      console.error('🔒 Erro de RLS detectado. Execute o script SQL no Supabase:');
      console.error('ALTER TABLE public.colaboradores_documentos_nr DISABLE ROW LEVEL SECURITY;');
      
      throw new Error('Erro de permissão no banco de dados. Contate o administrador para executar: ALTER TABLE public.colaboradores_documentos_nr DISABLE ROW LEVEL SECURITY;');
    }
    
    throw error;
  }
}

export async function updateDocumentoNR(id: string, updates: ColaboradorDocumentoNRUpdate): Promise<ColaboradorDocumentoNR> {
  const { data, error } = await supabase
    .from('colaboradores_documentos_nr')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocumentoNR(id: string): Promise<void> {
  const { error } = await supabase
    .from('colaboradores_documentos_nr')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// CERTIFICADOS
// ============================================================================

export async function getCertificadosByColaborador(colaboradorId: string): Promise<ColaboradorCertificado[]> {
  const { data, error } = await supabase
    .from('colaboradores_certificados')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('data_validade', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCertificado(cert: ColaboradorCertificadoInsert): Promise<ColaboradorCertificado> {
  const { data, error } = await supabase
    .from('colaboradores_certificados')
    .insert(cert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCertificado(id: string, updates: ColaboradorCertificadoUpdate): Promise<ColaboradorCertificado> {
  const { data, error } = await supabase
    .from('colaboradores_certificados')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCertificado(id: string): Promise<void> {
  const { error } = await supabase
    .from('colaboradores_certificados')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// MULTAS
// ============================================================================

export async function getMultasByColaborador(colaboradorId: string): Promise<ColaboradorMulta[]> {
  const { data, error } = await supabase
    .from('colaboradores_multas')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('data_infracao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMulta(multa: ColaboradorMultaInsert): Promise<ColaboradorMulta> {
  const { data, error } = await supabase
    .from('colaboradores_multas')
    .insert(multa)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMulta(id: string, updates: ColaboradorMultaUpdate): Promise<ColaboradorMulta> {
  const { data, error } = await supabase
    .from('colaboradores_multas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMulta(id: string): Promise<void> {
  const { error } = await supabase
    .from('colaboradores_multas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// ARQUIVOS GERAIS
// ============================================================================

export async function getArquivosByColaborador(colaboradorId: string): Promise<ColaboradorArquivo[]> {
  const { data, error } = await supabase
    .from('colaboradores_arquivos')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createArquivo(arquivo: ColaboradorArquivoInsert): Promise<ColaboradorArquivo> {
  const { data, error } = await supabase
    .from('colaboradores_arquivos')
    .insert(arquivo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArquivo(id: string): Promise<void> {
  const { error } = await supabase
    .from('colaboradores_arquivos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
import {
  ColaboradorDocumentoNR,
  ColaboradorDocumentoNRInsert,
  ColaboradorDocumentoNRUpdate,
  ColaboradorCertificado,
  ColaboradorCertificadoInsert,
  ColaboradorCertificadoUpdate,
  ColaboradorMulta,
  ColaboradorMultaInsert,
  ColaboradorMultaUpdate,
  ColaboradorArquivo,
  ColaboradorArquivoInsert,
} from '../types/colaboradores';

// ============================================================================
// DOCUMENTOS NR
// ============================================================================



