/**
 * Utilitários para Upload de Arquivos
 */

import { supabase } from '../lib/supabase'

/**
 * Valida se o arquivo é um PDF
 */
export function validatePDF(file: File): { valido: boolean; mensagem?: string } {
  const allowedTypes = ['application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valido: false,
      mensagem: 'O arquivo deve ser um PDF'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valido: false,
      mensagem: 'O arquivo não pode ter mais de 10MB'
    }
  }
  
  return { valido: true }
}

/**
 * Valida se o arquivo é um XLSX ou PDF
 */
export function validateExcelOrPDF(file: File): { valido: boolean; mensagem?: string } {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ]
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valido: false,
      mensagem: 'O arquivo deve ser um PDF ou Excel (XLSX/XLS)'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valido: false,
      mensagem: 'O arquivo não pode ter mais de 10MB'
    }
  }
  
  return { valido: true }
}

/**
 * Faz upload de arquivo para o Supabase Storage
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Faz o upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Erro ao fazer upload:', error)
      return {
        url: null,
        error: error.message
      }
    }
    
    // Obtém a URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return {
      url: urlData.publicUrl,
      error: null
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload'
    }
  }
}

/**
 * Remove arquivo do Supabase Storage
 */
export async function removeFromSupabaseStorage(
  bucket: string,
  fileUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extrai o caminho do arquivo da URL
    const urlParts = fileUrl.split(`${bucket}/`)
    if (urlParts.length < 2) {
      return {
        success: false,
        error: 'URL inválida'
      }
    }
    
    const filePath = urlParts[1]
    
    // Remove o arquivo
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Erro ao remover arquivo:', error)
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: true,
      error: null
    }
  } catch (error) {
    console.error('Erro ao remover arquivo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao remover arquivo'
    }
  }
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Obtém a extensão do arquivo
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

/**
 * Verifica se o arquivo é uma imagem
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Gera um nome de arquivo seguro (remove caracteres especiais)
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
    .toLowerCase()
}

