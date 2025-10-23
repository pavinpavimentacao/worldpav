/**
 * Serviço para gerenciamento de arquivos de colaboradores no Supabase Storage
 */

import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'colaboradores-documents';

/**
 * Tipo de documento para organizar o path
 */
export type TipoDocumentoStorage = 
  | 'documentos-nr'
  | 'certificados'
  | 'multas'
  | 'arquivos-gerais'
  | 'documentos-pessoais';

/**
 * Sanitiza nome de arquivo removendo caracteres especiais e acentos
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, ''); // Remove underscores no início e fim
}

/**
 * Upload de arquivo para o storage
 */
export async function uploadDocumento(
  file: File,
  colaboradorId: string,
  tipo: TipoDocumentoStorage,
  nomeCustomizado?: string
): Promise<{ url: string; path: string } | null> {
  try {
    // Verificar se o bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('📦 Bucket não existe, criando...');
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Bucket privado
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
      });
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        // Continuar mesmo com erro, pode ser que já exista
      }
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // Sanitizar o nome base do arquivo
    const rawBaseName = nomeCustomizado || file.name.replace(/\.[^/.]+$/, ""); // Remove extensão
    const baseName = sanitizeFileName(rawBaseName);
    
    const fileName = `${baseName}_${timestamp}_${randomId}`;
    const filePath = `${colaboradorId}/${tipo}/${fileName}.${fileExt}`;

    console.log('📤 Iniciando upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
      colaboradorId,
      tipo,
      bucketExists
    });

    // Upload do arquivo
    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Permite sobrescrever arquivos existentes
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      throw uploadError;
    }

    // Tentar gerar URL assinada primeiro
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hora de validade

    if (signedUrlData && !signedUrlError) {
      console.log('✅ Upload concluído com URL assinada:', {
        filePath,
        signedUrl: signedUrlData.signedUrl
      });

      return {
        url: signedUrlData.signedUrl,
        path: filePath,
      };
    }

    // Fallback: usar URL pública se URL assinada falhar
    console.log('⚠️ URL assinada falhou, usando URL pública como fallback');
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('✅ Upload concluído com URL pública:', {
      filePath,
      publicUrl: urlData.publicUrl
    });

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Erro no uploadDocumento:', error);
    return null;
  }
}

/**
 * Upload de múltiplos arquivos
 */
export async function uploadMultiplosDocumentos(
  files: File[],
  colaboradorId: string,
  tipo: TipoDocumentoStorage
): Promise<Array<{ url: string; path: string; nome: string }>> {
  const uploads = files.map(async (file) => {
    const result = await uploadDocumento(file, colaboradorId, tipo);
    if (result) {
      return {
        ...result,
        nome: file.name,
      };
    }
    return null;
  });

  const results = await Promise.all(uploads);
  return results.filter((r) => r !== null) as Array<{ url: string; path: string; nome: string }>;
}

/**
 * Deletar arquivo do storage
 */
export async function deleteDocumento(fileUrl: string): Promise<boolean> {
  try {
    // Extrair o path da URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    
    if (pathParts.length < 2) {
      console.error('URL inválida:', fileUrl);
      return false;
    }

    const filePath = pathParts[1];

    // Deletar arquivo
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro no deleteDocumento:', error);
    return false;
  }
}

/**
 * Obter URL assinada temporária (para arquivos privados)
 */
export async function getDocumentoUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erro no getDocumentoUrl:', error);
    return null;
  }
}

/**
 * Listar todos os documentos de um colaborador
 */
export async function getDocumentosByColaborador(
  colaboradorId: string
): Promise<Array<{ name: string; path: string; size: number }>> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(colaboradorId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Erro ao listar documentos:', error);
      return [];
    }

    // Mapear para incluir o path completo
    return (data || []).map((file) => ({
      name: file.name,
      path: `${colaboradorId}/${file.name}`,
      size: file.metadata?.size || 0,
    }));
  } catch (error) {
    console.error('Erro no getDocumentosByColaborador:', error);
    return [];
  }
}

/**
 * Listar documentos de um tipo específico
 */
export async function getDocumentosPorTipo(
  colaboradorId: string,
  tipo: TipoDocumentoStorage
): Promise<Array<{ name: string; path: string; size: number }>> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${colaboradorId}/${tipo}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Erro ao listar documentos por tipo:', error);
      return [];
    }

    return (data || []).map((file) => ({
      name: file.name,
      path: `${colaboradorId}/${tipo}/${file.name}`,
      size: file.metadata?.size || 0,
    }));
  } catch (error) {
    console.error('Erro no getDocumentosPorTipo:', error);
    return [];
  }
}

/**
 * Verificar se o bucket existe e criar se necessário
 */
export async function verificarOuCriarBucket(): Promise<boolean> {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }

    const bucketExiste = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExiste) {
      // Criar bucket
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'application/zip',
          'application/x-zip-compressed',
        ],
      });

      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        return false;
      }

      console.log(`Bucket "${BUCKET_NAME}" criado com sucesso!`);
    }

    return true;
  } catch (error) {
    console.error('Erro no verificarOuCriarBucket:', error);
    return false;
  }
}

/**
 * Download de arquivo
 */
export async function downloadDocumento(path: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      console.error('Erro ao baixar arquivo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro no downloadDocumento:', error);
    return null;
  }
}

/**
 * Move arquivo para uma nova localização
 */
export async function moverDocumento(
  fromPath: string,
  toPath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .move(fromPath, toPath);

    if (error) {
      console.error('Erro ao mover arquivo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro no moverDocumento:', error);
    return false;
  }
}

/**
 * Obter tamanho total dos arquivos de um colaborador
 */
export async function getTamanhoTotalDocumentos(
  colaboradorId: string
): Promise<number> {
  try {
    const documentos = await getDocumentosByColaborador(colaboradorId);
    return documentos.reduce((total, doc) => total + doc.size, 0);
  } catch (error) {
    console.error('Erro ao calcular tamanho total:', error);
    return 0;
  }
}


