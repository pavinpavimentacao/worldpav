import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import { FileUpload } from './FileUpload';
import { 
  CreditCard, 
  FileText, 
  Upload, 
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  X,
  Download,
  Calendar,
  Info
} from 'lucide-react';
import { Button } from "../shared/Button";
import { ColaboradorExpandido, CategoriaCNH, CATEGORIA_CNH_OPTIONS } from '../../types/colaboradores';
import { DocumentoPessoal, CNHData } from '../../types/documentos';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { USE_MOCK, logMockOperation } from '../../config/mock-config';
import { 
  getDocumentosByColaborador, 
  getCNHByColaborador, 
  saveCNH, 
  createDocumento, 
  deleteDocumento,
  getVencimentoPadrao
} from '../../lib/documentosApi';

interface DocumentacaoPessoalTabProps {
  colaborador: ColaboradorExpandido;
  onUpdate: (data: Partial<ColaboradorExpandido>) => void;
  isLoading?: boolean;
}

// Interface DocumentoPessoal agora importada de types/documentos

const TIPOS_DOCUMENTO = [
  { value: 'RG', label: 'RG - Registro Geral' },
  { value: 'CNH', label: 'CNH - Carteira de Habilitação' },
  { value: 'CPF', label: 'CPF - Cadastro de Pessoa Física' },
  { value: 'Comprovante_Residencia', label: 'Comprovante de Residência' },
  { value: 'Certidao_Nascimento', label: 'Certidão de Nascimento' },
  { value: 'Outros', label: 'Outros Documentos' },
];

export const DocumentacaoPessoalTab: React.FC<DocumentacaoPessoalTabProps> = ({
  colaborador,
  onUpdate,
  isLoading = false,
}) => {
  const [cnhData, setCnhData] = useState<CNHData>({
    numero: '',
    categoria: 'B',
    validade: '',
    arquivo_url: ''
  });

  const [documentos, setDocumentos] = useState<DocumentoPessoal[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados do modal de adicionar documento
  const [showAddModal, setShowAddModal] = useState(false);
  const [nomeDocumento, setNomeDocumento] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  
  // Estados do modal de visualização de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoPessoal | null>(null);

  // Carregar dados de CNH e documentos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Verificar se o bucket existe
        const { verificarOuCriarBucket } = await import('../../services/colaborador-storage');
        await verificarOuCriarBucket();
        
        // Carregar CNH
        const cnh = await getCNHByColaborador(colaborador.id);
        if (cnh) {
          setCnhData({
            numero: cnh.observations?.split('Categoria: ')[1]?.split(' ')[0] || '',
            categoria: cnh.observations?.split('Categoria: ')[1]?.split(' ')[0] as CategoriaCNH || 'B',
            validade: cnh.expiry_date || '',
            arquivo_url: cnh.file_url
          });
        }

        // Carregar todos os documentos
        const docs = await getDocumentosByColaborador(colaborador.id);
        
        // Migrar documentos existentes que não têm data de vencimento
        const docsComVencimento = docs.map(doc => {
          if (!doc.expiry_date) {
            return {
              ...doc,
              expiry_date: getVencimentoPadrao(doc.document_type)
            };
          }
          return doc;
        });
        
        setDocumentos(docsComVencimento);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar documentos');
      }
    };

    carregarDados();
  }, [colaborador.id]);

  // Função para salvar CNH
  const handleSaveCNH = async () => {
    try {
      setIsUploading(true);
      
      let arquivoUrl = cnhData.arquivo_url;
      
      // Se há um arquivo selecionado, fazer upload para o Supabase Storage
      if (cnhData.arquivo_url && cnhData.arquivo_url.startsWith('blob:')) {
        console.log('📤 Iniciando upload da CNH para o Supabase Storage...');
        
        // Converter blob URL para File
        const response = await fetch(cnhData.arquivo_url);
        const blob = await response.blob();
        const file = new File([blob], `CNH_${cnhData.numero}.pdf`, { type: blob.type });
        
        console.log('📁 Arquivo preparado:', {
          nome: file.name,
          tamanho: file.size,
          tipo: file.type
        });
        
        // Fazer upload para o Supabase Storage
        const uploadResult = await uploadDocumento(
          file,
          colaborador.id,
          'documentos-pessoais',
          `CNH_${cnhData.numero}`
        );
        
        if (uploadResult) {
          arquivoUrl = uploadResult.url;
          console.log('✅ Arquivo CNH enviado para o storage:', uploadResult.url);
        } else {
          throw new Error('Falha no upload do arquivo para o Supabase Storage');
        }
      } else if (!cnhData.arquivo_url) {
        throw new Error('Selecione um arquivo para upload');
      }
      
      // Salvar metadados no banco de dados
      await saveCNH(colaborador.id, {
        ...cnhData,
        arquivo_url: arquivoUrl
      });
      
      toast.success('CNH salva com sucesso!');
      
      // Recarregar dados
      const cnh = await getCNHByColaborador(colaborador.id);
      if (cnh) {
        setCnhData({
          numero: cnh.observations?.split('Categoria: ')[1]?.split(' ')[0] || '',
          categoria: cnh.observations?.split('Categoria: ')[1]?.split(' ')[0] as CategoriaCNH || 'B',
          validade: cnh.expiry_date || '',
          arquivo_url: cnh.file_url
        });
      }
    } catch (error) {
      console.error('Erro ao salvar CNH:', error);
      toast.error('Erro ao salvar CNH');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCNHChange = (field: keyof CNHData, value: string) => {
    setCnhData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadDocumento = async (files: File[], tipo: string) => {
    try {
      setIsUploading(true);

      // Upload real para Supabase Storage
      const uploadPromises = files.map(async (file) => {
        const url = await uploadDocumento(file, colaborador.id, 'documentos-pessoais', tipo);
        
        if (url) {
          // Salvar no banco de dados com data de vencimento padrão
          return await createDocumento({
            colaborador_id: colaborador.id,
            document_type: tipo as any,
            file_name: file.name,
            file_url: url.url,
            file_size: file.size,
            expiry_date: getVencimentoPadrao(tipo)
          });
        }
        return null;
      });

      const novosDocs = (await Promise.all(uploadPromises)).filter(doc => doc !== null) as DocumentoPessoal[];
      setDocumentos((prev) => [...prev, ...novosDocs]);
      toast.success(`${novosDocs.length} documento(s) enviado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocumento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await deleteDocumento(id);
      setDocumentos(prev => prev.filter(doc => doc.id !== id));
      toast.success('Documento removido com sucesso!');
      
      // Fechar modal de detalhes se estiver aberto
      if (showDetailsModal && documentoSelecionado?.id === id) {
        setShowDetailsModal(false);
        setDocumentoSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleViewDocumento = (doc: DocumentoPessoal) => {
    setDocumentoSelecionado(doc);
    setShowDetailsModal(true);
  };

  const handleDownloadDocumento = (url: string) => {
    // Simular download
    window.open(url, '_blank');
    toast.success('Download iniciado!');
  };

  const handleAdicionarDocumento = async () => {
    if (!nomeDocumento.trim()) {
      toast.error('Digite o nome do documento');
      return;
    }

    if (!arquivoSelecionado) {
      toast.error('Selecione um arquivo');
      return;
    }

    try {
      setIsUploading(true);

      if (USE_MOCK) {
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 800));

        const novoDoc: DocumentoPessoal = {
          id: `doc-personalizado-${Date.now()}`,
          colaborador_id: colaborador.id,
          document_type: 'Outros',
          file_name: `${nomeDocumento} - ${arquivoSelecionado.name}`,
          file_url: `https://exemplo.com/docs/personalizado-${arquivoSelecionado.name}`,
          upload_date: new Date().toISOString(),
          expiry_date: getVencimentoPadrao('Outros'),
          status: 'ativo',
          created_at: new Date().toISOString(),
        };

        setDocumentos(prev => [...prev, novoDoc]);
        logMockOperation('Adicionar documento personalizado', { nome: nomeDocumento, arquivo: arquivoSelecionado.name });
        toast.success('Documento adicionado com sucesso!');
        
        // Limpar e fechar modal
        setNomeDocumento('');
        setArquivoSelecionado(null);
        setShowAddModal(false);
        return;
      }

      // Upload real
      const resultado = await uploadDocumento(
        arquivoSelecionado,
        colaborador.id,
        'arquivos-gerais',
        nomeDocumento
      );

      if (resultado) {
        toast.success('Documento adicionado com sucesso!');
        // Recarregar documentos
        setNomeDocumento('');
        setArquivoSelecionado(null);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      toast.error('Erro ao adicionar documento');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (uploadDate?: string) => {
    if (!uploadDate) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    
    const diasUpload = Math.floor((Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasUpload < 30) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (diasUpload < 90) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (uploadDate?: string) => {
    if (!uploadDate) return 'Não enviado';
    
    const diasUpload = Math.floor((Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasUpload < 30) {
      return 'Atualizado';
    } else if (diasUpload < 90) {
      return 'Desatualizado';
    } else {
      return 'Vencido';
    }
  };

  // Função para calcular dias até vencimento
  const getDiasParaVencimento = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const hoje = new Date();
    const vencimento = new Date(expiryDate);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Função para obter texto de vencimento
  const getVencimentoText = (expiryDate?: string) => {
    const dias = getDiasParaVencimento(expiryDate);
    
    if (dias === null) return 'Sem data de vencimento';
    if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    if (dias <= 7) return `Vence em ${dias} dias`;
    if (dias <= 30) return `Vence em ${dias} dias`;
    if (dias <= 90) return `Vence em ${dias} dias`;
    return `Vence em ${dias} dias`;
  };

  // Função para obter cor do vencimento
  const getVencimentoColor = (expiryDate?: string) => {
    const dias = getDiasParaVencimento(expiryDate);
    
    if (dias === null) return 'text-gray-500';
    if (dias < 0) return 'text-red-600';
    if (dias <= 7) return 'text-red-500';
    if (dias <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* CNH */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Carteira de Habilitação (CNH)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da CNH
            </label>
            <Input
              type="text"
              value={cnhData.numero}
              onChange={(e) => handleCNHChange('numero', e.target.value)}
              placeholder="00000000000"
              disabled={isLoading}
              maxLength={11}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <Select
              value={cnhData.categoria || ''}
              onChange={(value) => handleCNHChange('categoria', value as CategoriaCNH)}
              options={[
                { value: '', label: 'Selecione...' },
                ...CATEGORIA_CNH_OPTIONS,
              ]}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade da CNH
            </label>
            <Input
              type="date"
              value={cnhData.validade}
              onChange={(e) => handleCNHChange('validade', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Upload CNH */}
        <div className="mt-4">
          <FileUpload
            onUpload={async (files) => {
              if (files.length > 0) {
                cnhData.arquivo_url = URL.createObjectURL(files[0]);
                setCnhData({...cnhData});
              }
            }}
            multiple={false}
            maxFiles={1}
            label="CNH (Frente e Verso)"
            helpText="PDF ou imagem até 5MB"
            disabled={isLoading || isUploading}
          />
          
          {/* Botão para salvar CNH */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveCNH}
              disabled={isLoading || isUploading || !cnhData.numero || !cnhData.categoria || !cnhData.validade}
              size="sm"
            >
              {isUploading ? 'Salvando...' : 'Salvar CNH'}
            </Button>
          </div>
        </div>
      </div>

      {/* Documentos Pessoais */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Documentos Pessoais
          </h3>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            disabled={isLoading || isUploading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-3 mb-6">
          {TIPOS_DOCUMENTO.map((tipo) => {
            const docsDoTipo = documentos.filter(doc => doc.document_type === tipo.value);
            const temDocumento = docsDoTipo.length > 0;
            const documentoMaisRecente = docsDoTipo.sort((a, b) => 
              new Date(b.upload_date || b.created_at || '').getTime() - new Date(a.upload_date || a.created_at || '').getTime()
            )[0];

            return (
              <div key={tipo.value} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(documentoMaisRecente?.upload_date || documentoMaisRecente?.created_at)}
                  <div>
                    <p className="font-medium text-gray-900">{tipo.label}</p>
                    <p className="text-sm text-gray-500">
                      {temDocumento ? documentoMaisRecente.file_name : 'Não enviado'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-400">
                        Status: {getStatusText(documentoMaisRecente?.upload_date || documentoMaisRecente?.created_at)}
                      </span>
                      {temDocumento && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className={getVencimentoColor(documentoMaisRecente?.expiry_date)}>
                            {getVencimentoText(documentoMaisRecente?.expiry_date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {temDocumento && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocumento(documentoMaisRecente)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocumento(documentoMaisRecente.id)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <FileUpload
                    onUpload={(files) => handleUploadDocumento(files, tipo.value)}
                    multiple={false}
                    maxFiles={1}
                    label={temDocumento ? "Atualizar" : "Enviar"}
                    helpText=""
                    disabled={isLoading || isUploading}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Documentos Personalizados */}
        {documentos.filter(doc => doc.document_type === 'Outros').length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Documentos Personalizados
            </h4>
            <div className="space-y-2">
              {documentos.filter(doc => doc.document_type === 'Outros').map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Adicionado em {new Date(doc.upload_date || doc.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocumento(doc)}
                      title="Ver Detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocumento(doc.id)}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="card p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Resumo da Documentação
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {documentos.filter(d => d.document_type !== 'Outros').length}
            </div>
            <div className="text-gray-600">Documentos Obrigatórios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {documentos.filter(d => d.document_type === 'Outros').length}
            </div>
            <div className="text-gray-600">Outros Documentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {documentos.filter(d => (d.upload_date || d.created_at) && getStatusText(d.upload_date || d.created_at) === 'Atualizado').length}
            </div>
            <div className="text-gray-600">Atualizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {documentos.filter(d => {
                const dias = getDiasParaVencimento(d.expiry_date);
                return dias !== null && dias > 0 && dias <= 30;
              }).length}
            </div>
            <div className="text-gray-600">Próximos do Vencimento</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {documentos.filter(d => {
                const dias = getDiasParaVencimento(d.expiry_date);
                return dias !== null && dias <= 0;
              }).length}
            </div>
            <div className="text-gray-600">Vencidos</div>
          </div>
        </div>
      </div>

      {/* Indicador de Auto-save */}
      {!isLoading && (
        <div className="text-center text-sm text-gray-500">
          <p>✓ As alterações são salvas automaticamente</p>
        </div>
      )}

      {/* Modal de Adicionar Documento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Adicionar Documento
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNomeDocumento('');
                  setArquivoSelecionado(null);
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Documento <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nomeDocumento}
                  onChange={(e) => setNomeDocumento(e.target.value)}
                  placeholder="Ex: Certidão de Casamento, Título de Eleitor..."
                  disabled={isUploading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validar tamanho (máximo 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('Arquivo muito grande. Máximo 10MB');
                          e.target.value = '';
                          return;
                        }
                        setArquivoSelecionado(file);
                      }
                    }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                    disabled={isUploading}
                  />
                  {arquivoSelecionado && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Arquivo selecionado:</p>
                      <p className="truncate">{arquivoSelecionado.name}</p>
                      <p className="text-xs text-gray-500">
                        {(arquivoSelecionado.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, PNG ou JPG até 10MB
                </p>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setNomeDocumento('');
                  setArquivoSelecionado(null);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAdicionarDocumento}
                disabled={isUploading || !nomeDocumento.trim() || !arquivoSelecionado}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Documento */}
      {showDetailsModal && documentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 rounded-lg p-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhes do Documento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Informações completas do arquivo
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDocumentoSelecionado(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Nome do Documento</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {documentoSelecionado.file_name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <Info className="h-4 w-4" />
                      <span className="font-medium">Tipo</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {TIPOS_DOCUMENTO.find(t => t.value === documentoSelecionado.document_type)?.label || documentoSelecionado.document_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Data de Upload</span>
                    </div>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {(documentoSelecionado.upload_date || documentoSelecionado.created_at)
                        ? new Date(documentoSelecionado.upload_date || documentoSelecionado.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Data não disponível'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Status</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(documentoSelecionado.upload_date || documentoSelecionado.created_at)}
                        <span className="text-sm font-medium">
                          {getStatusText(documentoSelecionado.upload_date || documentoSelecionado.created_at)}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm font-medium ${getVencimentoColor(documentoSelecionado.expiry_date)}`}>
                            {getVencimentoText(documentoSelecionado.expiry_date)}
                          </span>
                        </div>
                        {documentoSelecionado.expiry_date ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Data de vencimento: {new Date(documentoSelecionado.expiry_date).toLocaleDateString('pt-BR')}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Sem data de vencimento definida
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview / Link do Arquivo */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Arquivo</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {documentoSelecionado.file_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Documento armazenado
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocumento(documentoSelecionado.file_url!)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Informações Importantes
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Os documentos são armazenados de forma segura</li>
                        <li>• Mantenha seus documentos sempre atualizados</li>
                        <li>• Em caso de dúvidas, entre em contato com o RH</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-between items-center gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => handleDeleteDocumento(documentoSelecionado.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Documento
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadDocumento(documentoSelecionado.file_url!)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDocumentoSelecionado(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

