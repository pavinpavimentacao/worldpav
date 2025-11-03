import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "../shared/Button";
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import {
  validarTipoArquivo,
  validarTamanhoArquivo,
  formatarTamanhoArquivo,
  getIconeArquivo,
} from '../../utils/documento-status';

interface ArquivoSelecionado {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  erro?: string;
}

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  label?: string;
  helpText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  multiple = true,
  maxFiles = 10,
  accept = '.pdf,.png,.jpg,.jpeg,.zip',
  disabled = false,
  label = 'Upload de Arquivos',
  helpText = 'PDF, PNG, JPG ou ZIP até 10MB',
}) => {
  const [arquivos, setArquivos] = useState<ArquivoSelecionado[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDropFiles = useCallback((files: FileList | File[]) => {
    const droppedFiles = Array.from(files);
    processarArquivos(droppedFiles);
  }, []);

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleDropFiles,
    disabled,
    multiple
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processarArquivos(selectedFiles);
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const processarArquivos = (files: File[]) => {
    const arquivosValidados: ArquivoSelecionado[] = [];

    // Verificar limite de arquivos
    const totalArquivos = arquivos.length + files.length;
    if (totalArquivos > maxFiles) {
      alert(`Você pode enviar no máximo ${maxFiles} arquivo(s) por vez.`);
      return;
    }

    files.forEach((file) => {
      // Validar tipo
      if (!validarTipoArquivo(file)) {
        arquivosValidados.push({
          file,
          status: 'error',
          progress: 0,
          erro: 'Tipo de arquivo não permitido',
        });
        return;
      }

      // Validar tamanho
      if (!validarTamanhoArquivo(file)) {
        arquivosValidados.push({
          file,
          status: 'error',
          progress: 0,
          erro: 'Arquivo muito grande (máx 10MB)',
        });
        return;
      }

      // Preview para imagens
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      arquivosValidados.push({
        file,
        preview,
        status: 'pending',
        progress: 0,
      });
    });

    setArquivos((prev) => [...prev, ...arquivosValidados]);
  };

  const removerArquivo = (index: number) => {
    setArquivos((prev) => {
      const novo = [...prev];
      // Liberar URL do preview se existir
      if (novo[index].preview) {
        URL.revokeObjectURL(novo[index].preview!);
      }
      novo.splice(index, 1);
      return novo;
    });
  };

  const handleUpload = async () => {
    const arquivosParaEnviar = arquivos.filter(
      (a) => a.status === 'pending' || a.status === 'error'
    );

    if (arquivosParaEnviar.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      // Simular progresso
      arquivosParaEnviar.forEach((_, index) => {
        setArquivos((prev) => {
          const novo = [...prev];
          const arquivoIndex = prev.findIndex((a) => a.file === arquivosParaEnviar[index].file);
          if (arquivoIndex !== -1) {
            novo[arquivoIndex].status = 'uploading';
            novo[arquivoIndex].progress = 0;
          }
          return novo;
        });
      });

      // Executar upload
      await onUpload(arquivosParaEnviar.map((a) => a.file));

      // Marcar como sucesso
      setArquivos((prev) =>
        prev.map((a) =>
          arquivosParaEnviar.some((ap) => ap.file === a.file)
            ? { ...a, status: 'success', progress: 100 }
            : a
        )
      );

      // Limpar após 2 segundos
      setTimeout(() => {
        setArquivos((prev) => prev.filter((a) => a.status !== 'success'));
      }, 2000);
    } catch (error: unknown) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar arquivo';
      
      // Marcar como erro
      setArquivos((prev) =>
        prev.map((a) =>
          arquivosParaEnviar.some((ap) => ap.file === a.file)
            ? { ...a, status: 'error', erro: errorMessage }
            : a
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const temArquivosPendentes = arquivos.some(
    (a) => a.status === 'pending' || a.status === 'error'
  );

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 bg-white cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) inputRef.current?.click()
        }}
        {...dragHandlers}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-3 pointer-events-none">
          <div
            className={`p-3 rounded-full ${
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Upload
              className={`h-8 w-8 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
          </div>

          <div>
            <p className="text-base font-medium text-gray-700">{label}</p>
            <p className="text-sm text-gray-500 mt-1">
              Arraste e solte ou clique para selecionar
            </p>
            <p className="text-xs text-gray-400 mt-1">{helpText}</p>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {arquivos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Arquivos selecionados ({arquivos.length})
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {arquivos.map((arquivo, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* Preview ou Ícone */}
                {arquivo.preview ? (
                  <img
                    src={arquivo.preview}
                    alt={arquivo.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded border border-gray-200">
                    <span className="text-2xl">
                      {getIconeArquivo(arquivo.file.name)}
                    </span>
                  </div>
                )}

                {/* Info do Arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {arquivo.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatarTamanhoArquivo(arquivo.file.size)}
                  </p>

                  {/* Barra de Progresso */}
                  {arquivo.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${arquivo.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Erro */}
                  {arquivo.erro && (
                    <p className="text-xs text-red-600 mt-1">{arquivo.erro}</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {arquivo.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {arquivo.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {arquivo.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  )}
                  {arquivo.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removerArquivo(index);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Remover"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Upload */}
          {temArquivosPendentes && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || disabled}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Arquivos
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};




