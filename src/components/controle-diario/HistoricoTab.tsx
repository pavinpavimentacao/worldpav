/**
 * Tab: Histórico
 * Consulta de registros passados de relações diárias
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Users, Search, Eye, X } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { listarRelacoesDiarias } from '../../mocks/controle-diario-mock';
import { RelacaoDiariaCompleta, getStatusPresencaInfo } from '../../types/controle-diario';
import { formatDateBR } from '../../utils/date-format';

export const HistoricoTab: React.FC = () => {
  const [relacoes] = useState<RelacaoDiariaCompleta[]>(listarRelacoesDiarias());
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [relacaoSelecionada, setRelacaoSelecionada] = useState<RelacaoDiariaCompleta | null>(null);

  // Filtros
  const [filtroData, setFiltroData] = useState('');
  const [filtroEquipe, setFiltroEquipe] = useState('');

  // Filtrar relações
  const relacoesFiltradas = useMemo(() => {
    return relacoes.filter((relacao) => {
      const matchData = filtroData === '' || relacao.data === filtroData;
      const matchEquipe =
        filtroEquipe === '' ||
        relacao.equipe_nome?.toLowerCase().includes(filtroEquipe.toLowerCase());

      return matchData && matchEquipe;
    });
  }, [relacoes, filtroData, filtroEquipe]);

  const handleVerDetalhes = (relacao: RelacaoDiariaCompleta) => {
    setRelacaoSelecionada(relacao);
    setShowDetalhesModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Histórico de Relações</h2>
        <p className="text-gray-600 mt-1">Consulte registros passados de controle diário</p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Equipe</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={filtroEquipe}
                onChange={(e) => setFiltroEquipe(e.target.value)}
                placeholder="Nome da equipe..."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Data</label>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFiltroData('');
                setFiltroEquipe('');
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Relações */}
      <div className="space-y-3">
        {relacoesFiltradas.map((relacao) => (
          <div
            key={relacao.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {relacao.equipe_nome || 'Equipe não identificada'}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {relacao.equipe_tipo === 'propria' ? 'Própria' : 'Terceirizada'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-semibold text-gray-900">{formatDateBR(relacao.data)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Presentes</p>
                      <p className="font-semibold text-green-600">{relacao.total_presentes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ausências</p>
                      <p className="font-semibold text-red-600">{relacao.total_ausencias}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">
                        {relacao.total_presentes + relacao.total_ausencias}
                      </p>
                    </div>
                  </div>

                  {relacao.observacoes_dia && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      💬 {relacao.observacoes_dia}
                    </p>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVerDetalhes(relacao)}
                className="flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalhes</span>
              </Button>
            </div>
          </div>
        ))}

        {relacoesFiltradas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma relação encontrada</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetalhesModal && relacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes da Relação Diária
                </h3>
                <p className="text-sm text-gray-600">
                  {relacaoSelecionada.equipe_nome} - {formatDateBR(relacaoSelecionada.data)}
                </p>
              </div>
              <button onClick={() => setShowDetalhesModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-900">
                    {relacaoSelecionada.total_presentes + relacaoSelecionada.total_ausencias}
                  </p>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-900">
                    {relacaoSelecionada.total_presentes}
                  </p>
                  <p className="text-xs text-green-700">Presentes</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <Users className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-900">
                    {relacaoSelecionada.total_ausencias}
                  </p>
                  <p className="text-xs text-red-700">Ausências</p>
                </div>
              </div>

              {/* Observações */}
              {relacaoSelecionada.observacoes_dia && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Observações do Dia</h4>
                  <p className="text-sm text-gray-700">{relacaoSelecionada.observacoes_dia}</p>
                </div>
              )}

              {/* Registros de Presença */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Registros de Presença</h4>
                <div className="space-y-2">
                  {relacaoSelecionada.registros.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum registro de presença disponível
                    </p>
                  ) : (
                    relacaoSelecionada.registros.map((registro) => {
                      const statusInfo = getStatusPresencaInfo(registro.status);
                      return (
                        <div
                          key={registro.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                            registro.status === 'presente'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {registro.colaborador_nome || 'Colaborador não identificado'}
                            </p>
                            <p className="text-sm text-gray-600">{registro.colaborador_funcao}</p>
                            {registro.observacoes && (
                              <p className="text-xs text-gray-500 mt-1">
                                💬 {registro.observacoes}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t">
              <Button variant="outline" onClick={() => setShowDetalhesModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


