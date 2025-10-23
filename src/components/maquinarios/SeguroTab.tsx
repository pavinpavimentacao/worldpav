import React, { useState, useEffect } from 'react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  Upload,
  Download,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  SeguroMaquinario,
  SinistroSeguro,
  TIPO_COBERTURA_OPTIONS,
  FORMA_PAGAMENTO_OPTIONS,
  STATUS_SEGURO_OPTIONS,
  calcularDiasParaVencimento,
  getCorStatus,
  getTextoStatus,
  getStatusSeguro
} from '../../types/maquinarios-seguro';
import { formatCurrency } from '../../types/financial';
import { toast } from '../../lib/toast-hooks';
import { getSegurosByMaquinarioId } from '../../mocks/maquinarios-seguro-mock';

interface SeguroTabProps {
  maquinarioId: string;
  maquinarioNome: string;
}

export const SeguroTab: React.FC<SeguroTabProps> = ({ maquinarioId, maquinarioNome }) => {
  const [seguros, setSeguros] = useState<SeguroMaquinario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [seguroEditando, setSeguroEditando] = useState<SeguroMaquinario | null>(null);

  // Form states
  const [seguradora, setSeguradora] = useState('');
  const [numeroApolice, setNumeroApolice] = useState('');
  const [tipoCobertura, setTipoCobertura] = useState('compreensiva');
  const [valorSegurado, setValorSegurado] = useState('');
  const [valorFranquia, setValorFranquia] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('vista');
  const [valorPremio, setValorPremio] = useState('');
  const [valorParcela, setValorParcela] = useState('');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [corretor, setCorretor] = useState('');
  const [telefoneCorretor, setTelefoneCorretor] = useState('');
  const [emailCorretor, setEmailCorretor] = useState('');
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoApoliceUrl, setArquivoApoliceUrl] = useState('');

  useEffect(() => {
    carregarSeguros();
  }, [maquinarioId]);

  const carregarSeguros = async () => {
    setIsLoading(true);
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 500));
    const segurosFiltrados = getSegurosByMaquinarioId(maquinarioId);
    setSeguros(segurosFiltrados);
    setIsLoading(false);
  };

  const handleOpenModal = (mode: 'create' | 'edit', seguro?: SeguroMaquinario) => {
    setModalMode(mode);
    
    if (mode === 'edit' && seguro) {
      setSeguroEditando(seguro);
      setSeguradora(seguro.seguradora);
      setNumeroApolice(seguro.numero_apolice);
      setTipoCobertura(seguro.tipo_cobertura);
      setValorSegurado(seguro.valor_segurado.toString());
      setValorFranquia(seguro.valor_franquia.toString());
      setDataInicio(seguro.data_inicio_vigencia);
      setDataFim(seguro.data_fim_vigencia);
      setFormaPagamento(seguro.forma_pagamento);
      setValorPremio(seguro.valor_premio.toString());
      setValorParcela(seguro.valor_parcela?.toString() || '');
      setQuantidadeParcelas(seguro.quantidade_parcelas?.toString() || '');
      setDiaVencimento(seguro.dia_vencimento?.toString() || '');
      setObservacoes(seguro.observacoes || '');
      setCorretor(seguro.corretor || '');
      setTelefoneCorretor(seguro.telefone_corretor || '');
      setEmailCorretor(seguro.email_corretor || '');
      setArquivoApoliceUrl(seguro.arquivo_apolice_url || '');
      setArquivoApolice(null);
    } else {
      limparFormulario();
    }
    
    setShowModal(true);
  };

  const limparFormulario = () => {
    setSeguroEditando(null);
    setSeguradora('');
    setNumeroApolice('');
    setTipoCobertura('compreensiva');
    setValorSegurado('');
    setValorFranquia('');
    setDataInicio('');
    setDataFim('');
    setFormaPagamento('vista');
    setValorPremio('');
    setValorParcela('');
    setQuantidadeParcelas('');
    setDiaVencimento('');
    setObservacoes('');
    setCorretor('');
    setTelefoneCorretor('');
    setEmailCorretor('');
    setArquivoApolice(null);
    setArquivoApoliceUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seguradora || !numeroApolice || !dataInicio || !dataFim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Simular upload de arquivo
    let urlApolice = arquivoApoliceUrl;
    
    if (arquivoApolice) {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 500));
      urlApolice = `https://exemplo.com/apolices/${arquivoApolice.name}`;
      toast.success('Apólice enviada com sucesso!');
    }

    const novoSeguro: SeguroMaquinario = {
      id: modalMode === 'edit' ? seguroEditando!.id : `seguro-${Date.now()}`,
      maquinario_id: maquinarioId,
      seguradora,
      numero_apolice: numeroApolice,
      tipo_cobertura: tipoCobertura as any,
      valor_segurado: parseFloat(valorSegurado),
      valor_franquia: parseFloat(valorFranquia),
      data_inicio_vigencia: dataInicio,
      data_fim_vigencia: dataFim,
      forma_pagamento: formaPagamento as any,
      valor_premio: parseFloat(valorPremio),
      valor_parcela: valorParcela ? parseFloat(valorParcela) : undefined,
      quantidade_parcelas: quantidadeParcelas ? parseInt(quantidadeParcelas) : undefined,
      dia_vencimento: diaVencimento ? parseInt(diaVencimento) : undefined,
      observacoes,
      corretor,
      telefone_corretor: telefoneCorretor,
      email_corretor: emailCorretor,
      arquivo_apolice_url: urlApolice,
      status: getStatusSeguro(dataFim),
      created_at: modalMode === 'edit' ? seguroEditando!.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (modalMode === 'edit') {
      setSeguros(seguros.map(s => s.id === novoSeguro.id ? novoSeguro : s));
      toast.success('Seguro atualizado com sucesso!');
    } else {
      setSeguros([...seguros, novoSeguro]);
      toast.success('Seguro adicionado com sucesso!');
    }

    setShowModal(false);
    limparFormulario();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este seguro?')) {
      setSeguros(seguros.filter(s => s.id !== id));
      toast.success('Seguro removido com sucesso!');
    }
  };

  const seguroAtivo = seguros.find(s => s.status === 'ativo');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando seguros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seguro do Equipamento</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as informações de seguro de {maquinarioNome}
          </p>
        </div>
        <Button onClick={() => handleOpenModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Seguro
        </Button>
      </div>

      {/* Alerta se não há seguro ativo */}
      {!seguroAtivo && seguros.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Nenhum seguro cadastrado
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                É importante manter o equipamento segurado para proteção contra sinistros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card de Seguro Ativo */}
      {seguroAtivo && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-lg p-3 mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-blue-900">Seguro Ativo</h4>
                <p className="text-sm text-blue-700">{seguroAtivo.seguradora}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCorStatus(seguroAtivo.status)}`}>
              {getTextoStatus(seguroAtivo.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Número da Apólice</p>
              <p className="text-sm font-semibold text-blue-900">{seguroAtivo.numero_apolice}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Valor Segurado</p>
              <p className="text-sm font-semibold text-blue-900">{formatCurrency(seguroAtivo.valor_segurado)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Vigência</p>
              <p className="text-sm font-semibold text-blue-900">
                {new Date(seguroAtivo.data_fim_vigencia).toLocaleDateString('pt-BR')}
              </p>
              {calcularDiasParaVencimento(seguroAtivo.data_fim_vigencia) <= 30 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Vence em {calcularDiasParaVencimento(seguroAtivo.data_fim_vigencia)} dias
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {seguroAtivo.arquivo_apolice_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(seguroAtivo.arquivo_apolice_url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Apólice
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal('edit', seguroAtivo)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      )}

      {/* Histórico de Seguros */}
      {seguros.length > 0 && (
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b">
            <h4 className="font-semibold text-gray-900">Histórico de Seguros</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seguradora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Apólice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vigência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Segurado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Apólice
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seguros.map((seguro) => (
                  <tr key={seguro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{seguro.seguradora}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{seguro.numero_apolice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(seguro.data_inicio_vigencia).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(seguro.data_fim_vigencia).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(seguro.valor_segurado)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCorStatus(seguro.status)}`}>
                        {getTextoStatus(seguro.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {seguro.arquivo_apolice_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(seguro.arquivo_apolice_url, '_blank')}
                          title="Baixar Apólice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal('edit', seguro)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(seguro.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Seguro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Adicionar Seguro' : 'Editar Seguro'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  limparFormulario();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações da Seguradora */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Informações da Seguradora</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seguradora <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={seguradora}
                      onChange={(e) => setSeguradora(e.target.value)}
                      placeholder="Ex: Porto Seguro, Bradesco Seguros..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Apólice <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={numeroApolice}
                      onChange={(e) => setNumeroApolice(e.target.value)}
                      placeholder="Ex: PS-2024-001234"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cobertura
                    </label>
                    <Select
                      value={tipoCobertura}
                      onChange={setTipoCobertura}
                      options={TIPO_COBERTURA_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Segurado <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={valorSegurado}
                      onChange={(e) => setValorSegurado(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Franquia
                    </label>
                    <Input
                      type="number"
                      value={valorFranquia}
                      onChange={(e) => setValorFranquia(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Vigência */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Vigência</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Informações de Pagamento</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <Select
                      value={formaPagamento}
                      onChange={setFormaPagamento}
                      options={FORMA_PAGAMENTO_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total (Prêmio)
                    </label>
                    <Input
                      type="number"
                      value={valorPremio}
                      onChange={(e) => setValorPremio(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  {formaPagamento !== 'vista' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor da Parcela
                        </label>
                        <Input
                          type="number"
                          value={valorParcela}
                          onChange={(e) => setValorParcela(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantidade de Parcelas
                        </label>
                        <Input
                          type="number"
                          value={quantidadeParcelas}
                          onChange={(e) => setQuantidadeParcelas(e.target.value)}
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dia do Vencimento
                        </label>
                        <Input
                          type="number"
                          value={diaVencimento}
                          onChange={(e) => setDiaVencimento(e.target.value)}
                          placeholder="15"
                          min="1"
                          max="31"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Corretor */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Informações do Corretor (Opcional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Corretor
                    </label>
                    <Input
                      value={corretor}
                      onChange={(e) => setCorretor(e.target.value)}
                      placeholder="Nome ou empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <Input
                      value={telefoneCorretor}
                      onChange={(e) => setTelefoneCorretor(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      value={emailCorretor}
                      onChange={(e) => setEmailCorretor(e.target.value)}
                      placeholder="corretor@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Upload da Apólice */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Documento da Apólice</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload da Apólice (PDF)
                  </label>
                  
                  {/* Mostrar arquivo atual se existir */}
                  {arquivoApoliceUrl && !arquivoApolice && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Apólice cadastrada</p>
                            <p className="text-xs text-green-700">Arquivo disponível no sistema</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(arquivoApoliceUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validar tipo de arquivo
                          if (file.type !== 'application/pdf') {
                            toast.error('Apenas arquivos PDF são permitidos');
                            e.target.value = '';
                            return;
                          }
                          
                          // Validar tamanho (máximo 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('Arquivo muito grande. Máximo 10MB');
                            e.target.value = '';
                            return;
                          }
                          
                          setArquivoApolice(file);
                        }
                      }}
                      accept=".pdf"
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer"
                    />
                    
                    {arquivoApolice ? (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 text-sm">
                              {arquivoApolice.name}
                            </p>
                            <p className="text-xs text-blue-700">
                              {(arquivoApolice.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setArquivoApolice(null)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {arquivoApoliceUrl ? 'Clique para atualizar a apólice' : 'Clique ou arraste a apólice aqui'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF até 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre a apólice..."
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    limparFormulario();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Shield className="h-4 w-4 mr-2" />
                  {modalMode === 'create' ? 'Adicionar Seguro' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

