// =====================================================
// WORLDPAV - UTILITÁRIOS DE EMPRESA
// =====================================================
// Funções para gerenciar empresa padrão e contornar problemas de RLS
// =====================================================

import { supabase } from './supabase';

// IDs das empresas
export const WORLDPAV_COMPANY_ID = '39cf8b61-6737-4aa5-af3f-51fba9f12345';
export const PAVIN_COMPANY_ID = '48cf8b61-6737-4aa5-af3f-51fba9f12346';

// ID da empresa padrão para desenvolvimento (Worldpav)
export const DEFAULT_COMPANY_ID = WORLDPAV_COMPANY_ID;

// Dados das empresas simplificadas
export const COMPANIES_DATA = [
  {
    id: WORLDPAV_COMPANY_ID,
    name: 'Worldpav'
  },
  {
    id: PAVIN_COMPANY_ID,
    name: 'Pavin'
  }
];

/**
 * Obtém ou cria as empresas necessárias (Worldpav e Pavin)
 * @returns ID da empresa padrão (Worldpav)
 */
export async function getOrCreateDefaultCompany(): Promise<string> {
  try {
    console.log('🏢 Verificando empresas...');
    
    // Tentar buscar a empresa padrão (Worldpav)
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', DEFAULT_COMPANY_ID)
      .single();
    
    if (existingCompany && !fetchError) {
      console.log('✅ Empresa Worldpav encontrada:', existingCompany.id);
      return existingCompany.id;
    }
    
    console.log('📝 Empresas não encontradas, criando Worldpav e Pavin...');
    
    // Criar as duas empresas
    const { data: newCompanies, error: createError } = await supabase
      .from('companies')
      .insert(COMPANIES_DATA)
      .select('id, name');
    
    if (createError) {
      console.error('❌ Erro ao criar empresas:', createError);
      throw createError;
    }
    
    console.log('✅ Empresas criadas com sucesso:', newCompanies);
    return DEFAULT_COMPANY_ID;
    
  } catch (error) {
    console.error('💥 Erro inesperado ao obter/criar empresas:', error);
    
    // Fallback: retornar o ID padrão mesmo se houver erro
    console.log('🔄 Usando ID padrão como fallback');
    return DEFAULT_COMPANY_ID;
  }
}

/**
 * Verifica se a empresa padrão existe
 * @returns true se existe, false caso contrário
 */
export async function checkDefaultCompanyExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('id', DEFAULT_COMPANY_ID)
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.error('Erro ao verificar empresa padrão:', error);
    return false;
  }
}