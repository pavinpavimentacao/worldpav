import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ColaboradorArquivo, ColaboradorArquivoInsert } from '../../types/colaboradores';
import { supabase } from '../../lib/supabase';
import { uploadDocumento, deleteDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { formatarTamanhoArquivo, getIconeArquivo } from '../../utils/documento-status';

interface ArquivosTabProps {
  colaboradorId: string;
}

export const ArquivosTab: React.FC<ArquivosTabProps> = ({ colaboradorId }) => {
  const [arquivos, setArquivos] = useState<ColaboradorArquivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarArquivos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('colaboradores_arquivos')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArquivos(data || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarArquivos();
  }, [carregarArquivos]);

  const handleUpload = async (files: File[]) => {
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const uploadResult = await uploadDocumento(
            file,
            colaboradorId,
            'arquivos-gerais'
          );

          if (!uploadResult) return null;

          const novoArquivo: ColaboradorArquivoInsert = {
            colaborador_id: colaboradorId,
            nome_arquivo: file.name,
            tipo_arquivo: file.type,
            tamanho: file.size,
            arquivo_url: uploadResult.url,
          };

          const { data, error } = await supabase
            .from('colaboradores_arquivos')
            .insert(novoArquivo)
            .select()
            .single();

          if (error) throw error;

          return data;
        })
      );

      const sucesso = uploads.filter((u) => u !== null).length;
      if (sucesso > 0) {
        toast.success(`${sucesso} arquivo(s) enviado(s) com sucesso!`);
        await carregarArquivos();
      }
    } catch (error: unknown) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar arquivos';
      toast.error(errorMessage);
    }
  };

  const handleExcluir = async (arquivo: ColaboradorArquivo) => {
    if (!confirm(`Deseja realmente excluir "${arquivo.nome_arquivo}"?`)) return;

    try {
      // Deletar do storage
      const deleted = await deleteDocumento(arquivo.arquivo_url);
      
      if (!deleted) {
        console.warn('Arquivo não foi deletado do storage');
      }

      // Deletar do banco
      const { error } = await supabase
        .from('colaboradores_arquivos')
        .delete()
        .eq('id', arquivo.id);

      if (error) throw error;

      toast.success('Arquivo excluído com sucesso!');
      await carregarArquivos();
    } catch (error: unknown) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error('Erro ao excluir arquivo');
    }
  };

  const handleDownload = (arquivo: ColaboradorArquivo) => {
    window.open(arquivo.arquivo_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Carregando arquivos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <FileText className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Arquivos Gerais</h3>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <FileUpload
          onUpload={handleUpload}
          multiple
          maxFiles={10}
          label="Enviar Arquivos"
          helpText="Arraste arquivos ou clique para selecionar (PDF, PNG, JPG, ZIP até 10MB cada)"
        />
      </div>

      {/* Lista de Arquivos */}
      {arquivos.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">Nenhum arquivo enviado</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-200">
            {arquivos.map((arquivo) => (
              <div
                key={arquivo.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Ícone do Arquivo */}
                  <div className="flex-shrink-0 text-3xl">
                    {getIconeArquivo(arquivo.nome_arquivo)}
                  </div>

                  {/* Info do Arquivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {arquivo.nome_arquivo}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span>{formatarTamanhoArquivo(arquivo.tamanho)}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(arquivo.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(arquivo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Baixar"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleExcluir(arquivo)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {arquivos.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Total: {arquivos.length} arquivo(s) •{' '}
          {formatarTamanhoArquivo(
            arquivos.reduce((sum, a) => sum + a.tamanho, 0)
          )}
        </div>
      )}
    </div>
  );
};




