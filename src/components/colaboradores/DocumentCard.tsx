import React, { useState } from 'react';
import { Upload, Eye, Calendar, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { DocumentViewerModal } from './DocumentViewerModal';
import {
  ColaboradorDocumentoNR,
  TipoDocumentoNR,
} from '../../types/colaboradores';
import {
  calcularStatusDocumento,
  getCorStatus,
  getIconeStatus,
  getTextoStatus,
  getMensagemStatus,
} from '../../utils/documento-status';

interface DocumentCardProps {
  tipo: TipoDocumentoNR;
  descricao: string;
  documento?: ColaboradorDocumentoNR | null;
  onUpload: (file: File, dataValidade: string) => Promise<void>;
  onView?: () => void;
  isUploading?: boolean;
  colaboradorNome?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  tipo,
  descricao,
  documento,
  onUpload,
  isUploading = false,
  colaboradorNome = '',
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataValidade, setDataValidade] = useState('');
  const [uploading, setUploading] = useState(false);

  const status = documento ? calcularStatusDocumento(documento.data_validade) : null;
  const cores = status ? getCorStatus(status) : null;

  // Calcular progresso da validade
  const getProgressInfo = () => {
    if (!documento?.data_validade) return null;
    
    const hoje = new Date();
    const validade = new Date(documento.data_validade);
    const emissao = documento.data_emissao ? new Date(documento.data_emissao) : new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    
    const totalDias = Math.ceil((validade.getTime() - emissao.getTime()) / (1000 * 60 * 60 * 24));
    const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const diasDecorridos = totalDias - diasRestantes;
    
    const progresso = Math.max(0, Math.min(100, (diasDecorridos / totalDias) * 100));
    
    let corProgresso = 'bg-green-500';
    if (diasRestantes <= 30) corProgresso = 'bg-orange-500';
    if (diasRestantes <= 7) corProgresso = 'bg-red-500';
    if (diasRestantes < 0) corProgresso = 'bg-red-600';
    
    return {
      progresso,
      corProgresso,
      diasRestantes,
      totalDias
    };
  };

  const progressInfo = getProgressInfo();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !dataValidade) {
      alert('Selecione um arquivo e defina a data de validade');
      return;
    }

    setUploading(true);
    try {
      await onUpload(selectedFile, dataValidade);
      setShowUploadModal(false);
      setSelectedFile(null);
      setDataValidade('');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const temDocumento = !!documento?.arquivo_url;

  return (
    <>
      <div
        className={`relative p-4 rounded-lg border-2 transition-all ${
          cores
            ? `${cores.bg} ${cores.border}`
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Header com Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">{tipo}</h3>
            </div>
            <p className="text-xs text-gray-600">{descricao}</p>
          </div>

          {/* Status Icon */}
          {status && (
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${cores?.bg}`}
              title={getTextoStatus(status)}
            >
              <span className={`text-xl ${cores?.icon}`}>
                {getIconeStatus(status)}
              </span>
            </div>
          )}
        </div>

        {/* Informações do Documento */}
        {documento && (
          <div className="space-y-2 mb-3">
            {/* Data de Validade */}
            {documento.data_validade && (
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>
                  Válido até:{' '}
                  {format(new Date(documento.data_validade), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}

            {/* Barra de Progresso */}
            {progressInfo && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Progresso da validade</span>
                  <span className={`font-medium ${
                    progressInfo.diasRestantes < 0 ? 'text-red-600' :
                    progressInfo.diasRestantes <= 7 ? 'text-red-500' :
                    progressInfo.diasRestantes <= 30 ? 'text-orange-500' :
                    'text-green-600'
                  }`}>
                    {progressInfo.diasRestantes < 0 
                      ? `Vencido há ${Math.abs(progressInfo.diasRestantes)} dias`
                      : `${progressInfo.diasRestantes} dias restantes`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${progressInfo.corProgresso}`}
                    style={{ width: `${progressInfo.progresso}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Mensagem de Status */}
            {status && (
              <div className={`flex items-center text-xs ${cores?.text}`}>
                <AlertCircle className="h-3 w-3 mr-1.5" />
                <span className="font-medium">
                  {getMensagemStatus(documento.data_validade, status)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!documento && (
          <div className="mb-3 py-4 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Nenhum documento enviado</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="h-3 w-3 mr-1.5" />
            {temDocumento ? 'Reenviar' : 'Enviar'}
          </Button>

          {temDocumento && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowViewerModal(true)} 
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              Visualizar
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Enviar {tipo}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{descricao}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Upload de Arquivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-2">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Data de Validade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Data em que o documento vence
                </p>
              </div>

              {/* Alerta */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>
                      Você será notificado 30 dias antes do vencimento deste
                      documento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDataValidade('');
                }}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={!selectedFile || !dataValidade || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewerModal && documento && (
        <DocumentViewerModal
          isOpen={showViewerModal}
          onClose={() => setShowViewerModal(false)}
          doc={documento}
          type="nr"
          colaboradorNome={colaboradorNome}
        />
      )}
    </>
  );
};

