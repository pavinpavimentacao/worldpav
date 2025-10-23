// =====================================================
// TIPOS PARA DOCUMENTOS PESSOAIS
// =====================================================

import { CategoriaCNH } from './colaboradores';

/**
 * Interface para documentos pessoais dos colaboradores
 */
export interface DocumentoPessoal {
  id: string;
  colaborador_id: string;
  document_type: 'RG' | 'CPF' | 'CNH' | 'Comprovante_Residencia' | 'Certidao_Nascimento' | 'Outros';
  file_url: string;
  file_name: string;
  file_size?: number;
  upload_date: string;
  expiry_date?: string;
  status: 'ativo' | 'vencido' | 'expirado';
  observations?: string;
  created_at: string;
  deleted_at?: string;
}

/**
 * Interface para CNH específica
 */
export interface CNHData {
  numero: string;
  categoria: CategoriaCNH;
  validade: string;
  arquivo_url?: string;
}

/**
 * Interface para criação de documento
 */
export interface DocumentoPessoalInsert {
  colaborador_id: string;
  document_type: 'RG' | 'CPF' | 'CNH' | 'Comprovante_Residencia' | 'Certidao_Nascimento' | 'Outros';
  file_url: string;
  file_name: string;
  file_size?: number;
  expiry_date?: string;
  observations?: string;
}

/**
 * Interface para atualização de documento
 */
export interface DocumentoPessoalUpdate {
  file_url?: string;
  file_name?: string;
  file_size?: number;
  expiry_date?: string;
  status?: 'ativo' | 'vencido' | 'expirado';
  observations?: string;
}

/**
 * Opções para tipos de documento
 */
export const TIPOS_DOCUMENTO_OPTIONS = [
  { value: 'RG', label: 'RG - Registro Geral' },
  { value: 'CPF', label: 'CPF - Cadastro de Pessoa Física' },
  { value: 'CNH', label: 'CNH - Carteira de Habilitação' },
  { value: 'Comprovante_Residencia', label: 'Comprovante de Residência' },
  { value: 'Certidao_Nascimento', label: 'Certidão de Nascimento' },
  { value: 'Outros', label: 'Outros Documentos' },
];

/**
 * Opções para status de documento
 */
export const STATUS_DOCUMENTO_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'expirado', label: 'Expirado' },
];

