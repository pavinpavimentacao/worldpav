/**
 * Página: Nova Relação Diária
 * Criação de nova relação diária de colaboradores
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, AlertTriangle, CheckCircle, UserMinus, X, FileText, Plus } from 'lucide-react';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { toast } from '../../lib/toast-hooks';
import { mockColaboradores } from '../../mocks/colaboradores-mock';
import { criarRelacaoDiaria } from '../../mocks/controle-diario-mock';
import { StatusPresenca, getStatusPresencaInfo } from '../../types/controle-diario';
import { Colaborador, TipoEquipe } from '../../types/colaboradores';
import { formatDateBR } from '../../utils/date-format';
import { useNavigate } from 'react-router-dom';

// Mock de equipes (substituir por dados reais)
const mockEquipes = [
  { id: 'eq-001', nome: 'Equipe Alpha', tipo: 'propria' as TipoEquipe },
  { id: 'eq-002', nome: 'Equipe Beta', tipo: 'propria' as TipoEquipe },
  { id: 'eq-003', nome: 'Equipe Gamma', tipo: 'propria' as TipoEquipe },
  { id: 'eq-004', nome: 'Equipe Delta - Terceira', tipo: 'terceirizada' as TipoEquipe },
];

interface ColaboradorPresenca extends Colaborador {
  selecionado: boolean;
  pertenceEquipe: boolean;
  motivoAusencia?: StatusPresenca;
  equipeDestino?: string;
  observacoesAusencia?: string;
}

interface AusenciaInfo {
  colaboradorId: string;
  status: StatusPresenca;
  equipeDestino?: string;
  observacoes?: string;
}

const NovaRelacaoDiaria: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [colaboradores, setColaboradores] = useState<ColaboradorPresenca[]>([]);
  const [observacoesDia, setObservacoesDia] = useState('');
  
  // Contador de ações
  const [contadorAcoes, setContadorAcoes] = useState(0);

  // Modal de ausência
  const [showAusenciaModal, setShowAusenciaModal] = useState(false);
  const [colaboradorAusencia, setColaboradorAusencia] = useState<ColaboradorPresenca | null>(null);
  const [motivoAusencia, setMotivoAusencia] = useState<StatusPresenca>('falta');
  const [equipeDestino, setEquipeDestino] = useState('');
  const [observacoesAusencia, setObservacoesAusencia] = useState('');

  // Filtrar colaboradores operacionais (equipes de massa)
  const colaboradoresPavimentacao = mockColaboradores.filter(
    (c) => c.ativo !== false && (c.tipo_equipe === 'equipe_a' || c.tipo_equipe === 'equipe_b')
  );

  useEffect(() => {
    if (equipeSelecionada) {
      // Filtrar SOMENTE os colaboradores da equipe selecionada
      const colaboradoresDaEquipe = colaboradoresPavimentacao.filter(
        (col) => col.equipe_id === equipeSelecionada
      );
      
      // Mapear com TODOS pré-selecionados (presentes)
      const colaboradoresEquipe = colaboradoresDaEquipe.map((col) => ({
        ...col,
        selecionado: true, // TODOS vêm marcados como presentes
        pertenceEquipe: true, // Todos pertencem à equipe
      }));
      
      setColaboradores(colaboradoresEquipe);
      setContadorAcoes(prev => prev + 1);
    }
  }, [equipeSelecionada]);

  const handleToggleColaborador = (colaboradorId: string) => {
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);
    if (!colaborador) return;

    // Se estava selecionado e pertence à equipe, abrir modal de ausência
    if (colaborador.selecionado && colaborador.pertenceEquipe) {
      setColaboradorAusencia(colaborador);
      setMotivoAusencia('falta');
      setEquipeDestino('');
      setObservacoesAusencia('');
      setShowAusenciaModal(true);
    } else {
      // Se não estava selecionado, apenas marcar como presente
      setColaboradores((prev) =>
        prev.map((c) => (c.id === colaboradorId ? { ...c, selecionado: !c.selecionado } : c))
      );
      setContadorAcoes(prev => prev + 1);
    }
  };

  const handleConfirmarAusencia = () => {
    if (motivoAusencia === 'mudanca_equipe' && !equipeDestino) {
      toast.error('Selecione a equipe de destino');
      return;
    }

    if (colaboradorAusencia) {
      // Desmarcar colaborador e adicionar informações de ausência
      setColaboradores((prev) =>
        prev.map((c) =>
          c.id === colaboradorAusencia.id
            ? {
                ...c,
                selecionado: false,
                motivoAusencia,
                equipeDestino: motivoAusencia === 'mudanca_equipe' ? equipeDestino : undefined,
                observacoesAusencia,
              }
            : c
        )
      );

      toast.success(`Ausência registrada: ${getStatusPresencaInfo(motivoAusencia).label}`);
    }

    setShowAusenciaModal(false);
    setColaboradorAusencia(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!equipeSelecionada) {
        toast.error('Selecione uma equipe');
        setIsSubmitting(false);
        return;
      }

      const presentes = colaboradores.filter((c) => c.selecionado).map((c) => c.id);
      const ausentes = colaboradores.filter((c) => !c.selecionado && c.pertenceEquipe);

      if (presentes.length === 0) {
        toast.error('Selecione pelo menos um colaborador presente');
        setIsSubmitting(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Criar ausências com informações detalhadas
      const ausencias = ausentes.map((col) => ({
        colaborador_id: col.id,
        status: col.motivoAusencia || 'falta',
        equipe_destino_id: col.equipeDestino,
        observacoes: col.observacoesAusencia,
      }));

      criarRelacaoDiaria({
        data: dataSelecionada,
        equipe_id: equipeSelecionada,
        colaboradores_presentes: presentes,
        ausencias,
        observacoes_dia: observacoesDia.trim() || undefined,
      });

      toast.success('Relação diária registrada com sucesso!');
      navigate('/controle-diario');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar relação diária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colaboradoresPresentes = colaboradores.filter((c) => c.selecionado).length;
  const colaboradoresAusentes = colaboradores.filter((c) => !c.selecionado && c.pertenceEquipe).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/controle-diario')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Nova Relação Diária</h1>
                  <p className="text-gray-600 mt-1">
                    Registre a presença e ausências dos colaboradores
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas da Relação */}
          {equipeSelecionada && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-900">{colaboradores.length}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-900">{colaboradoresPresentes}</p>
                <p className="text-sm text-green-700">Presentes</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-red-900">{colaboradoresAusentes}</p>
                <p className="text-sm text-red-700">Ausências</p>
              </div>
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Data e Equipe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Relação <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateBR(dataSelecionada)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipe <span className="text-red-500">*</span>
                </label>
                <select
                  value={equipeSelecionada}
                  onChange={(e) => setEquipeSelecionada(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma equipe</option>
                  {mockEquipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Colaboradores */}
            {equipeSelecionada && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Colaboradores da Equipe
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      {colaboradoresPresentes} presentes
                    </span>
                    <span className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                      {colaboradoresAusentes} ausências
                    </span>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {colaboradores.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">Nenhum colaborador encontrado para esta equipe</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {colaboradores.map((colaborador) => {
                        const statusInfo = colaborador.motivoAusencia 
                          ? getStatusPresencaInfo(colaborador.motivoAusencia)
                          : null;

                        return (
                          <label
                            key={colaborador.id}
                            className={`
                              flex items-center space-x-4 p-4 cursor-pointer transition-colors hover:bg-gray-50
                              ${colaborador.selecionado ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white'}
                              ${!colaborador.pertenceEquipe ? 'border-l-4 border-orange-400' : ''}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={colaborador.selecionado}
                              onChange={() => handleToggleColaborador(colaborador.id)}
                              disabled={isSubmitting}
                              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 text-lg">
                                    {colaborador.nome}
                                  </p>
                                  <p className="text-sm text-gray-600">{colaborador.funcao}</p>
                                  {!colaborador.pertenceEquipe && (
                                    <span className="inline-flex items-center text-xs text-orange-700 mt-1">
                                      <UserMinus className="w-3 h-3 mr-1" />
                                      Não pertence à equipe
                                    </span>
                                  )}
                                  {statusInfo && (
                                    <div className="mt-2">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                        {statusInfo.label}
                                      </span>
                                      {colaborador.equipeDestino && (
                                        <span className="ml-2 text-xs text-gray-600">
                                          → {mockEquipes.find(e => e.id === colaborador.equipeDestino)?.nome}
                                        </span>
                                      )}
                                      {colaborador.observacoesAusencia && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          💬 {colaborador.observacoesAusencia}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {colaborador.selecionado ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  ) : (
                                    <X className="w-6 h-6 text-red-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Todos os colaboradores da equipe aparecem pré-selecionados. 
                    Para registrar ausência, desmarque o colaborador e escolha o motivo.
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações do Dia
              </label>
              <textarea
                value={observacoesDia}
                onChange={(e) => setObservacoesDia(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observações gerais sobre o dia de trabalho..."
                disabled={isSubmitting}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/controle-diario')}
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancelar</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !equipeSelecionada}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Registrar Relação</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Modal de Ausência */}
        {showAusenciaModal && colaboradorAusencia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Registrar Ausência
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{colaboradorAusencia.nome}</strong> não estará presente. Informe o motivo:
                </p>

                {/* Opções de Ausência */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="falta"
                      checked={motivoAusencia === 'falta'}
                      onChange={(e) => setMotivoAusencia(e.target.value as StatusPresenca)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Falta</p>
                      <p className="text-xs text-gray-600">Ausência não justificada</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="atestado"
                      checked={motivoAusencia === 'atestado'}
                      onChange={(e) => setMotivoAusencia(e.target.value as StatusPresenca)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Atestado Médico</p>
                      <p className="text-xs text-gray-600">Ausência justificada por motivo de saúde</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="mudanca_equipe"
                      checked={motivoAusencia === 'mudanca_equipe'}
                      onChange={(e) => setMotivoAusencia(e.target.value as StatusPresenca)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Mudança de Equipe</p>
                      <p className="text-xs text-gray-600">Colaborador foi para outra equipe</p>
                    </div>
                  </label>
                </div>

                {/* Equipe Destino */}
                {motivoAusencia === 'mudanca_equipe' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipe de Destino <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={equipeDestino}
                      onChange={(e) => setEquipeDestino(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Selecione a equipe</option>
                      {mockEquipes
                        .filter((eq) => eq.id !== equipeSelecionada)
                        .map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.nome}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Observações */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoesAusencia}
                    onChange={(e) => setObservacoesAusencia(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Detalhes adicionais..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAusenciaModal(false);
                      setColaboradorAusencia(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" onClick={handleConfirmarAusencia}>
                    Confirmar Ausência
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NovaRelacaoDiaria;
