import React, { useState, useMemo } from 'react';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { ExportProgramacaoPDF } from '../../components/programacao/ExportProgramacaoPDF';
import { Plus, Search, Calendar, MapPin, Users, Truck, FileText, Building2, Settings, CheckCircle, Edit, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockProgramacoesPavimentacao } from '../../mocks/programacao-pavimentacao-mock';
import { formatDateBR } from '../../utils/date-format';
import type { ProgramacaoPavimentacao } from '../../types/programacao-pavimentacao';
import { ConfirmarObraModal, DadosConfirmacaoObra } from '../../components/programacao/ConfirmarObraModal';
import { createRelatorioDiario, finalizarRua, criarFaturamentoRua } from '../../lib/relatoriosDiariosApi';
import { toast } from '../../lib/toast-hooks';
import { adicionarRelatorioDiario } from '../../mocks/relatorios-diarios-mock';

const ProgramacaoPavimentacaoList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Estados para modal de confirmação
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [programacaoSelecionada, setProgramacaoSelecionada] = useState<ProgramacaoPavimentacao | null>(null);

  // Dados mockados (com estado mutável)
  const [programacoes, setProgramacoes] = useState(mockProgramacoesPavimentacao);

  // Filtrar programações
  const programacoesFiltradas = useMemo(() => {
    return programacoes.filter((prog) => {
      const matchSearch =
        searchTerm === '' ||
        prog.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.obra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.rua.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.prefixo_equipe.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDate = selectedDate === '' || prog.data === selectedDate;

      return matchSearch && matchDate;
    });
  }, [programacoes, searchTerm, selectedDate]);

  // Agrupar por data
  const programacoesAgrupadas = useMemo(() => {
    const grupos: { [key: string]: ProgramacaoPavimentacao[] } = {};

    programacoesFiltradas.forEach((prog) => {
      if (!grupos[prog.data]) {
        grupos[prog.data] = [];
      }
      grupos[prog.data].push(prog);
    });

    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
  }, [programacoesFiltradas]);

  // Estatísticas
  const totalMetragem = useMemo(() => {
    return programacoesFiltradas.reduce((acc, prog) => acc + prog.metragem_prevista, 0);
  }, [programacoesFiltradas]);

  const totalToneladas = useMemo(() => {
    return programacoesFiltradas.reduce((acc, prog) => acc + prog.quantidade_toneladas, 0);
  }, [programacoesFiltradas]);

  const programacoesConfirmadas = useMemo(() => {
    return programacoesFiltradas.filter(p => p.confirmada).length;
  }, [programacoesFiltradas]);

  const programacoesPendentes = useMemo(() => {
    return programacoesFiltradas.filter(p => !p.confirmada).length;
  }, [programacoesFiltradas]);

  const handleAbrirConfirmacao = (programacao: ProgramacaoPavimentacao) => {
    setProgramacaoSelecionada(programacao);
    setShowConfirmarModal(true);
  };

  const handleConfirmarObra = async (dados: DadosConfirmacaoObra) => {
    if (!programacaoSelecionada) return;

    try {
      // MODO MOCK: Criar relatório diário efetivamente
      console.log('=== CONFIRMAÇÃO DE OBRA (MODO MOCK) ===');
      console.log('Programação:', programacaoSelecionada);
      console.log('Dados da execução:', dados);
      
      // Calcular espessura
      const espessura = (dados.toneladas_aplicadas / dados.metragem_feita) * 4.17;
      console.log('Espessura calculada:', espessura.toFixed(2), 'cm');

      // Simular processo
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 1. CRIAR RELATÓRIO DIÁRIO (salvar no mock)
      const relatorio = adicionarRelatorioDiario({
        cliente_id: programacaoSelecionada.cliente_id,
        cliente_nome: programacaoSelecionada.cliente_nome || 'Cliente',
        obra_id: `obra-${programacaoSelecionada.id}`,
        obra_nome: programacaoSelecionada.obra,
        rua_id: `rua-${programacaoSelecionada.id}`,
        rua_nome: programacaoSelecionada.rua,
        equipe_id: `equipe-${programacaoSelecionada.prefixo_equipe}`,
        equipe_nome: programacaoSelecionada.prefixo_equipe,
        equipe_is_terceira: false,
        data_inicio: programacaoSelecionada.data,
        data_fim: dados.data_fim,
        horario_inicio: programacaoSelecionada.horario_inicio || '07:00',
        horario_fim: dados.horario_fim,
        metragem_feita: dados.metragem_feita,
        toneladas_aplicadas: dados.toneladas_aplicadas,
        observacoes: dados.observacoes,
        maquinarios: programacaoSelecionada.maquinarios_nomes?.map((nome, index) => ({
          id: programacaoSelecionada.maquinarios[index],
          nome: nome,
          is_terceiro: false,
          parceiro_id: undefined,
          parceiro_nome: undefined,
        })) || [],
      });
      
      console.log('✅ Relatório criado e salvo:', relatorio.numero);
      console.log('✅ ID do relatório:', relatorio.id);
      console.log('✅ Rua finalizada:', programacaoSelecionada.rua);
      console.log('✅ Faturamento gerado: R$', (dados.metragem_feita * 25).toLocaleString('pt-BR'));
      
      if (dados.fotos_obra && dados.fotos_obra.length > 0) {
        console.log(`✅ ${dados.fotos_obra.length} foto(s) salva(s)`);
      }

      // 2. Atualizar status da programação para "confirmada"
      setProgramacoes(programacoes.map(p => 
        p.id === programacaoSelecionada.id 
          ? {
              ...p,
              status: 'confirmada' as const,
              confirmada: true,
              data_confirmacao: dados.data_fim,
              relatorio_diario_id: relatorio.id,
              updated_at: new Date().toISOString()
            }
          : p
      ));
      
      toast.success(`Rua finalizada! Relatório ${relatorio.numero} criado e salvo com sucesso.`);
      
      // TODO: Quando integrado com banco de dados real, descomentar:
      /*
      const relatorio = await createRelatorioDiario({
        cliente_id: programacaoSelecionada.cliente_id,
        obra_id: '[ID da obra]', // Buscar do banco
        rua_id: '[ID da rua]',     // Buscar do banco
        equipe_id: '[ID da equipe]', // Buscar do banco
        equipe_is_terceira: false,
        data_inicio: programacaoSelecionada.data,
        data_fim: dados.data_fim,
        horario_inicio: programacaoSelecionada.horario_inicio || '07:00',
        metragem_feita: dados.metragem_feita,
        toneladas_aplicadas: dados.toneladas_aplicadas,
        observacoes: dados.observacoes,
        maquinarios: programacaoSelecionada.maquinarios.map(maqId => ({
          id: maqId,
          is_terceiro: false,
          parceiro_id: undefined
        }))
      });

      await finalizarRua('[rua_id]', relatorio.id, dados.data_fim, dados.metragem_feita, dados.toneladas_aplicadas);
      await criarFaturamentoRua('[obra_id]', '[rua_id]', dados.metragem_feita, 25);
      
      // Atualizar status no banco
      await updateProgramacaoStatus(programacaoSelecionada.id, 'confirmada', relatorio.id);
      
      navigate(`/relatorios-diarios/${relatorio.id}`);
      */
      
      // Por enquanto, apenas mostrar mensagem de sucesso
      setTimeout(() => {
        navigate('/relatorios-diarios');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao confirmar obra:', error);
      throw new Error(error.message || 'Erro ao confirmar obra');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Header - Formato Quadro Branco */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Quadro de Programação
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Visualize e gerencie todas as programações da equipe
              </p>
            </div>
            <div className="flex gap-3">
              <ExportProgramacaoPDF programacoes={programacoesFiltradas} />
              <Button onClick={() => navigate('/programacao-pavimentacao/nova')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Programação
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas - Cards Modernos */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md border border-blue-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {programacoesFiltradas.length}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-green-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Confirmadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {programacoesConfirmadas}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-orange-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {programacoesPendentes}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-green-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Metragem Total</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalMetragem.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">m²</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md">
                <MapPin className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-orange-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Toneladas</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {totalToneladas.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">ton</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Truck className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-purple-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Equipes</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {new Set(programacoesFiltradas.map((p) => p.prefixo_equipe)).size}
                </p>
                <p className="text-xs text-gray-500">ativas</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente, obra, rua ou equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-300 focus:border-blue-500 rounded-lg"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-300 focus:border-blue-500 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Quadro Branco - Programações */}
        {programacoesAgrupadas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma programação encontrada
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchTerm || selectedDate
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira programação'}
            </p>
            {!searchTerm && !selectedDate && (
              <Button onClick={() => navigate('/programacao-pavimentacao/nova')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Programação
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {programacoesAgrupadas.map(([data, progs]) => (
              <div key={data}>
                {/* Header da Data - Estilo Quadro Branco */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl shadow-md px-6 py-4">
                  <div className="flex items-center gap-3 text-white">
                    <Calendar className="h-6 w-6" />
                    <h2 className="text-xl font-bold">
                      {formatDateBR(data)}
                    </h2>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {progs.length} {progs.length === 1 ? 'programação' : 'programações'}
                    </span>
                  </div>
                </div>

                {/* Cards das Programações - Formato Quadro */}
                <div className="bg-white rounded-b-xl shadow-lg border-2 border-gray-200 p-6 space-y-4">
                  {progs.map((prog) => (
                    <div 
                      key={prog.id} 
                      className={`bg-gradient-to-br rounded-xl border-2 p-6 hover:shadow-xl transition-all duration-300 ${
                        prog.confirmada 
                          ? 'from-green-50 to-emerald-50 border-green-400'
                          : 'from-white to-gray-50 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {/* Badge de Status */}
                      {prog.confirmada && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-green-600 text-white shadow-md">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Obra Confirmada
                          </span>
                          {prog.data_confirmacao && (
                            <span className="ml-2 text-xs text-green-700">
                              em {formatDateBR(prog.data_confirmacao)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Linha 1: Cliente e Obra */}
                      <div className="flex items-start gap-4 mb-4 pb-4 border-b-2 border-gray-200">
                        <div className={`p-3 rounded-lg ${prog.confirmada ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <Building2 className={`h-6 w-6 ${prog.confirmada ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                            Cliente / Obra
                          </p>
                          <p className="text-lg font-bold text-gray-900">{prog.cliente_nome}</p>
                          <p className="text-md text-gray-700 font-medium">{prog.obra}</p>
                        </div>
                      </div>

                      {/* Linha 2: Grade de Informações */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Rua */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Rua</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{prog.rua}</p>
                        </div>

                        {/* Prefixo da Equipe */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Equipe</p>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                            {prog.prefixo_equipe}
                          </span>
                        </div>

                        {/* Faixa */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-4 w-4 text-indigo-600" />
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Faixa</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{prog.faixa_realizar}</p>
                        </div>

                        {/* Espessura */}
                        {prog.espessura_media_solicitada && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Espessura</p>
                            <p className="text-sm font-bold text-gray-900">{prog.espessura_media_solicitada} cm</p>
                          </div>
                        )}
                      </div>

                      {/* Linha 3: Metragem e Toneladas - Destaque */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-700 uppercase tracking-wide font-semibold mb-1">
                                Metragem Prevista
                              </p>
                              <p className="text-3xl font-bold text-green-900">
                                {prog.metragem_prevista.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-sm text-green-700 font-medium">m²</p>
                            </div>
                            <MapPin className="h-12 w-12 text-green-600 opacity-20" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-orange-700 uppercase tracking-wide font-semibold mb-1">
                                Quantidade Programada
                              </p>
                              <p className="text-3xl font-bold text-orange-900">
                                {prog.quantidade_toneladas.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-sm text-orange-700 font-medium">toneladas</p>
                            </div>
                            <Truck className="h-12 w-12 text-orange-600 opacity-20" />
                          </div>
                        </div>
                      </div>

                      {/* Maquinários */}
                      {prog.maquinarios_nomes && prog.maquinarios_nomes.length > 0 && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Truck className="h-5 w-5 text-gray-600" />
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                              Maquinários Alocados
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {prog.maquinarios_nomes.map((maq, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-800 hover:border-blue-400 transition-colors"
                              >
                                <Truck className="h-4 w-4 mr-2 text-gray-600" />
                                {maq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      {prog.observacoes && (
                        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-4">
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-yellow-700 uppercase tracking-wide font-semibold mb-1">
                                Observações
                              </p>
                              <p className="text-sm text-gray-800">{prog.observacoes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                        {prog.confirmada ? (
                          // Se já confirmada, mostrar botão para ver relatório
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success('Obra já confirmada! Não pode ser editada.')}
                              disabled
                              className="flex-1 opacity-50 cursor-not-allowed"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => navigate(`/relatorios-diarios`)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              size="sm"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Relatório
                            </Button>
                          </>
                        ) : (
                          // Se não confirmada, mostrar botões normais
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/programacao-pavimentacao/${prog.id}/edit`)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleAbrirConfirmacao(prog)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Obra
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Confirmação de Obra */}
        {showConfirmarModal && programacaoSelecionada && (
          <ConfirmarObraModal
            isOpen={showConfirmarModal}
            onClose={() => {
              setShowConfirmarModal(false);
              setProgramacaoSelecionada(null);
            }}
            programacao={programacaoSelecionada}
            onConfirmar={handleConfirmarObra}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProgramacaoPavimentacaoList;

