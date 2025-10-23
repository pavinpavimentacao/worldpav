import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { DocumentViewerModal } from './DocumentViewerModal';
import {
  ColaboradorDocumentoNR,
  ColaboradorDocumentoNRInsert,
  TIPO_DOCUMENTO_NR_OPTIONS,
  TipoDocumentoNR,
} from '../../types/colaboradores';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { calcularStatusDocumento } from '../../utils/documento-status';
import {
  getDocumentosNRByColaborador,
  createDocumentoNR,
  updateDocumentoNR,
} from '../../lib/colaboradoresDetalhamentoApi';

interface DocumentacaoTabProps {
  colaboradorId: string;
}

export const DocumentacaoTab: React.FC<DocumentacaoTabProps> = ({
  colaboradorId,
}) => {
  const [documentos, setDocumentos] = useState<ColaboradorDocumentoNR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState<Set<TipoDocumentoNR>>(
    new Set()
  );
  const [selectedDocument, setSelectedDocument] = useState<ColaboradorDocumentoNR | null>(null);
  const [showViewerModal, setShowViewerModal] = useState(false);

  const carregarDocumentos = useCallback(async () => {
    try {
      setIsLoading(true);

      const docs = await getDocumentosNRByColaborador(colaboradorId);
      setDocumentos(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleUpload = async (
    tipo: TipoDocumentoNR,
    file: File,
    dataValidade: string
  ) => {
    try {
      // Marcar como uploading
      setUploadingDocs((prev) => new Set(prev).add(tipo));

      // Upload real do arquivo
      const uploadResult = await uploadDocumento(
        file,
        colaboradorId,
        'documentos-nr',
        tipo.replace(/[\s-]/g, '_')
      );

      if (!uploadResult) {
        throw new Error('Falha no upload do arquivo');
      }

      // Verificar se já existe documento deste tipo
      const documentoExistente = documentos.find((d) => d.tipo_documento === tipo);

      if (documentoExistente) {
        // Atualizar
        await updateDocumentoNR(documentoExistente.id, {
          arquivo_url: uploadResult.url,
          data_validade: dataValidade
        });
        toast.success(`${tipo} atualizado com sucesso!`);
      } else {
        // Inserir novo
        const novoDocumento: ColaboradorDocumentoNRInsert = {
          colaborador_id: colaboradorId,
          tipo_documento: tipo,
          data_validade: dataValidade,
          arquivo_url: uploadResult.url,
        };

        await createDocumentoNR(novoDocumento);
        toast.success(`${tipo} enviado com sucesso!`);
      }

      // Recarregar documentos
      await carregarDocumentos();
    } catch (error: unknown) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar documento';
      toast.error(errorMessage);
    } finally {
      // Remover do set de uploading
      setUploadingDocs((prev) => {
        const novo = new Set(prev);
        novo.delete(tipo);
        return novo;
      });
    }
  };

  const handleView = (documento: ColaboradorDocumentoNR) => {
    if (documento.arquivo_url) {
      setSelectedDocument(documento);
      setShowViewerModal(true);
    }
  };

  // Calcular estatísticas
  const totalDocumentos = TIPO_DOCUMENTO_NR_OPTIONS.length;
  const documentosEnviados = documentos.length;
  const documentosValidos = documentos.filter(
    (d) => calcularStatusDocumento(d.data_validade) === 'valido'
  ).length;
  const documentosVencendo = documentos.filter(
    (d) => calcularStatusDocumento(d.data_validade) === 'vence_em_30_dias'
  ).length;
  const documentosVencidos = documentos.filter(
    (d) => calcularStatusDocumento(d.data_validade) === 'vencido'
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Carregando documentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Documentação NR e Regulatória
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {documentosEnviados}/{totalDocumentos}
            </p>
            <p className="text-xs text-gray-600 mt-1">Documentos</p>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {documentosValidos}
            </p>
            <p className="text-xs text-green-700 mt-1">Válidos</p>
          </div>

          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {documentosVencendo}
            </p>
            <p className="text-xs text-yellow-700 mt-1">Vencendo</p>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">
              {documentosVencidos}
            </p>
            <p className="text-xs text-red-700 mt-1">Vencidos</p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {totalDocumentos - documentosEnviados}
            </p>
            <p className="text-xs text-gray-600 mt-1">Pendentes</p>
          </div>
        </div>

        {/* Alertas */}
        {documentosVencidos > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Atenção!</p>
                <p>
                  {documentosVencidos} documento(s) vencido(s). Atualize o quanto
                  antes para manter a conformidade.
                </p>
              </div>
            </div>
          </div>
        )}

        {documentosVencendo > 0 && documentosVencidos === 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Aviso</p>
                <p>
                  {documentosVencendo} documento(s) vencendo em breve. Programe a
                  renovação.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIPO_DOCUMENTO_NR_OPTIONS.map((option) => {
          const documento = documentos.find(
            (d) => d.tipo_documento === option.value
          );

          return (
            <DocumentCard
              key={option.value}
              tipo={option.value}
              descricao={option.descricao}
              documento={documento}
              onUpload={(file, dataValidade) =>
                handleUpload(option.value, file, dataValidade)
              }
              onView={documento ? () => handleView(documento) : undefined}
              isUploading={uploadingDocs.has(option.value)}
            />
          );
        })}
      </div>

      {/* Informação */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre a Documentação NR</p>
            <p>
              As Normas Regulamentadoras (NR) são obrigatórias para empresas do
              setor de construção civil. Mantenha todos os documentos
              atualizados para garantir a segurança e conformidade legal.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Visualização */}
      {selectedDocument && (
        <DocumentViewerModal
          isOpen={showViewerModal}
          onClose={() => {
            setShowViewerModal(false);
            setSelectedDocument(null);
          }}
          doc={selectedDocument}
          type="nr"
          colaboradorNome="Colaborador"
        />
      )}
    </div>
  );
};

