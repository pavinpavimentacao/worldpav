import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { ExportProgramacaoPDF } from '../../components/programacao/ExportProgramacaoPDF';
import { Plus, Search, Calendar, MapPin, Users, Truck, FileText, Building2, Settings, CheckCircle, Edit, Clock, Loader2, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateBR } from '../../utils/date-format';
import type { ProgramacaoPavimentacao } from '../../types/programacao-pavimentacao';
import { ConfirmarObraModal, DadosConfirmacaoObra } from '../../components/programacao/ConfirmarObraModal';
import { createRelatorioDiario, finalizarRua, criarFaturamentoRua } from '../../lib/relatoriosDiariosApi';
import { getEquipeByPrefixo } from '../../lib/equipesApi';
import { toast } from '../../lib/toast-hooks';
import { ProgramacaoPavimentacaoAPI } from '../../lib/programacao-pavimentacao-api';

const ProgramacaoPavimentacaoList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Estados para modal de confirmação
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [programacaoSelecionada, setProgramacaoSelecionada] = useState<ProgramacaoPavimentacao | null>(null);

  // Estados para modal de detalhes
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [programacaoDetalhes, setProgramacaoDetalhes] = useState<ProgramacaoPavimentacao | null>(null);

  // Estados para modal de exclusão
  const [showExcluirModal, setShowExcluirModal] = useState(false);
  const [programacaoExcluir, setProgramacaoExcluir] = useState<ProgramacaoPavimentacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Estados para dados reais
  const [programacoes, setProgramacoes] = useState<ProgramacaoPavimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar programações do banco de dados
  useEffect(() => {
    const carregarProgramacoes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar programações sem filtro de company_id por enquanto
        const programacoesData = await ProgramacaoPavimentacaoAPI.getAll();
        setProgramacoes(programacoesData);
      } catch (err) {
        console.error('Erro ao carregar programações:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        toast.error('Erro ao carregar programações');
      } finally {
        setLoading(false);
      }
    };

    carregarProgramacoes();
  }, []);

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

  const handleAbrirDetalhes = (programacao: ProgramacaoPavimentacao) => {
    setProgramacaoDetalhes(programacao);
    setShowDetalhesModal(true);
  };

  const handleAbrirExclusao = (programacao: ProgramacaoPavimentacao) => {
    setProgramacaoExcluir(programacao);
    setShowExcluirModal(true);
  };

  const handleExcluirProgramacao = async () => {
    if (!programacaoExcluir) return;

    try {
      setExcluindo(true);
      
      // Chamar API para excluir programação
      await ProgramacaoPavimentacaoAPI.delete(programacaoExcluir.id);
      
      // Atualizar lista local removendo a programação excluída
      setProgramacoes(prev => prev.filter(p => p.id !== programacaoExcluir.id));
      
      toast.success('Programação excluída com sucesso!');
      
      // Fechar modal
      setShowExcluirModal(false);
      setProgramacaoExcluir(null);
      
    } catch (error) {
      console.error('Erro ao excluir programação:', error);
      toast.error('Erro ao excluir programação. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  };

  const handleConfirmarObra = async (dados: DadosConfirmacaoObra) => {
    if (!programacaoSelecionada) return;

    try {
      console.log('=== CONFIRMAÇÃO DE OBRA ===');
      console.log('Programação:', programacaoSelecionada);
      console.log('Dados da execução:', dados);
      
      // Calcular espessura
      const espessura = (dados.toneladas_aplicadas / dados.metragem_feita) * 4.17;
      console.log('Espessura calculada:', espessura.toFixed(2), 'cm');

      // Verificar se temos os IDs necessários
      if (!programacaoSelecionada.obra_id || !programacaoSelecionada.rua_id) {
        throw new Error('IDs de obra e/ou rua não encontrados na programação. Por favor, tente novamente.');
      }

      // ✅ BUSCAR ID DA EQUIPE PELO PREFIXO
      let equipeId: string | undefined;
      if (programacaoSelecionada.prefixo_equipe) {
        try {
          const companyId = '39cf8b61-6737-4aa5-af3f-51fba9f12345'; // TODO: pegar do contexto
          const equipe = await getEquipeByPrefixo(programacaoSelecionada.prefixo_equipe, companyId);
          if (equipe) {
            equipeId = equipe.id;
            console.log('✅ Equipe encontrada:', equipe.name, 'ID:', equipeId);
          } else {
            console.warn('⚠️ Equipe não encontrada para o prefixo:', programacaoSelecionada.prefixo_equipe);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar equipe:', error);
          // Não impedir a confirmação, apenas continuar sem equipe_id
        }
      }

      // 1. CRIAR RELATÓRIO DIÁRIO
      const relatorio = await createRelatorioDiario({
        cliente_id: programacaoSelecionada.cliente_id,
        obra_id: programacaoSelecionada.obra_id, // ✅ ID real da obra
        rua_id: programacaoSelecionada.rua_id, // ✅ ID real da rua
        equipe_id: equipeId, // ✅ ID real da equipe encontrada pelo prefixo
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

      console.log('✅ Relatório criado:', relatorio.id);

      // 2. FINALIZAR RUA E CRIAR FATURAMENTO
      await finalizarRua(programacaoSelecionada.rua_id, relatorio.id, dados.data_fim, dados.metragem_feita, dados.toneladas_aplicadas);
      await criarFaturamentoRua(programacaoSelecionada.obra_id, programacaoSelecionada.rua_id, dados.metragem_feita, 25);
      
      // 3. ATUALIZAR STATUS DA PROGRAMAÇÃO NO BANCO
      const programacaoAtualizada = await ProgramacaoPavimentacaoAPI.confirmar(
        programacaoSelecionada.id, 
        relatorio.id
      );

      // 4. ATUALIZAR ESTADO LOCAL
      setProgramacoes(programacoes.map(p => 
        p.id === programacaoSelecionada.id 
          ? programacaoAtualizada
          : p
      ));
      
      toast.success(`Rua finalizada! Relatório ${relatorio.id} criado e salvo com sucesso.`);
      
      // 5. NAVEGAR PARA O RELATÓRIO
      setTimeout(() => {
        navigate(`/relatorios-diarios/${relatorio.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao confirmar obra:', error);
      toast.error(error.message || 'Erro ao confirmar obra');
      throw error;
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

        {/* Estado de Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Carregando programações...
            </h3>
            <p className="text-sm text-gray-500">
              Aguarde enquanto buscamos os dados do banco
            </p>
          </div>
        )}

        {/* Estado de Erro */}
        {error && !loading && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-12 text-center">
            <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Erro ao carregar programações
            </h3>
            <p className="text-sm text-red-600 mb-6">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Quadro Branco - Programações */}
        {!loading && !error && programacoesAgrupadas.length === 0 ? (
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
        ) : !loading && !error ? (
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
                      <div className="flex gap-2 pt-4 border-t-2 border-gray-200">
                        {/* Botão Ver Detalhes - sempre visível */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirDetalhes(prog)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>

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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAbrirExclusao(prog)}
                              className="flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAbrirExclusao(prog)}
                              className="flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
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
        ) : null}

        {/* Modal de Detalhes da Programação */}
        {showDetalhesModal && programacaoDetalhes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Detalhes da Programação</h2>
                      <p className="text-gray-600">Visualização completa dos dados da programação</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetalhesModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Informações da Obra
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Cliente</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.cliente_nome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Obra</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.obra}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rua</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.rua}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Data e Equipe
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Data da Programação</p>
                          <p className="font-semibold text-gray-900">{formatDateBR(programacaoDetalhes.data)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Horário de Início</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.horario_inicio || 'Não especificado'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Equipe</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.prefixo_equipe}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        Especificações Técnicas
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Metragem Prevista</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.metragem_prevista} m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantidade de Toneladas</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.quantidade_toneladas} ton</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Faixa a Realizar</p>
                          <p className="font-semibold text-gray-900">{programacaoDetalhes.faixa_realizar}</p>
                        </div>
                        {programacaoDetalhes.espessura_media_solicitada && (
                          <div>
                            <p className="text-sm text-gray-500">Espessura Média Solicitada</p>
                            <p className="font-semibold text-gray-900">{programacaoDetalhes.espessura_media_solicitada} cm</p>
                          </div>
                        )}
                        {programacaoDetalhes.espessura && (
                          <div>
                            <p className="text-sm text-gray-500">Espessura</p>
                            <p className="font-semibold text-gray-900">{programacaoDetalhes.espessura} cm</p>
                          </div>
                        )}
                        {programacaoDetalhes.tipo_servico && (
                          <div>
                            <p className="text-sm text-gray-500">Tipo de Serviço</p>
                            <p className="font-semibold text-gray-900">{programacaoDetalhes.tipo_servico}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-orange-600" />
                        Maquinários Alocados
                      </h3>
                      <div className="space-y-2">
                        {programacaoDetalhes.maquinarios_nomes && programacaoDetalhes.maquinarios_nomes.length > 0 ? (
                          programacaoDetalhes.maquinarios_nomes.map((maq, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <Truck className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{maq}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Nenhum maquinário alocado</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status e Observações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Status da Programação
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Status Atual</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            programacaoDetalhes.confirmada 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {programacaoDetalhes.confirmada ? 'Confirmada' : 'Pendente'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data de Criação</p>
                          <p className="font-semibold text-gray-900">
                            {programacaoDetalhes.created_at ? new Date(programacaoDetalhes.created_at).toLocaleString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Última Atualização</p>
                          <p className="font-semibold text-gray-900">
                            {programacaoDetalhes.updated_at ? new Date(programacaoDetalhes.updated_at).toLocaleString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-600" />
                        Observações
                      </h3>
                      <div>
                        {programacaoDetalhes.observacoes ? (
                          <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                            {programacaoDetalhes.observacoes}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">Nenhuma observação registrada</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões do Modal */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetalhesModal(false)}
                  >
                    Fechar
                  </Button>
                  {!programacaoDetalhes.confirmada && (
                    <Button
                      onClick={() => {
                        setShowDetalhesModal(false);
                        navigate(`/programacao-pavimentacao/${programacaoDetalhes.id}/edit`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Programação
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showExcluirModal && programacaoExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
                    <p className="text-gray-600">Esta ação não pode ser desfeita</p>
                  </div>
                </div>

                {/* Conteúdo do Modal */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Tem certeza que deseja excluir a programação de <strong>{formatDateBR(programacaoExcluir.data)}</strong>?
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cliente:</span>
                      <span className="text-sm font-medium text-gray-900">{programacaoExcluir.cliente_nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Obra:</span>
                      <span className="text-sm font-medium text-gray-900">{programacaoExcluir.obra}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rua:</span>
                      <span className="text-sm font-medium text-gray-900">{programacaoExcluir.rua}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Equipe:</span>
                      <span className="text-sm font-medium text-gray-900">{programacaoExcluir.prefixo_equipe}</span>
                    </div>
                  </div>
                </div>

                {/* Botões do Modal */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowExcluirModal(false);
                      setProgramacaoExcluir(null);
                    }}
                    disabled={excluindo}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleExcluirProgramacao}
                    disabled={excluindo}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {excluindo ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sim, Excluir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
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

