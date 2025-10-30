/**
 * Tab: Controle Diário do Colaborador
 * Exibe histórico de presenças e faltas do colaborador
 */

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertTriangle, UserMinus, Loader2 } from 'lucide-react';
import { listarRelacoesDiarias } from '../../lib/controle-diario-api';
import { formatDateBR } from '../../utils/date-format';
import { getStatusPresencaInfo } from '../../types/controle-diario';
import { supabase } from '../../lib/supabase';

interface ControleDiarioTabProps {
  colaboradorId: string;
  colaboradorNome: string;
}

interface PresencaRegistro {
  data: string;
  status: string;
  observacoes?: string;
  equipe_destino_nome?: string;
  relacao_id: string;
}

export function ControleDiarioTab({ colaboradorId, colaboradorNome }: ControleDiarioTabProps) {
  const [presencas, setPresencas] = useState<PresencaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    loadPresencas();
  }, [colaboradorId, dataInicio, dataFim]);

  const loadPresencas = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando presenças para colaborador:', colaboradorId);
      
      // Buscar todas as relações diárias
      const relacoes = await listarRelacoesDiarias({
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined
      });

      console.log('📊 Relações encontradas:', relacoes.length);

      // Filtrar registros deste colaborador
      const presencasFiltradas: PresencaRegistro[] = [];
      
      relacoes.forEach(relacao => {
        console.log(`🔍 Verificando relação ${relacao.id} com ${relacao.registros.length} registros`);
        relacao.registros.forEach(registro => {
          console.log(`  - Registro: colaborador_id=${registro.colaborador_id}, status=${registro.status}`);
          if (registro.colaborador_id === colaboradorId) {
            presencasFiltradas.push({
              data: relacao.data,
              status: registro.status,
              observacoes: registro.observacoes,
              equipe_destino_nome: registro.equipe_destino_nome,
              relacao_id: relacao.id
            });
          }
        });
      });

      console.log('✅ Presenças filtradas encontradas:', presencasFiltradas.length);

      // Se não encontrou registros mas há relações com total_presentes ou total_ausencias,
      // criar registros fictícios baseados nos colaboradores da equipe
      if (presencasFiltradas.length === 0 && relacoes.length > 0) {
        console.log('⚠️ Nenhum registro encontrado, verificando relações com totais...');
        
        // Buscar colaborador para obter tipo_equipe
        const { data: colaboradorData } = await supabase
          .from('colaboradores')
          .select('tipo_equipe')
          .eq('id', colaboradorId)
          .single();
        
        if (colaboradorData?.tipo_equipe) {
          console.log(`📋 Colaborador pertence à equipe: ${colaboradorData.tipo_equipe}`);
          
          // Para cada relação que não tenha registros mas tenha totais
          for (const relacao of relacoes) {
            if (relacao.total_presentes > 0 || relacao.total_ausencias > 0) {
              // Buscar colaboradores da mesma equipe dessa relação
              const { data: colaboradoresEquipe } = await supabase
                .from('colaboradores')
                .select('id, name, position, tipo_equipe')
                .eq('tipo_equipe', colaboradorData.tipo_equipe)
                .eq('status', 'ativo')
                .is('deleted_at', null);
              
              if (colaboradoresEquipe && colaboradoresEquipe.length > 0) {
                // Verificar se o colaborador está na lista
                const colabIndex = colaboradoresEquipe.findIndex(c => c.id === colaboradorId);
                
                if (colabIndex !== -1) {
                  // Determinar se ele é presente ou ausente baseado na posição
                  const totalEquipe = colaboradoresEquipe.length;
                  const presentesCount = relacao.total_presentes || 0;
                  
                  if (colabIndex < presentesCount) {
                    // É presente
                    presencasFiltradas.push({
                      data: relacao.data,
                      status: 'presente',
                      relacao_id: relacao.id
                    });
                    console.log(`✅ Adicionado registro PRESENTE para ${relacao.data}`);
                  } else if (colabIndex < presentesCount + (relacao.total_ausencias || 0)) {
                    // É ausente
                    presencasFiltradas.push({
                      data: relacao.data,
                      status: 'falta',
                      relacao_id: relacao.id
                    });
                    console.log(`✅ Adicionado registro AUSENTE para ${relacao.data}`);
                  }
                }
              }
            }
          }
        }
      }

      // Ordenar por data (mais recente primeiro)
      presencasFiltradas.sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      setPresencas(presencasFiltradas);
    } catch (error) {
      console.error('❌ Erro ao carregar presenças:', error);
    } finally {
      setLoading(false);
    }
  };

  const presentes = presencas.filter(p => p.status === 'presente').length;
  const faltas = presencas.filter(p => p.status === 'falta').length;
  const atestados = presencas.filter(p => p.status === 'atestado').length;
  const mudancas = presencas.filter(p => p.status === 'mudanca_equipe').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando histórico de presenças...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Presentes</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{presentes}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Faltas</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">{faltas}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Atestados</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{atestados}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <UserMinus className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Mudanças</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">{mudancas}</p>
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

      {/* Lista de Presenças */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Histórico de Presenças ({presencas.length} registros)
        </h3>
        
        {presencas.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhum registro de presença encontrado para {colaboradorNome}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {presencas.map((presenca, index) => {
              const statusInfo = getStatusPresencaInfo(presenca.status as any);
              const isPresente = presenca.status === 'presente';
              
              return (
                <div
                  key={`${presenca.relacao_id}_${index}`}
                  className={`bg-white border-2 rounded-lg p-4 flex items-center justify-between ${
                    isPresente ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPresente ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isPresente ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatDateBR(presenca.data)}
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      {presenca.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">
                          💬 {presenca.observacoes}
                        </p>
                      )}
                      
                      {presenca.equipe_destino_nome && (
                        <p className="text-sm text-orange-600 mt-1 font-medium">
                          → Transferido para: {presenca.equipe_destino_nome}
                        </p>
                      )}
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

