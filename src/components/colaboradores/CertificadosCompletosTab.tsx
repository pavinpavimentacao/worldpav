import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Award, Mail, MessageCircle, X, Send, CheckSquare, Square } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import {
  ColaboradorDocumentoNR,
  ColaboradorCertificado,
  TipoDocumentoNR,
  TIPO_DOCUMENTO_NR_OPTIONS,
  ColaboradorDocumentoNRInsert,
} from '../../types/colaboradores';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { calcularStatusDocumento, getTextoStatus } from '../../utils/documento-status';
import { 
  getDocumentosNRByColaborador,
  getCertificadosByColaborador,
  createDocumentoNR,
  updateDocumentoNR
} from '../../lib/colaboradoresDetalhamentoApi';

interface CertificadosCompletosTabProps {
  colaboradorId: string;
  colaboradorNome?: string;
  colaboradorFuncao?: string;
}

export const CertificadosCompletosTab: React.FC<CertificadosCompletosTabProps> = ({
  colaboradorId,
  colaboradorNome = '',
  colaboradorFuncao = '',
}) => {
  const [documentosNR, setDocumentosNR] = useState<ColaboradorDocumentoNR[]>([]);
  const [certificados, setCertificados] = useState<ColaboradorCertificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState<Set<TipoDocumentoNR>>(new Set());

  // Estados para modal de envio
  type TipoEnvio = 'email' | 'whatsapp' | null;
  const [showEnvioModal, setShowEnvioModal] = useState(false);
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>(null);
  const [destinatario, setDestinatario] = useState('');
  const [certificadosSelecionados, setCertificadosSelecionados] = useState<Set<string>>(new Set());

  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);

      const [docs, certs] = await Promise.all([
        getDocumentosNRByColaborador(colaboradorId),
        getCertificadosByColaborador(colaboradorId)
      ]);

      setDocumentosNR(docs);
      setCertificados(certs);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleUploadNR = async (
    file: File,
    dataValidade: string,
    tipo: TipoDocumentoNR
  ) => {
    try {
      setUploadingDocs((prev) => new Set(prev).add(tipo));

      console.log('📤 Iniciando upload de NR:', { tipo, fileName: file.name });

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

      console.log('✅ Upload concluído, salvando no banco de dados...');

      // Verificar se já existe documento deste tipo
      const documentoExistente = documentosNR.find((d) => d.tipo_documento === tipo);

      if (documentoExistente) {
        // Atualizar documento existente
        await updateDocumentoNR(documentoExistente.id, {
          arquivo_url: uploadResult.url,
          data_validade: dataValidade || documentoExistente.data_validade
        });
        console.log('📝 Documento NR atualizado no banco');
        toast.success(`${tipo} atualizado com sucesso!`);
      } else {
        // Criar novo documento
        const novoDocumento: ColaboradorDocumentoNRInsert = {
          colaborador_id: colaboradorId,
          tipo_documento: tipo,
          data_validade: dataValidade || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano por padrão
          arquivo_url: uploadResult.url,
        };

        await createDocumentoNR(novoDocumento);
        console.log('📝 Novo documento NR criado no banco');
        toast.success(`${tipo} enviado com sucesso!`);
      }

      // Recarregar documentos para atualizar a interface
      console.log('🔄 Recarregando lista de documentos...');
      await carregarDados();
      
    } catch (error: unknown) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar documento';
      toast.error(errorMessage);
    } finally {
      setUploadingDocs((prev) => {
        const novo = new Set(prev);
        novo.delete(tipo);
        return novo;
      });
    }
  };

  const handleViewNR = (documento: ColaboradorDocumentoNR) => {
    if (documento.arquivo_url) {
      window.open(documento.arquivo_url, '_blank');
    }
  };

  const handleAbrirModalEnvio = (tipo: 'email' | 'whatsapp') => {
    setTipoEnvio(tipo);
    setShowEnvioModal(true);
    setCertificadosSelecionados(new Set());
    setDestinatario('');
  };

  const handleToggleCertificado = (id: string) => {
    const novoSet = new Set(certificadosSelecionados);
    if (novoSet.has(id)) {
      novoSet.delete(id);
    } else {
      novoSet.add(id);
    }
    setCertificadosSelecionados(novoSet);
  };

  const handleSelecionarTodos = () => {
    const todosDocumentos = [...documentosNR.map(d => d.id), ...certificados.map(c => c.id)];
    if (certificadosSelecionados.size === todosDocumentos.length) {
      setCertificadosSelecionados(new Set());
    } else {
      setCertificadosSelecionados(new Set(todosDocumentos));
    }
  };

  const handleDownloadPDFs = (documentosSelecionados: (ColaboradorDocumentoNR | ColaboradorCertificado)[]) => {
    // Fazer download de cada PDF selecionado
    documentosSelecionados.forEach((doc, index) => {
      const url = doc.arquivo_url;
      if (!url) return;

      // Criar um link temporário e clicar nele para iniciar o download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        link.download = ''; // Deixar o navegador determinar o nome do arquivo
        link.target = '_blank'; // Abrir em nova aba como fallback
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Delay de 500ms entre cada download para não sobrecarregar
    });

    toast.success(`Iniciando download de ${documentosSelecionados.length} arquivo(s)...`);
  };

  const handleEnviar = () => {
    if (!destinatario.trim()) {
      toast.error(tipoEnvio === 'email' ? 'Digite um email' : 'Digite um número de WhatsApp');
      return;
    }

    if (certificadosSelecionados.size === 0) {
      toast.error('Selecione pelo menos um certificado');
      return;
    }

    const documentosSelecionados = [
      ...documentosNR.filter(d => certificadosSelecionados.has(d.id)),
      ...certificados.filter(c => certificadosSelecionados.has(c.id))
    ];

    const nomesCertificados = documentosSelecionados.map(d => {
      if ('tipo_documento' in d) {
        return d.tipo_documento;
      } else {
        return d.nome_curso;
      }
    });

    // Iniciar download automático dos PDFs
    handleDownloadPDFs(documentosSelecionados);

    if (tipoEnvio === 'email') {
      const funcaoTexto = colaboradorFuncao ? ` - ${colaboradorFuncao}` : '';
      const subject = `Certificados e Documentos NR - ${colaboradorNome}${funcaoTexto}`;
      const body = `Olá,

Segue em anexo os seguintes certificados e documentos de ${colaboradorNome}${funcaoTexto}:

${nomesCertificados.map((nome, idx) => `${idx + 1}. ${nome}`).join('\n')}

---
Documentos enviados pelo sistema WorldPav

Observação: Os arquivos PDF foram baixados automaticamente. Anexe-os ao email antes de enviar.`;

      const mailtoLink = `mailto:${destinatario}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;

      toast.success(`Download iniciado! Os ${certificadosSelecionados.size} arquivo(s) foram baixados. Anexe-os ao email antes de enviar.`);
    } else if (tipoEnvio === 'whatsapp') {
      // Remover caracteres não numéricos do telefone
      const telefone = destinatario.replace(/\D/g, '');
      const funcaoTexto = colaboradorFuncao ? ` - ${colaboradorFuncao}` : '';
      
      const mensagem = `Olá! Segue os certificados e documentos de *${colaboradorNome}*${funcaoTexto}:

${nomesCertificados.map((nome, idx) => `${idx + 1}. ${nome}`).join('\n')}

_Os arquivos PDF foram baixados e podem ser enviados em seguida._`;

      const whatsappLink = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(whatsappLink, '_blank');

      toast.success(`Download iniciado! Os ${certificadosSelecionados.size} arquivo(s) foram baixados. Envie-os no WhatsApp após a mensagem.`);
    }

    setShowEnvioModal(false);
    setCertificadosSelecionados(new Set());
    setDestinatario('');
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando certificados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo em Cards Superior */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {documentosNR.length}
          </div>
          <div className="text-sm font-medium text-blue-800 mb-1">Documentos NR</div>
          <div className="text-xs text-blue-600">
            {documentosNR.length === 0 ? 'Nenhum cadastrado' : 
             `${documentosNR.filter(d => calcularStatusDocumento(d.data_validade) === 'valido').length} válidos`}
          </div>
        </div>
        
        <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-center mb-3">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-700 mb-2">
            {certificados.length}
          </div>
          <div className="text-sm font-medium text-green-800 mb-1">Certificados</div>
          <div className="text-xs text-green-600">
            {certificados.length === 0 ? 'Nenhum cadastrado' : 
             `${certificados.filter(d => calcularStatusDocumento(d.data_validade) === 'valido').length} válidos`}
          </div>
        </div>
        
        <div className="card p-6 text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-center mb-3">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-700 mb-2">
            {[...documentosNR, ...certificados].filter(d => {
              const status = calcularStatusDocumento(d.data_validade);
              return status === 'valido';
            }).length}
          </div>
          <div className="text-sm font-medium text-emerald-800 mb-1">Válidos</div>
          <div className="text-xs text-emerald-600">
            {[...documentosNR, ...certificados].filter(d => {
              const status = calcularStatusDocumento(d.data_validade);
              return status === 'valido';
            }).length === 0 ? 'Nenhum documento válido' : 'Em conformidade'}
          </div>
        </div>
        
        <div className="card p-6 text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-center mb-3">
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-700 mb-2">
            {[...documentosNR, ...certificados].filter(d => {
              const status = calcularStatusDocumento(d.data_validade);
              return status === 'vencido';
            }).length}
          </div>
          <div className="text-sm font-medium text-red-800 mb-1">Vencidos</div>
          <div className="text-xs text-red-600">
            {[...documentosNR, ...certificados].filter(d => {
              const status = calcularStatusDocumento(d.data_validade);
              return status === 'vencido';
            }).length === 0 ? 'Todos em dia' : 'Atenção necessária'}
          </div>
        </div>
      </div>

      {/* Botões de Envio */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => handleAbrirModalEnvio('email')}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Enviar por Email
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAbrirModalEnvio('whatsapp')}
          className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar por WhatsApp
        </Button>
      </div>

      {/* Seção de Documentos NR */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Documentos NR</h2>
          </div>
          <div className="text-sm text-gray-500">
            {documentosNR.length} de {TIPO_DOCUMENTO_NR_OPTIONS.length} documentos
          </div>
        </div>

        {/* Grid de Documentos NR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPO_DOCUMENTO_NR_OPTIONS.map((option) => {
            const documento = documentosNR.find(
              (d) => d.tipo_documento === option.value
            );

            return (
              <DocumentCard
                key={option.value}
                tipo={option.value}
                descricao={option.descricao}
                documento={documento}
                onUpload={(file, dataValidade) =>
                  handleUploadNR(file, dataValidade, option.value)
                }
                onView={documento ? () => handleViewNR(documento) : undefined}
                isUploading={uploadingDocs.has(option.value)}
                colaboradorNome={colaboradorNome}
              />
            );
          })}
        </div>
      </div>

      {/* Modal de Envio de Certificados */}
      {showEnvioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-3">
                <div className={`rounded-lg p-2 ${tipoEnvio === 'email' ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {tipoEnvio === 'email' ? (
                    <Mail className="h-6 w-6 text-white" />
                  ) : (
                    <MessageCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enviar por {tipoEnvio === 'email' ? 'Email' : 'WhatsApp'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Selecione os certificados e documentos para enviar
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEnvioModal(false);
                  setCertificadosSelecionados(new Set());
                  setDestinatario('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Campo de Destinatário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipoEnvio === 'email' ? 'Email do Destinatário' : 'Número do WhatsApp'} 
                  <span className="text-red-500"> *</span>
                </label>
                <Input
                  type={tipoEnvio === 'email' ? 'email' : 'tel'}
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder={
                    tipoEnvio === 'email' 
                      ? 'exemplo@empresa.com' 
                      : '(11) 98765-4321 ou 5511987654321'
                  }
                  autoFocus
                />
                {tipoEnvio === 'whatsapp' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Use o formato: (DDD) + número ou código do país + DDD + número
                  </p>
                )}
              </div>

              {/* Seleção de Certificados */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Selecionar Documentos e Certificados
                    <span className="text-red-500"> *</span>
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      ({[...documentosNR, ...certificados].length} disponíveis)
                    </span>
                  </label>
                  <button
                    onClick={handleSelecionarTodos}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {certificadosSelecionados.size === [...documentosNR, ...certificados].length
                      ? 'Desmarcar todos'
                      : 'Selecionar todos'}
                  </button>
                </div>

                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {/* Lista Unificada de Documentos e Certificados */}
                  {[...documentosNR, ...certificados].length > 0 ? (
                    <div className="p-3 space-y-2">
                      {/* Documentos NR */}
                      {documentosNR.map((doc) => {
                        const status = calcularStatusDocumento(doc.data_validade);
                        const isSelecionado = certificadosSelecionados.has(doc.id);
                        
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleToggleCertificado(doc.id)}
                            className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                              isSelecionado
                                ? 'bg-blue-50 border-2 border-blue-500'
                                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {isSelecionado ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900 text-sm">
                                {doc.tipo_documento}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Validade: {new Date(doc.data_validade).toLocaleDateString('pt-BR')}
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  status === 'valido' 
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'vence_em_30_dias'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {getTextoStatus(status)}
                                </span>
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      
                      {/* Certificados */}
                      {certificados.map((cert) => {
                        const status = calcularStatusDocumento(cert.data_validade);
                        const isSelecionado = certificadosSelecionados.has(cert.id);
                        
                        return (
                          <button
                            key={cert.id}
                            onClick={() => handleToggleCertificado(cert.id)}
                            className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                              isSelecionado
                                ? 'bg-blue-50 border-2 border-blue-500'
                                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {isSelecionado ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900 text-sm">
                                {cert.nome_curso}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {cert.instituicao}
                                {cert.data_validade && (
                                  <>
                                    {' • '}Validade: {new Date(cert.data_validade).toLocaleDateString('pt-BR')}
                                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      status === 'valido' 
                                        ? 'bg-green-100 text-green-800'
                                        : status === 'vence_em_30_dias'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {getTextoStatus(status)}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Nenhum certificado ou documento disponível</p>
                    </div>
                  )}
                </div>

                {/* Contador de Selecionados */}
                {certificadosSelecionados.size > 0 && (
                  <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <strong>{certificadosSelecionados.size}</strong> documento(s) selecionado(s)
                  </div>
                )}
              </div>

              {/* Informações sobre o envio */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Como funciona
                    </h4>
                    <p className="text-sm text-blue-800">
                      {tipoEnvio === 'email' ? (
                        <>
                          1. Os arquivos PDF serão <strong>baixados automaticamente</strong> para seu computador
                          <br />
                          2. Seu cliente de email abrirá com a mensagem pronta incluindo nome e função do colaborador
                          <br />
                          3. <strong>Anexe os arquivos baixados</strong> ao email antes de enviar
                        </>
                      ) : (
                        <>
                          1. Os arquivos PDF serão <strong>baixados automaticamente</strong> para seu computador
                          <br />
                          2. O WhatsApp Web abrirá com a mensagem pronta incluindo nome e função do colaborador
                          <br />
                          3. <strong>Envie os arquivos baixados</strong> no WhatsApp após a mensagem
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnvioModal(false);
                  setCertificadosSelecionados(new Set());
                  setDestinatario('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnviar}
                disabled={!destinatario.trim() || certificadosSelecionados.size === 0}
                className={tipoEnvio === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Send className="h-4 w-4 mr-2" />
                {tipoEnvio === 'email' ? 'Abrir Email' : 'Abrir WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
