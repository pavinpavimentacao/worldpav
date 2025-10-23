import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import { CurrencyInput } from '../ui/currency-input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ColaboradorMulta, ColaboradorMultaInsert, STATUS_MULTA_OPTIONS } from '../../types/colaboradores';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { formatCurrency } from '../../types/financial';
import { 
  getMultasByColaborador,
  createMulta,
  updateMulta,
  deleteMulta
} from '../../lib/colaboradoresDetalhamentoApi';
import { MultaViewerModal } from './MultaViewerModal';

interface MultasTabProps {
  colaboradorId: string;
  colaboradorNome?: string;
}

export const MultasTab: React.FC<MultasTabProps> = ({ colaboradorId, colaboradorNome = '' }) => {
  const [multas, setMultas] = useState<ColaboradorMulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [multaSelecionada, setMultaSelecionada] = useState<ColaboradorMulta | null>(null);
  const [editando, setEditando] = useState<ColaboradorMulta | null>(null);

  const [tipoInfracao, setTipoInfracao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number>(0);
  const [pontosCarteira, setPontosCarteira] = useState<number>(0);
  const [dataInfracao, setDataInfracao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [localInfracao, setLocalInfracao] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente' | 'em_recurso'>('pendente');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const carregarMultas = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = await getMultasByColaborador(colaboradorId);
      setMultas(data);
    } catch (error) {
      console.error('Erro ao carregar multas:', error);
      toast.error('Erro ao carregar multas');
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    carregarMultas();
  }, [carregarMultas]);

  const abrirModal = (multa?: ColaboradorMulta) => {
    if (multa) {
      setEditando(multa);
      setTipoInfracao(multa.tipo_infracao);
      setDescricao(multa.descricao || '');
      setValor(multa.valor || 0);
      setPontosCarteira(multa.pontos_carteira || 0);
      setDataInfracao(multa.data_infracao.split('T')[0] + 'T' + multa.data_infracao.split('T')[1].substring(0, 5));
      setDataVencimento(multa.data_vencimento || '');
      setLocalInfracao(multa.local_infracao || '');
      setStatus(multa.status);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditando(null);
    setTipoInfracao('');
    setDescricao('');
    setValor(0);
    setPontosCarteira(0);
    setDataInfracao('');
    setDataVencimento('');
    setLocalInfracao('');
    setStatus('pendente');
    setArquivo(null);
  };

  const abrirViewerModal = (multa: ColaboradorMulta) => {
    setMultaSelecionada(multa);
    setShowViewerModal(true);
  };

  const handleSalvar = async () => {
    if (!tipoInfracao.trim() || !dataInfracao) {
      toast.error('Tipo de infração e data são obrigatórios');
      return;
    }

    try {
      setUploading(true);

      let arquivoUrl = editando?.comprovante_url || null;

      if (arquivo) {
        const uploadResult = await uploadDocumento(arquivo, colaboradorId, 'multas');
        if (uploadResult) arquivoUrl = uploadResult.url;
      }

      if (editando) {
        await updateMulta(editando.id, {
          tipo_infracao: tipoInfracao,
          descricao: descricao || null,
          valor: valor || null,
          pontos_carteira: pontosCarteira || null,
          data_infracao: new Date(dataInfracao).toISOString().split('T')[0],
          data_vencimento: dataVencimento || null,
          local_infracao: localInfracao || null,
          status,
          comprovante_url: arquivoUrl || undefined,
        });

        toast.success('Multa atualizada!');
      } else {
        const novaMulta: ColaboradorMultaInsert = {
          colaborador_id: colaboradorId,
          tipo_infracao: tipoInfracao,
          descricao: descricao || null,
          valor: valor || null,
          pontos_carteira: pontosCarteira || null,
          data_infracao: new Date(dataInfracao).toISOString().split('T')[0],
          data_vencimento: dataVencimento || null,
          local_infracao: localInfracao || null,
          status,
          comprovante_url: arquivoUrl || undefined,
        };

        await createMulta(novaMulta);
        toast.success('Multa adicionada!');
      }

      setShowModal(false);
      resetForm();
      await carregarMultas();
    } catch (error: unknown) {
      console.error('Erro ao salvar multa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar multa';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta multa?')) return;

    try {
      await deleteMulta(id);
      toast.success('Multa excluída!');
      await carregarMultas();
    } catch (error: unknown) {
      console.error('Erro ao excluir multa:', error);
      toast.error('Erro ao excluir multa');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pago: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      em_recurso: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const totalPendente = multas.filter(m => m.status === 'pendente').reduce((sum, m) => sum + (m.valor || 0), 0);
  const totalPontos = multas.reduce((sum, m) => sum + (m.pontos_carteira || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Carregando multas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Multas</h3>
        </div>
        <Button onClick={() => abrirModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Multa
        </Button>
      </div>

      {multas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-900">{formatCurrency(totalPendente)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Total de Pontos</p>
            <p className="text-2xl font-bold text-red-900">{totalPontos}</p>
          </div>
        </div>
      )}

      {multas.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Nenhuma multa registrada</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Infração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {multas.map((multa) => (
                  <tr key={multa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(multa.data_infracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{multa.tipo_infracao}</div>
                      {multa.local_infracao && (
                        <div className="text-xs text-gray-500">{multa.local_infracao}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {multa.valor ? formatCurrency(multa.valor) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {multa.pontos_carteira || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadge(multa.status)}`}>
                        {STATUS_MULTA_OPTIONS.find(o => o.value === multa.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => abrirViewerModal(multa)} className="text-blue-600 hover:text-blue-800" title="Visualizar detalhes">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => abrirModal(multa)} className="text-gray-600 hover:text-gray-800" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleExcluir(multa.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editando ? 'Editar Multa' : 'Nova Multa'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Infração <span className="text-red-500">*</span>
                </label>
                <Input type="text" value={tipoInfracao} onChange={(e) => setTipoInfracao(e.target.value)} placeholder="Ex: Excesso de velocidade" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição detalhada da infração" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <CurrencyInput value={valor} onChange={setValor} placeholder="R$ 0,00" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pontos na Carteira</label>
                  <Input type="number" value={pontosCarteira} onChange={(e) => setPontosCarteira(parseInt(e.target.value) || 0)} placeholder="0" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora da Infração <span className="text-red-500">*</span>
                  </label>
                  <Input type="datetime-local" value={dataInfracao} onChange={(e) => setDataInfracao(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                  <Input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local da Infração</label>
                <Input type="text" value={localInfracao} onChange={(e) => setLocalInfracao(e.target.value)} placeholder="Ex: Rodovia BR-101, km 234" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={status} onChange={(v) => setStatus(v as 'pago' | 'pendente' | 'em_recurso')} options={STATUS_MULTA_OPTIONS} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comprovante</label>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }} disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={uploading}>
                {uploading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewerModal && multaSelecionada && (
        <MultaViewerModal
          isOpen={showViewerModal}
          onClose={() => setShowViewerModal(false)}
          multa={multaSelecionada}
          colaboradorNome={colaboradorNome}
        />
      )}
    </div>
  );
};

