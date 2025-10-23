import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '../../types/financial';
import {
  Colaborador,
  getTipoEquipeLabel,
  getFuncaoColor,
} from '../../types/colaboradores';
import { getColaboradorById } from '../../mocks/colaboradores-mock';
import { formatDateBR } from '../../utils/date-format';

// Tipos de documentos mockados
interface DocumentoColaborador {
  id: string;
  tipo: string;
  nome: string;
  dataUpload: string;
  tamanho: string;
  status: 'valido' | 'vencido' | 'pendente';
  dataValidade?: string;
}

const mockDocumentos: DocumentoColaborador[] = [
  {
    id: '1',
    tipo: 'CNH',
    nome: 'Carteira Nacional de Habilitação',
    dataUpload: '2025-01-10',
    tamanho: '2.3 MB',
    status: 'valido',
    dataValidade: '2028-03-15',
  },
  {
    id: '2',
    tipo: 'RG',
    nome: 'Registro Geral (RG)',
    dataUpload: '2025-01-10',
    tamanho: '1.8 MB',
    status: 'valido',
  },
  {
    id: '3',
    tipo: 'CPF',
    nome: 'Cadastro de Pessoa Física',
    dataUpload: '2025-01-10',
    tamanho: '0.5 MB',
    status: 'valido',
  },
  {
    id: '4',
    tipo: 'Comprovante de Residência',
    nome: 'Conta de Luz - Janeiro/2025',
    dataUpload: '2025-01-10',
    tamanho: '1.2 MB',
    status: 'valido',
  },
  {
    id: '5',
    tipo: 'CTPS',
    nome: 'Carteira de Trabalho',
    dataUpload: '2025-01-10',
    tamanho: '3.1 MB',
    status: 'valido',
  },
  {
    id: '6',
    tipo: 'Certificado ASO',
    nome: 'Atestado de Saúde Ocupacional',
    dataUpload: '2024-12-20',
    tamanho: '0.8 MB',
    status: 'vencido',
    dataValidade: '2024-12-31',
  },
  {
    id: '7',
    tipo: 'Certificado NR',
    nome: 'Certificado NR-18 (Segurança)',
    dataUpload: '2025-01-05',
    tamanho: '1.5 MB',
    status: 'valido',
    dataValidade: '2026-01-05',
  },
];

const ColaboradorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'informacoes' | 'documentacao'>('informacoes');
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [documentos] = useState<DocumentoColaborador[]>(mockDocumentos);

  useEffect(() => {
    if (id) {
      const colab = getColaboradorById(id);
      setColaborador(colab || null);
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/colaboradores/${id}/edit`);
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${colaborador?.nome}?`)) {
      alert('Em produção, o colaborador seria excluído.');
      navigate('/colaboradores');
    }
  };

  const handleDownloadDocumento = (doc: DocumentoColaborador) => {
    alert(`Download do documento: ${doc.nome}`);
  };

  const handleViewDocumento = (doc: DocumentoColaborador) => {
    alert(`Visualizar documento: ${doc.nome}`);
  };

  if (!colaborador) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Colaborador não encontrado</p>
            <Button onClick={() => navigate('/colaboradores')} className="mt-4">
              Voltar para Colaboradores
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const funcaoColor = getFuncaoColor(colaborador.funcao);

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/colaboradores')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{colaborador.nome}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${funcaoColor.bg} ${funcaoColor.text}`}
                >
                  {colaborador.funcao}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    colaborador.tipo_equipe === 'massa'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {getTipoEquipeLabel(colaborador.tipo_equipe)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('informacoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'informacoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab('documentacao')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documentacao'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Documentação
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'informacoes' && (
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados Pessoais
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPF</dt>
                  <dd className="mt-1 text-sm text-gray-900">{colaborador.cpf || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {colaborador.telefone ? (
                      <>
                        <Phone className="h-4 w-4 mr-1" />
                        {colaborador.telefone}
                      </>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">E-mail</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {colaborador.email ? (
                      <>
                        <Mail className="h-4 w-4 mr-1" />
                        {colaborador.email}
                      </>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm">
                    {colaborador.registrado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Registrado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Não Registrado
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Dados Profissionais */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Dados Profissionais
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo de Contrato</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{colaborador.tipo_contrato}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vale Transporte</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {colaborador.vale_transporte
                      ? `Sim (${colaborador.qtd_passagens_por_dia || 0} passagens/dia)`
                      : 'Não'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Informações Financeiras */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Informações Financeiras
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {colaborador.tipo_contrato === 'fixo' ? 'Salário Fixo' : 'Diária'}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(colaborador.salario_fixo)}
                  </dd>
                </div>
                {colaborador.tipo_contrato === 'fixo' && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data Pagamento 1</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDateBR(colaborador.data_pagamento_1)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Valor Pagamento 1</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {colaborador.valor_pagamento_1
                          ? formatCurrency(colaborador.valor_pagamento_1)
                          : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data Pagamento 2</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDateBR(colaborador.data_pagamento_2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Valor Pagamento 2</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {colaborador.valor_pagamento_2
                          ? formatCurrency(colaborador.valor_pagamento_2)
                          : '-'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'documentacao' && (
          <div className="space-y-6">
            {/* Header com botão de upload */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Documentos do Colaborador</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Gerencie todos os documentos e certificados
                </p>
              </div>
              <Button onClick={() => alert('Upload de documento - Em desenvolvimento')}>
                <Upload className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </div>

            {/* Lista de Documentos */}
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nome do Arquivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data Upload
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Validade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tamanho
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documentos.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {doc.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{doc.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateBR(doc.dataUpload)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.dataValidade ? formatDateBR(doc.dataValidade) : 'Indeterminado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.status === 'valido' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Válido
                            </span>
                          )}
                          {doc.status === 'vencido' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Vencido
                            </span>
                          )}
                          {doc.status === 'pendente' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.tamanho}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocumento(doc)}
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocumento(doc)}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estatísticas de Documentos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Válidos</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {documentos.filter((d) => d.status === 'valido').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Vencidos</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {documentos.filter((d) => d.status === 'vencido').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-xl font-semibold text-gray-900">{documentos.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ColaboradorDetails;

