/**
 * Tab: Diárias do Colaborador
 * Exibe diárias e pagamentos do colaborador
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { listarDiarias } from '../../lib/controle-diario-api';
import { formatDateBR } from '../../utils/date-format';
import { formatarValor } from '../../types/controle-diario';

interface DiariasTabProps {
  colaboradorId: string;
  colaboradorNome: string;
}

export function DiariasTab({ colaboradorId, colaboradorNome }: DiariasTabProps) {
  const [diarias, setDiarias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    loadDiarias();
  }, [colaboradorId, dataInicio, dataFim]);

  const loadDiarias = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando diárias para colaborador:', colaboradorId);
      
      // Buscar diárias do colaborador
      const todasDiarias = await listarDiarias({
        colaborador_id: colaboradorId,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined
      });

      console.log('📊 Diárias encontradas:', todasDiarias.length);

      // Ordenar por data (mais recente primeiro)
      const diariasOrdenadas = todasDiarias.sort((a, b) => {
        return new Date(b.data_diaria).getTime() - new Date(a.data_diaria).getTime();
      });

      setDiarias(diariasOrdenadas);
    } catch (error) {
      console.error('❌ Erro ao carregar diárias:', error);
    } finally {
      setLoading(false);
    }
  };

  const diariasPendentes = diarias.filter(d => d.status_pagamento === 'pendente');
  const diariasPagas = diarias.filter(d => d.status_pagamento === 'pago');
  const valorTotal = diarias.reduce((sum, d) => sum + d.valor_total, 0);
  const valorPendente = diariasPendentes.reduce((sum, d) => sum + d.valor_total, 0);
  const valorPago = diariasPagas.reduce((sum, d) => sum + d.valor_total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando histórico de diárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Total Diárias</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{diarias.length}</p>
          <p className="text-sm text-blue-600">{formatarValor(valorTotal)}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Pendentes</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{diariasPendentes.length}</p>
          <p className="text-sm text-yellow-600">{formatarValor(valorPendente)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Pagas</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{diariasPagas.length}</p>
          <p className="text-sm text-green-600">{formatarValor(valorPago)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Média</h3>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            {diarias.length > 0 ? formatarValor(valorTotal / diarias.length) : 'R$ 0,00'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDataInicio('');
                setDataFim('');
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Diárias */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Histórico de Diárias ({diarias.length} registros)
        </h3>
        
        {diarias.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-gray-200">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhuma diária encontrada para {colaboradorNome}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {diarias.map((diaria) => {
              const isPago = diaria.status_pagamento === 'pago';
              
              return (
                <div
                  key={diaria.id}
                  className={`bg-white border-2 rounded-lg p-4 ${
                    isPago ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPago ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {isPago ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-semibold text-gray-900 text-lg">
                            {formatDateBR(diaria.data_diaria)}
                          </p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isPago
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {isPago ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Quantidade:</span>
                            <p className="font-semibold text-gray-900">{diaria.quantidade}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Valor Unitário:</span>
                            <p className="font-semibold text-gray-900">
                              {formatarValor(diaria.valor_unitario)}
                            </p>
                          </div>
                          {diaria.adicional > 0 && (
                            <div>
                              <span className="text-gray-600">Adicional:</span>
                              <p className="font-semibold text-green-600">
                                +{formatarValor(diaria.adicional)}
                              </p>
                            </div>
                          )}
                          {diaria.desconto > 0 && (
                            <div>
                              <span className="text-gray-600">Desconto:</span>
                              <p className="font-semibold text-red-600">
                                -{formatarValor(diaria.desconto)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {diaria.data_pagamento && (
                          <p className="text-sm text-gray-600 mt-2">
                            💰 Pago em: {formatDateBR(diaria.data_pagamento)}
                          </p>
                        )}
                        
                        {diaria.observacoes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            💬 {diaria.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatarValor(diaria.valor_total)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

