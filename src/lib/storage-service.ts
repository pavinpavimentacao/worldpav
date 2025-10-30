import { supabase } from './supabase'

export class StorageService {
  /**
   * Obter URL pública de um arquivo
   */
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Obter URL assinada de um arquivo (para arquivos privados)
   */
  static async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Erro ao criar URL assinada:', error)
      throw new Error(`Erro ao criar URL assinada: ${error.message}`)
    }

    return data.signedUrl
  }

  /**
   * Baixar arquivo
   */
  static async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) {
      console.error('Erro ao baixar arquivo:', error)
      throw new Error(`Erro ao baixar arquivo: ${error.message}`)
    }

    return data
  }

  /**
   * Deletar arquivo
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Erro ao deletar arquivo:', error)
      throw new Error(`Erro ao deletar arquivo: ${error.message}`)
    }
  }

  /**
   * Listar arquivos em uma pasta
   */
  static async listFiles(bucket: string, folder?: string): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder)

    if (error) {
      console.error('Erro ao listar arquivos:', error)
      throw new Error(`Erro ao listar arquivos: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obter informações de um arquivo
   */
  static async getFileInfo(bucket: string, path: string): Promise<any> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (error) {
      console.error('Erro ao obter informações do arquivo:', error)
      throw new Error(`Erro ao obter informações do arquivo: ${error.message}`)
    }

    return data?.[0] || null
  }
}
