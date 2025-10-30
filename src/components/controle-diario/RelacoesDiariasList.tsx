/**
 * Componente: Lista de Relações Diárias
 * Exibe as relações diárias com detalhes de presentes e ausentes
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, AlertTriangle, UserMinus, ChevronDown, ChevronUp, FileText, Loader2, RefreshCcw, Edit, Trash2 } from 'lucide-react';
import { listarRelacoesDiarias, deletarRelacaoDiaria } from '../../lib/controle-diario-api';
import { getStatusPresencaInfo, RelacaoDiariaCompleta } from '../../types/controle-diario';
import { formatDateBR } from '../../utils/date-format';
import { Button } from '../shared/Button';
import { toast } from '../../lib/toast-hooks';
import debugLogger from '../../utils/debug-logger';
import { supabase } from '../../lib/supabase';
import { DeleteRelacaoModal } from './DeleteRelacaoModal';
import { useNavigate } from 'react-router-dom';

export const RelacoesDiariasList: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [relacoes, setRelacoes] = useState<RelacaoDiariaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [relacaoParaExcluir, setRelacaoParaExcluir] = useState<RelacaoDiariaCompleta | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRelacoes();
  }, []);

  const loadRelacoes = async () => {
    try {
      setLoading(true);
      debugLogger.info('RelacoesDiariasList', 'Carregando relações diárias');
      
      // 1. Buscar dados da API
      const data = await listarRelacoesDiarias();
      
      // 2. Buscar dados salvos localmente
      let localData: RelacaoDiariaCompleta[] = [];
      try {
        const localDataStr = localStorage.getItem('worldpav.relacoes_diarias');
        if (localDataStr) {
          const parsedData = JSON.parse(localDataStr);
          if (Array.isArray(parsedData)) {
            // Mapear equipe_id para nome
            const getEquipeNome = (equipeId: string | null | undefined): string | undefined => {
              if (!equipeId) return undefined;
              const equipesMap: Record<string, string> = {
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 'Equipe A',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12': 'Equipe B',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13': 'Equipe de Apoio'
              };
              return equipesMap[equipeId];
            };

            // Buscar dados dos colaboradores para os dados locais
            localData = await Promise.all(parsedData.map(async (item: any) => {
              // Buscar colaboradores presentes
              const registrosPresentes = await Promise.all(
                (item.colaboradores_presentes || []).map(async (colabId: string) => {
                  try {
                    const { data: colaborador } = await supabase
                      .from('colaboradores')
                      .select('name, position')
                      .eq('id', colabId)
                      .single();
                    
                    return {
                      id: `local_presente_${colabId}`,
                      relacao_diaria_id: item.id,
                      colaborador_id: colabId,
                      colaborador_nome: colaborador?.name || 'Nome não informado',
                      colaborador_funcao: colaborador?.position || 'Função não informada',
                      status: 'presente' as const,
                      created_at: item.created_at,
                      updated_at: item.created_at
                    };
                  } catch (error) {
                    return {
                      id: `local_presente_${colabId}`,
                      relacao_diaria_id: item.id,
                      colaborador_id: colabId,
                      colaborador_nome: 'Nome não informado',
                      colaborador_funcao: 'Função não informada',
                      status: 'presente' as const,
                      created_at: item.created_at,
                      updated_at: item.created_at
                    };
                  }
                })
              );

              // Buscar colaboradores ausentes
              const registrosAusentes = await Promise.all(
                (item.ausencias || []).map(async (ausencia: any) => {
                  try {
                    const { data: colaborador } = await supabase
                      .from('colaboradores')
                      .select('name, position')
                      .eq('id', ausencia.colaborador_id)
                      .single();
                    
                    const equipeDestinoNome = ausencia.equipe_destino_id 
                      ? getEquipeNome(ausencia.equipe_destino_id)
                      : undefined;

                    return {
                      id: `local_ausente_${ausencia.colaborador_id}`,
                      relacao_diaria_id: item.id,
                      colaborador_id: ausencia.colaborador_id,
                      colaborador_nome: colaborador?.name || 'Nome não informado',
                      colaborador_funcao: colaborador?.position || 'Função não informada',
                      status: ausencia.status || 'falta',
                      equipe_destino_id: ausencia.equipe_destino_id,
                      equipe_destino_nome: equipeDestinoNome,
                      observacoes: ausencia.observacoes,
                      created_at: item.created_at,
                      updated_at: item.created_at
                    };
                  } catch (error) {
                    return {
                      id: `local_ausente_${ausencia.colaborador_id}`,
                      relacao_diaria_id: item.id,
                      colaborador_id: ausencia.colaborador_id,
                      colaborador_nome: 'Nome não informado',
                      colaborador_funcao: 'Função não informada',
                      status: ausencia.status || 'falta',
                      equipe_destino_id: ausencia.equipe_destino_id,
                      equipe_destino_nome: ausencia.equipe_destino_id ? getEquipeNome(ausencia.equipe_destino_id) : undefined,
                      observacoes: ausencia.observacoes,
                      created_at: item.created_at,
                      updated_at: item.created_at
                    };
                  }
                })
              );

              return {
                ...item,
                equipe_nome: getEquipeNome(item.equipe_id),
                registros: [...registrosPresentes, ...registrosAusentes],
                total_presentes: registrosPresentes.length,
                total_ausencias: registrosAusentes.length
              };
            }));

            debugLogger.success('RelacoesDiariasList', `${localData.length} relações encontradas no localStorage`);
          }
        }
      } catch (localError) {
        debugLogger.error('RelacoesDiariasList', 'Erro ao carregar dados locais', localError);
      }
      
      // 3. Combinar dados
      const combinedData = [...data, ...localData];
      setRelacoes(combinedData);
      debugLogger.success('RelacoesDiariasList', `Total de ${combinedData.length} relações carregadas`);
    } catch (error) {
      debugLogger.error('RelacoesDiariasList', 'Erro ao carregar relações', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (relacao: RelacaoDiariaCompleta, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/controle-diario/editar/${relacao.id}`);
  };

  const handleDeleteClick = (relacao: RelacaoDiariaCompleta, e: React.MouseEvent) => {
    e.stopPropagation();
    setRelacaoParaExcluir(relacao);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!relacaoParaExcluir) return;

    try {
      setDeleting(true);
      
      // Verificar se é relação local (salva no localStorage)
      if (relacaoParaExcluir.id.startsWith('local_')) {
        // Remover do localStorage
        const localDataStr = localStorage.getItem('worldpav.relacoes_diarias');
        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          const filtered = localData.filter((item: any) => item.id !== relacaoParaExcluir.id);
          localStorage.setItem('worldpav.relacoes_diarias', JSON.stringify(filtered));
        }
        toast.success('Relação diária excluída com sucesso!');
      } else {
        // Excluir do banco de dados
        await deletarRelacaoDiaria(relacaoParaExcluir.id);
        toast.success('Relação diária excluída com sucesso!');
      }

      // Recarregar lista
      await loadRelacoes();
      setDeleteModalOpen(false);
      setRelacaoParaExcluir(null);
    } catch (error: any) {
      console.error('Erro ao excluir relação:', error);
      toast.error(error.message || 'Erro ao excluir relação diária');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Carregando relações...</p>
      </div>
    );
  }

  if (relacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma relação diária registrada
        </h3>
        <p className="text-gray-600 mb-6">
          Clique em "+ Nova Relação" para criar a primeira relação diária
        </p>
        
        <Button 
          onClick={loadRelacoes} 
          variant="outline" 
          className="mx-auto flex items-center space-x-2"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Atualizar</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Relações Diárias Registradas</h3>
        <Button 
          onClick={loadRelacoes} 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Atualizar</span>
        </Button>
      </div>
      
      {relacoes.map((relacao) => {
        const isExpanded = expandedId === relacao.id;
        const presentes = relacao.registros.filter((r) => r.status === 'presente');
        const ausentes = relacao.registros.filter((r) => r.status !== 'presente');
        
        // Debug: verificar se há inconsistência entre total_presentes e registros
        if (relacao.total_presentes > 0 && presentes.length === 0) {
          console.warn(`⚠️ Inconsistência detectada na relação ${relacao.id}:`, {
            total_presentes: relacao.total_presentes,
            registros_encontrados: relacao.registros.length,
            registros_presentes: presentes.length,
            todos_registros: relacao.registros
          });
        }

        return (
          <div
            key={relacao.id}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            {/* Header do Card */}
            <div
              className="p-4 hover:bg-gray-50 transition-colors"
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

                <div className="flex items-center space-x-4">
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

                  {/* Botões de Ação */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleEdit(relacao, e)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                      title="Editar relação"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(relacao, e)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                      title="Excluir relação"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => toggleExpand(relacao.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={isExpanded ? "Recolher" : "Expandir"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
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
                  {(ausentes.length > 0 || relacao.total_ausencias > 0) && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h5 className="text-md font-semibold text-gray-900">
                          Ausências Registradas ({ausentes.length || relacao.total_ausencias})
                        </h5>
                      </div>
                      {ausentes.length > 0 ? (
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
                      ) : (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Há {relacao.total_ausencias} ausência(s) registrada(s), mas os detalhes não foram encontrados no banco de dados.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de Exclusão */}
      <DeleteRelacaoModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRelacaoParaExcluir(null);
        }}
        onConfirm={handleDeleteConfirm}
        relacaoData={relacaoParaExcluir ? formatDateBR(relacaoParaExcluir.data) : ''}
        equipeNome={relacaoParaExcluir?.equipe_nome}
        loading={deleting}
      />
    </div>
  );
};






