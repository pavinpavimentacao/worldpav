/**
 * Componente: Lista de Relações Diárias
 * Exibe as relações diárias com detalhes de presentes e ausentes
 */

import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, AlertTriangle, UserMinus, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { listarRelacoesDiarias } from '../../mocks/controle-diario-mock';
import { getStatusPresencaInfo } from '../../types/controle-diario';
import { formatDateBR } from '../../utils/date-format';

export const RelacoesDiariasList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const relacoes = listarRelacoesDiarias();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (relacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma relação diária registrada
        </h3>
        <p className="text-gray-600">
          Clique em "+ Nova Relação" para criar a primeira relação diária
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Relações Diárias Registradas</h3>
      
      {relacoes.map((relacao) => {
        const isExpanded = expandedId === relacao.id;
        const presentes = relacao.registros.filter((r) => r.status === 'presente');
        const ausentes = relacao.registros.filter((r) => r.status !== 'presente');

        return (
          <div
            key={relacao.id}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            {/* Header do Card */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(relacao.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {formatDateBR(relacao.data)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {relacao.equipe_nome || 'Equipe não informada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Estatísticas */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-900">
                        {relacao.total_presentes}
                      </span>
                      <span className="text-green-700">presentes</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-900">
                        {relacao.total_ausencias}
                      </span>
                      <span className="text-red-700">ausências</span>
                    </div>
                  </div>

                  {/* Botão Expandir */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Observações (se houver) */}
              {relacao.observacoes_dia && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Observações:</strong> {relacao.observacoes_dia}
                  </p>
                </div>
              )}
            </div>

            {/* Detalhes Expandidos */}
            {isExpanded && (
              <div className="border-t-2 border-gray-200 bg-gray-50">
                <div className="p-6 space-y-6">
                  {/* Colaboradores Presentes */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h5 className="text-md font-semibold text-gray-900">
                        Colaboradores Presentes ({presentes.length})
                      </h5>
                    </div>
                    {presentes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {presentes.map((reg) => (
                          <div
                            key={reg.id}
                            className="bg-white border-2 border-green-200 rounded-lg p-3 flex items-center space-x-3"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {reg.colaborador_nome || 'Nome não informado'}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {reg.colaborador_funcao || 'Função não informada'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Nenhum colaborador presente
                      </p>
                    )}
                  </div>

                  {/* Colaboradores Ausentes */}
                  {ausentes.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h5 className="text-md font-semibold text-gray-900">
                          Ausências Registradas ({ausentes.length})
                        </h5>
                      </div>
                      <div className="space-y-3">
                        {ausentes.map((reg) => {
                          const statusInfo = getStatusPresencaInfo(reg.status);
                          return (
                            <div
                              key={reg.id}
                              className="bg-white border-2 border-red-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <UserMinus className="w-5 h-5 text-red-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {reg.colaborador_nome || 'Nome não informado'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {reg.colaborador_funcao || 'Função não informada'}
                                    </p>
                                    {reg.observacoes && (
                                      <p className="text-sm text-gray-500 mt-2 italic">
                                        💬 {reg.observacoes}
                                      </p>
                                    )}
                                    {reg.equipe_destino_nome && (
                                      <p className="text-sm text-orange-600 mt-1 font-medium">
                                        → Transferido para: {reg.equipe_destino_nome}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex-shrink-0`}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};






