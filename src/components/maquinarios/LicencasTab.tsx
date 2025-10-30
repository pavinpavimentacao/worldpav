import React, { useState, useEffect } from 'react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import {
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import {
  LicencaMaquinario,
  TIPO_LICENCA_OPTIONS,
  LICENCAS_OBRIGATORIAS_ESPARGIDOR,
  calcularDiasParaVencimentoLicenca,
  getCorStatusLicenca,
  getTextoStatusLicenca,
  getStatusLicenca,
  verificarLicencasObrigatorias,
  TipoLicenca
} from '../../types/maquinarios-licencas';
import { toast } from '../../lib/toast-hooks';
import { getLicencasByMaquinarioId } from '../../mocks/maquinarios-licencas-mock';

interface LicencasTabProps {
  maquinarioId: string;
  maquinarioNome: string;
  maquinarioTipo: string;
}

export const LicencasTab: React.FC<LicencasTabProps> = ({ 
  maquinarioId, 
  maquinarioNome,
  maquinarioTipo 
}) => {
  const [licencas, setLicencas] = useState<LicencaMaquinario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [licencaEditando, setLicencaEditando] = useState<LicencaMaquinario | null>(null);

  // Form states
  const [tipoLicenca, setTipoLicenca] = useState<string>('ANTT');
  const [numeroLicenca, setNumeroLicenca] = useState('');
  const [orgaoEmissor, setOrgaoEmissor] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [arquivoLicenca, setArquivoLicenca] = useState<File | null>(null);
  const [arquivoLicencaUrl, setArquivoLicencaUrl] = useState('');

  const isEspargidor = maquinarioTipo?.toLowerCase().includes('espargidor') || false;

  useEffect(() => {
    carregarLicencas();
  }, [maquinarioId]);

  const carregarLicencas = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Carregar licenças mockadas
    const licencasMock = getLicencasByMaquinarioId(maquinarioId);
    setLicencas(licencasMock);
    
    setIsLoading(false);
  };

  const handleOpenModal = (mode: 'create' | 'edit', licenca?: LicencaMaquinario) => {
    setModalMode(mode);
    
    if (mode === 'edit' && licenca) {
      setLicencaEditando(licenca);
      setTipoLicenca(licenca.tipo_licenca);
      setNumeroLicenca(licenca.numero_licenca);
      setOrgaoEmissor(licenca.orgao_emissor);
      setDataEmissao(licenca.data_emissao);
      setDataValidade(licenca.data_validade);
      setObservacoes(licenca.observacoes || '');
      setArquivoLicencaUrl(licenca.arquivo_url || '');
      setArquivoLicenca(null);
    } else {
      limparFormulario();
    }
    
    setShowModal(true);
  };

  const limparFormulario = () => {
    setLicencaEditando(null);
    setTipoLicenca('ANTT');
    setNumeroLicenca('');
    setOrgaoEmissor('');
    setDataEmissao('');
    setDataValidade('');
    setObservacoes('');
    setArquivoLicenca(null);
    setArquivoLicencaUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoLicenca || !numeroLicenca || !dataValidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Simular upload de arquivo
    let urlLicenca = arquivoLicencaUrl;
    
    if (arquivoLicenca) {
      await new Promise(resolve => setTimeout(resolve, 500));
      urlLicenca = `https://exemplo.com/licencas/${tipoLicenca}-${arquivoLicenca.name}`;
      toast.success('Licença enviada com sucesso!');
    }

    const novaLicenca: LicencaMaquinario = {
      id: modalMode === 'edit' ? licencaEditando!.id : `licenca-${Date.now()}`,
      maquinario_id: maquinarioId,
      tipo_licenca: tipoLicenca as TipoLicenca,
      numero_licenca: numeroLicenca,
      orgao_emissor: orgaoEmissor,
      data_emissao: dataEmissao,
      data_validade: dataValidade,
      arquivo_url: urlLicenca,
      status: getStatusLicenca(dataValidade),
      observacoes,
      created_at: modalMode === 'edit' ? licencaEditando!.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (modalMode === 'edit') {
      setLicencas(licencas.map(l => l.id === novaLicenca.id ? novaLicenca : l));
      toast.success('Licença atualizada com sucesso!');
    } else {
      setLicencas([...licencas, novaLicenca]);
      toast.success('Licença adicionada com sucesso!');
    }

    setShowModal(false);
    limparFormulario();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta licença?')) {
      setLicencas(licencas.filter(l => l.id !== id));
      toast.success('Licença removida com sucesso!');
    }
  };

  const verificacao = verificarLicencasObrigatorias(licencas, maquinarioTipo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando licenças...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Licenças e Certificações</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as licenças e certificações de {maquinarioNome}
          </p>
        </div>
        <Button onClick={() => handleOpenModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Licença
        </Button>
      </div>

      {/* Alertas de Licenças Obrigatórias */}
      {isEspargidor && (
        <div className="space-y-3">
          {/* Alerta se faltam licenças */}
          {verificacao.faltantes.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Licenças Obrigatórias Faltantes para Caminhão Espargidor
                  </p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {verificacao.faltantes.map(tipo => (
                      <li key={tipo}>
                        {TIPO_LICENCA_OPTIONS.find(opt => opt.value === tipo)?.label || tipo}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Alerta se há licenças vencidas */}
          {verificacao.vencidas.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-orange-400 mt-0.5 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    Licenças Obrigatórias Vencidas
                  </p>
                  <ul className="mt-2 text-sm text-orange-700 list-disc list-inside">
                    {verificacao.vencidas.map(lic => (
                      <li key={lic.id}>
                        {lic.tipo_licenca} - Venceu em {new Date(lic.data_validade).toLocaleDateString('pt-BR')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Confirmação se tudo está OK */}
          {verificacao.completo && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Todas as licenças obrigatórias estão em dia! ✓
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Caminhão apto para operação conforme regulamentação.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <FileCheck className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total</p>
              <p className="text-2xl font-bold text-blue-700">{licencas.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Válidas</p>
              <p className="text-2xl font-bold text-green-700">
                {licencas.filter(l => l.status === 'valida').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Vencem em Breve</p>
              <p className="text-2xl font-bold text-yellow-700">
                {licencas.filter(l => l.status === 'em_renovacao').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-900">Vencidas</p>
              <p className="text-2xl font-bold text-red-700">
                {licencas.filter(l => l.status === 'vencida').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Licenças */}
      {licencas.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Órgão Emissor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Arquivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licencas.map((licenca) => {
                  const diasRestantes = calcularDiasParaVencimentoLicenca(licenca.data_validade);
                  
                  return (
                    <tr key={licenca.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {licenca.tipo_licenca}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{licenca.numero_licenca}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{licenca.orgao_emissor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(licenca.data_validade).toLocaleDateString('pt-BR')}
                        </div>
                        {diasRestantes > 0 && diasRestantes <= 30 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Vence em {diasRestantes} dias
                          </div>
                        )}
                        {diasRestantes < 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Venceu há {Math.abs(diasRestantes)} dias
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCorStatusLicenca(licenca.status)}`}>
                          {getTextoStatusLicenca(licenca.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {licenca.arquivo_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(licenca.arquivo_url, '_blank')}
                            title="Baixar Licença"
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
                            onClick={() => handleOpenModal('edit', licenca)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(licenca.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12">
          <div className="text-center">
            <FileCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma licença cadastrada
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {isEspargidor 
                ? 'Caminhões espargidor precisam das licenças: ANTT, Ambipar, CIPP e CIV'
                : 'Adicione as licenças necessárias para este equipamento'}
            </p>
            <Button onClick={() => handleOpenModal('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Licença
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Licença */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 rounded-lg p-2">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'create' ? 'Adicionar Licença' : 'Editar Licença'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Preencha as informações da licença
                  </p>
                </div>
              </div>
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
              {/* Informações da Licença */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Informações da Licença</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Licença <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={tipoLicenca}
                      onChange={setTipoLicenca}
                      options={TIPO_LICENCA_OPTIONS}
                    />
                    {isEspargidor && LICENCAS_OBRIGATORIAS_ESPARGIDOR.includes(tipoLicenca as TipoLicenca) && (
                      <p className="mt-1 text-xs text-blue-600">
                        ⚠️ Licença obrigatória para caminhão espargidor
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Licença <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={numeroLicenca}
                      onChange={(e) => setNumeroLicenca(e.target.value)}
                      placeholder="Ex: 123456/2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Órgão Emissor
                    </label>
                    <Input
                      value={orgaoEmissor}
                      onChange={(e) => setOrgaoEmissor(e.target.value)}
                      placeholder="Ex: ANTT, DETRAN, IBAMA..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Emissão
                    </label>
                    <Input
                      type="date"
                      value={dataEmissao}
                      onChange={(e) => setDataEmissao(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Validade <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dataValidade}
                      onChange={(e) => setDataValidade(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upload da Licença */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Documento da Licença</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload da Licença (PDF)
                  </label>
                  
                  {/* Mostrar arquivo atual se existir */}
                  {arquivoLicencaUrl && !arquivoLicenca && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Licença cadastrada</p>
                            <p className="text-xs text-green-700">Arquivo disponível no sistema</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(arquivoLicencaUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
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
                          
                          setArquivoLicenca(file);
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
                    
                    {arquivoLicenca ? (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileCheck className="h-8 w-8 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 text-sm">
                              {arquivoLicenca.name}
                            </p>
                            <p className="text-xs text-blue-700">
                              {(arquivoLicenca.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setArquivoLicenca(null)}
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
                          {arquivoLicencaUrl ? 'Clique para atualizar a licença' : 'Clique ou arraste a licença aqui'}
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
                  placeholder="Informações adicionais sobre a licença..."
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
                  <FileCheck className="h-4 w-4 mr-2" />
                  {modalMode === 'create' ? 'Adicionar Licença' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

