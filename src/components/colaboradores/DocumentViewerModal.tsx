import React, { useState, useEffect } from 'react';
import { X, Calendar, Building, FileText, Download } from 'lucide-react';
import { Button } from "../shared/Button";
import { calcularStatusDocumento } from '../../utils/documento-status';
import { ColaboradorDocumentoNR, ColaboradorCertificado } from '../../types/colaboradores';
import { getDocumentoUrl } from '../../services/colaborador-storage';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc?: ColaboradorDocumentoNR | ColaboradorCertificado | null;
  type: 'nr' | 'certificado';
  colaboradorNome: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  doc,
  type,
  colaboradorNome,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  if (!isOpen || !doc) return null;

  const status = calcularStatusDocumento(doc.data_validade);
  const isCertificado = type === 'certificado';
  const docData = doc as ColaboradorCertificado;

  // Usar a URL do doco diretamente (já é assinada)
  useEffect(() => {
    if (doc?.arquivo_url && isOpen) {
      setSignedUrl(doc.arquivo_url);
      setIsLoadingUrl(false);
    }
  }, [doc?.arquivo_url, isOpen]);

  const handleDownload = () => {
    const urlToUse = signedUrl || doc.arquivo_url;
    if (urlToUse) {
      const link = window.doc.createElement('a');
      link.href = urlToUse;
      link.download = `${type === 'nr' ? (doc as ColaboradorDocumentoNR).tipo_doco : docData.nome_curso}.pdf`;
      link.target = '_blank';
      link.click();
    }
  };

  const getStatusInfo = () => {
    if (!doc.data_validade) return { text: 'Sem validade', color: 'text-gray-500' };
    
    const diasRestantes = Math.ceil((new Date(doc.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { 
        text: `Vencido há ${Math.abs(diasRestantes)} dias`, 
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else if (diasRestantes <= 30) {
      return { 
        text: `Vence em ${diasRestantes} dias`, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    } else if (diasRestantes <= 90) {
      return { 
        text: `Vence em ${diasRestantes} dias`, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else {
      return { 
        text: `Válido por ${diasRestantes} dias`, 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {status.icon}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isCertificado ? docData.nome_curso : (doc as ColaboradorDocumentoNR).tipo_doco}
              </h2>
              <p className="text-sm text-gray-600">
                {colaboradorNome}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Documento */}
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Status da Validade</span>
                </div>
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
                {doc.data_validade && (
                  <p className="text-xs text-gray-600 mt-1">
                    Data de validade: {new Date(doc.data_validade).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {isCertificado && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Instituição</span>
                  </div>
                  <p className="text-sm text-gray-700">{docData.instituicao}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Data de Emissão</span>
                </div>
                <p className="text-sm text-gray-700">
                  {isCertificado 
                    ? new Date(docData.data_emissao).toLocaleDateString('pt-BR')
                    : 'Não especificada'
                  }
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Informações do Arquivo</span>
                </div>
                {doc.arquivo_url ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Arquivo disponível para visualização
                    </p>
                    <Button
                      onClick={handleDownload}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar Arquivo</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    Arquivo não enviado
                  </p>
                )}
              </div>
            </div>

            {/* Visualizador do Arquivo */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Visualização</span>
                </div>
                
                {doc.arquivo_url ? (
                  <div className="border rounded-lg overflow-hidden">
                    {isLoadingUrl ? (
                      <div className="flex items-center justify-center h-96 bg-gray-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Carregando doco...</p>
                        </div>
                      </div>
                    ) : signedUrl ? (
                      <iframe
                        src={signedUrl}
                        className="w-full h-96"
                        title="Document Preview"
                        onError={(e) => {
                          console.error('Erro ao carregar iframe:', e);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-96 bg-gray-100">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Erro ao carregar doco</p>
                          <p className="text-sm text-gray-500">Tente baixar o arquivo</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Arquivo não disponível</p>
                      <p className="text-sm text-gray-500">Faça upload do doco para visualizar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            {status.icon}
            <span className="text-sm text-gray-600">
              Status: {status.text}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {doc.arquivo_url && (
              <Button onClick={handleDownload} disabled={isLoadingUrl}>
                <Download className="h-4 w-4 mr-2" />
                {isLoadingUrl ? 'Carregando...' : 'Baixar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


