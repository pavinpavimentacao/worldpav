/**
 * Tab: Diárias (Pagamentos)
 * Gestão de pagamento de diárias para colaboradores
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, DollarSign, Calendar, User, Edit2, Trash2, Check, X, TrendingUp, AlertCircle, Loader2, Filter, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/currency-input';
import { toast } from '../../lib/toast-hooks';
import {
  listarRegistrosDiarias,
  criarRegistroDiaria,
  atualizarRegistroDiaria,
  deletarRegistroDiaria,
} from '../../mocks/controle-diario-mock';
import { RegistroDiaria, formatarValor, calcularValorTotalDiaria } from '../../types/controle-diario';
import { formatDateBR } from '../../utils/date-format';
import { supabase } from '../../lib/supabase';
import { getCurrentCompanyId } from '../../lib/utils';
import { WORLDPAV_COMPANY_ID, getOrCreateDefaultCompany } from '../../lib/company-utils';
import { DatePicker } from '../ui/date-picker';
import { getPeriodoAtualDiarias } from '../../utils/periodo-calculo';
import { getEquipes } from '../../lib/equipesApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DiariasExporter, DiariaExportData } from '../../utils/diarias-exporter';

interface ColaboradorOption {
  id: string;
  nome: string;
  funcao: string;
  equipe_id?: string | null;
}

type FiltroDataDiarias = 'hoje' | 'ontem' | 'ultimos30' | 'periodo' | 'personalizado' | 'todos';

export const DiariasTab: React.FC = () => {
  const [diarias, setDiarias] = useState<RegistroDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [diariaSelecionada, setDiariaSelecionada] = useState<RegistroDiaria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);
  const [colaboradoresMap, setColaboradoresMap] = useState<Map<string, ColaboradorOption>>(new Map());
  const [companyId, setCompanyId] = useState<string>('');
  const [loadingColaboradores, setLoadingColaboradores] = useState(true);
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string }>>([]);
  
  // Filtros
  const [filtroData, setFiltroData] = useState<FiltroDataDiarias>('periodo');
  const [filtroEquipe, setFiltroEquipe] = useState<string>('');
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState<string>('');
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState<string>('');

  // Carregar companyId do usuário e equipes
  useEffect(() => {
    async function loadUserCompany() {
      try {
        // Usar diretamente o Company ID do WorldPav como padrão
        // Se necessário, pode fazer fallback para getCurrentCompanyId() no futuro
        const companyIdValue = await getOrCreateDefaultCompany();
        setCompanyId(companyIdValue);
        console.log('✅ Company ID carregado:', companyIdValue);
        
        // Carregar equipes
        const equipesData = await getEquipes(companyIdValue);
        setEquipes(equipesData.map(eq => ({ id: eq.id, name: eq.name })));
        
        // Inicializar período atual
        const periodo = getPeriodoAtualDiarias();
        setDataInicioPersonalizada(periodo.dataInicio);
        setDataFimPersonalizada(periodo.dataFim);
      } catch (error) {
        console.error('Erro ao carregar empresa do usuário:', error);
        // Em caso de erro, usar WorldPav como padrão
        setCompanyId(WORLDPAV_COMPANY_ID);
        console.log('⚠️ Usando WorldPav como Company ID padrão');
      }
    }

    loadUserCompany();
  }, []);

  // Carregar colaboradores quando companyId estiver disponível
  useEffect(() => {
    async function loadColaboradores() {
      if (!companyId) return;

      try {
        setLoadingColaboradores(true);
        const { data, error } = await supabase
          .from('colaboradores')
          .select('id, name, position, tipo_equipe, equipe_id, status')
          .eq('company_id', companyId)
          .eq('status', 'ativo')
          .is('deleted_at', null)
          .order('name', { ascending: true });

        if (error) throw error;

        // Adaptar dados do banco para o formato esperado
        // Incluir colaboradores de pavimentação e máquinas (equipe de massa)
        const colaboradoresAdaptados: ColaboradorOption[] = (data || [])
          .filter((c: any) => c.tipo_equipe === 'pavimentacao' || c.tipo_equipe === 'maquinas')
          .map((c: any) => ({
            id: c.id,
            nome: c.name || 'Nome não informado',
            funcao: c.position || 'Função não informada',
            equipe_id: c.equipe_id || null,
          }));

        setColaboradores(colaboradoresAdaptados);
        // Criar mapa para busca rápida
        const mapa = new Map<string, ColaboradorOption>();
        colaboradoresAdaptados.forEach(c => mapa.set(c.id, c));
        setColaboradoresMap(mapa);
        console.log(`✅ ${colaboradoresAdaptados.length} colaboradores de equipe de massa (pavimentação + máquinas) carregados`);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        toast.error('Erro ao carregar colaboradores');
      } finally {
        setLoadingColaboradores(false);
      }
    }

    loadColaboradores();
  }, [companyId]);

  useEffect(() => {
    async function loadDiarias() {
      try {
        setLoading(true);
        const data = await listarRegistrosDiarias();
        console.log('🔍 Diárias carregadas:', data.map(d => ({ 
          id: d.id, 
          colaborador: d.colaborador_nome, 
          status: d.status_pagamento,
          valor: d.valor_total 
        })));
        setDiarias(data);
      } catch (error) {
        console.error('Erro ao carregar diárias:', error);
        toast.error('Erro ao carregar diárias');
      } finally {
        setLoading(false);
      }
    }

    loadDiarias();
  }, []);

  // Form fields
  const [colaboradorId, setColaboradorId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valorUnitario, setValorUnitario] = useState('150.00');
  const [adicional, setAdicional] = useState('0');
  const [desconto, setDesconto] = useState('0');
  const [dataDiaria, setDataDiaria] = useState(new Date().toISOString().split('T')[0]);
  const [dataPagamento, setDataPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Filtros
  const [filtroColaborador, setFiltroColaborador] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago'>('todos');

  // Calcular período atual de diárias
  const periodoAtualDiarias = getPeriodoAtualDiarias();

  // Filtrar diárias
  const diariasFiltradas = useMemo(() => {
    let filtradas = [...diarias];

    // Filtro por colaborador (nome)
    if (filtroColaborador.trim()) {
      const nomeLower = filtroColaborador.toLowerCase();
      filtradas = filtradas.filter(diaria =>
        diaria.colaborador_nome?.toLowerCase().includes(nomeLower) ||
        diaria.colaborador_funcao?.toLowerCase().includes(nomeLower)
      );
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(diaria => diaria.status_pagamento === filtroStatus);
    }

    // Filtro por data
    if (filtroData !== 'todos') {
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      const ultimos30 = new Date(hoje);
      ultimos30.setDate(ultimos30.getDate() - 30);

      let dataInicio: string | null = null;
      let dataFim: string | null = null;

      switch (filtroData) {
        case 'hoje':
          dataInicio = hoje.toISOString().split('T')[0];
          dataFim = hoje.toISOString().split('T')[0];
          break;
        case 'ontem':
          dataInicio = ontem.toISOString().split('T')[0];
          dataFim = ontem.toISOString().split('T')[0];
          break;
        case 'ultimos30':
          dataInicio = ultimos30.toISOString().split('T')[0];
          dataFim = hoje.toISOString().split('T')[0];
          break;
        case 'periodo':
          // Usar período atual de diárias (21 a 20)
          dataInicio = periodoAtualDiarias.dataInicio;
          dataFim = periodoAtualDiarias.dataFim;
          break;
        case 'personalizado':
          if (dataInicioPersonalizada && dataFimPersonalizada) {
            dataInicio = dataInicioPersonalizada;
            dataFim = dataFimPersonalizada;
          }
          break;
      }

      if (dataInicio && dataFim) {
        filtradas = filtradas.filter(diaria => {
          const dataDiaria = diaria.data_diaria;
          return dataDiaria >= dataInicio! && dataDiaria <= dataFim!;
        });
      }
    }

    // Filtro por equipe
    if (filtroEquipe) {
      filtradas = filtradas.filter(diaria => {
        const colaborador = colaboradoresMap.get(diaria.colaborador_id);
        return colaborador?.equipe_id === filtroEquipe;
      });
    }

    return filtradas;
  }, [diarias, filtroColaborador, filtroStatus, filtroData, filtroEquipe, dataInicioPersonalizada, dataFimPersonalizada, periodoAtualDiarias, colaboradoresMap]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const totalDiarias = diariasFiltradas.reduce((sum, d) => sum + d.quantidade, 0);
    const valorTotal = diariasFiltradas.reduce((sum, d) => sum + d.valor_total, 0);
    const pendentes = diariasFiltradas.filter((d) => d.status_pagamento === 'pendente').length;
    const valorPendente = diariasFiltradas
      .filter((d) => d.status_pagamento === 'pendente')
      .reduce((sum, d) => sum + d.valor_total, 0);

    return { totalDiarias, valorTotal, pendentes, valorPendente };
  }, [diariasFiltradas]);

  const limparFormulario = () => {
    setColaboradorId('');
    setQuantidade('1');
    setValorUnitario('150.00');
    setAdicional('0');
    setDesconto('0');
    setDataDiaria(new Date().toISOString().split('T')[0]);
    setDataPagamento('');
    setObservacoes('');
  };

  const handleOpenModal = () => {
    limparFormulario();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const qtd = parseInt(quantidade);
      const valorUnit = parseFloat(valorUnitario);
      const adic = parseFloat(adicional);
      const desc = parseFloat(desconto);

      if (isNaN(qtd) || qtd <= 0) {
        toast.error('Quantidade inválida');
        setIsSubmitting(false);
        return;
      }

      if (isNaN(valorUnit) || valorUnit <= 0) {
        toast.error('Valor unitário inválido');
        setIsSubmitting(false);
        return;
      }

      const colaborador = colaboradores.find((c) => c.id === colaboradorId);

      const novaDiaria = await criarRegistroDiaria({
        colaborador_id: colaboradorId,
        quantidade: qtd,
        valor_unitario: valorUnit,
        adicional: adic,
        desconto: desc,
        data_diaria: dataDiaria,
        data_pagamento: dataPagamento || undefined,
        observacoes: observacoes.trim() || undefined,
      });

      // Adicionar nome e função do colaborador
      novaDiaria.colaborador_nome = colaborador?.nome;
      novaDiaria.colaborador_funcao = colaborador?.funcao;

      setDiarias([novaDiaria, ...diarias]);
      toast.success('Diária registrada com sucesso!');
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar diária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcarPago = async (diaria: RegistroDiaria) => {
    try {
      console.log('🔍 [handleMarcarPago] Iniciando marcação como pago para:', diaria);
      
      const atualizada = await atualizarRegistroDiaria(diaria.id, {
        status_pagamento: 'pago',
        data_pagamento: new Date().toISOString().split('T')[0],
      });

      console.log('✅ [handleMarcarPago] Diária atualizada:', atualizada);

      if (atualizada) {
        setDiarias((prev) => prev.map((d) => (d.id === diaria.id ? atualizada : d)));
        toast.success('Diária marcada como paga!');
      }
    } catch (error: any) {
      console.error('❌ [handleMarcarPago] Erro ao marcar como pago:', error);
      toast.error(`Erro ao marcar diária como paga: ${error.message}`);
    }
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este registro de diária?')) {
      try {
        const sucesso = await deletarRegistroDiaria(id);
        if (sucesso) {
          setDiarias((prev) => prev.filter((d) => d.id !== id));
          toast.success('Diária excluída com sucesso!');
        }
      } catch (error: any) {
        toast.error('Erro ao excluir diária');
      }
    }
  };

  const valorTotalCalculado = useMemo(() => {
    const qtd = parseInt(quantidade) || 0;
    const valorUnit = parseFloat(valorUnitario) || 0;
    const adic = parseFloat(adicional) || 0;
    const desc = parseFloat(desconto) || 0;
    return calcularValorTotalDiaria(qtd, valorUnit, adic, desc);
  }, [quantidade, valorUnitario, adicional, desconto]);

  const handleExportExcel = () => {
    try {
      if (diariasFiltradas.length === 0) {
        toast.error('Nenhuma diária para exportar');
        return;
      }

      const dadosExport: DiariaExportData[] = diariasFiltradas.map((diaria) => ({
        id: diaria.id,
        colaborador_nome: diaria.colaborador_nome || 'Nome não informado',
        colaborador_funcao: diaria.colaborador_funcao,
        quantidade: diaria.quantidade,
        valor_unitario: diaria.valor_unitario,
        adicional: diaria.adicional,
        desconto: diaria.desconto,
        valor_total: diaria.valor_total,
        data_diaria: diaria.data_diaria,
        data_pagamento: diaria.data_pagamento,
        status_pagamento: diaria.status_pagamento,
        observacoes: diaria.observacoes,
        created_at: diaria.created_at,
      }));

      const periodo = filtroData === 'periodo' 
        ? periodoAtualDiarias 
        : filtroData === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada
        ? { dataInicio: dataInicioPersonalizada, dataFim: dataFimPersonalizada }
        : undefined;

      DiariasExporter.exportToExcel(dadosExport, {
        periodo,
        filtros: {
          nome: filtroColaborador || undefined,
          equipe: filtroEquipe || undefined,
          status: filtroStatus !== 'todos' ? filtroStatus : undefined,
        },
      });

      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel. Tente novamente.');
    }
  };

  const handleExportPDF = () => {
    try {
      if (diariasFiltradas.length === 0) {
        toast.error('Nenhuma diária para exportar');
        return;
      }

      const dadosExport: DiariaExportData[] = diariasFiltradas.map((diaria) => ({
        id: diaria.id,
        colaborador_nome: diaria.colaborador_nome || 'Nome não informado',
        colaborador_funcao: diaria.colaborador_funcao,
        quantidade: diaria.quantidade,
        valor_unitario: diaria.valor_unitario,
        adicional: diaria.adicional,
        desconto: diaria.desconto,
        valor_total: diaria.valor_total,
        data_diaria: diaria.data_diaria,
        data_pagamento: diaria.data_pagamento,
        status_pagamento: diaria.status_pagamento,
        observacoes: diaria.observacoes,
        created_at: diaria.created_at,
      }));

      const periodo = filtroData === 'periodo' 
        ? periodoAtualDiarias 
        : filtroData === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada
        ? { dataInicio: dataInicioPersonalizada, dataFim: dataFimPersonalizada }
        : undefined;

      DiariasExporter.exportToPDF(dadosExport, {
        periodo,
        filtros: {
          nome: filtroColaborador || undefined,
          equipe: filtroEquipe || undefined,
          status: filtroStatus !== 'todos' ? filtroStatus : undefined,
        },
      });

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando diárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pagamento de Diárias</h2>
          <p className="text-gray-600 mt-1">Gestão financeira de diárias por colaborador</p>
        </div>
        <div className="flex items-center gap-2">
          {diariasFiltradas.length > 0 && (
            <>
              <Button 
                onClick={handleExportExcel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel</span>
              </Button>
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar PDF</span>
              </Button>
            </>
          )}
          <Button onClick={handleOpenModal} className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Adicionar Diária</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total de Diárias</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalDiarias}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">{formatarValor(estatisticas.valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.pendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Pendente</p>
              <p className="text-xl font-bold text-gray-900">{formatarValor(estatisticas.valorPendente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          <button
            onClick={() => {
              setFiltroColaborador('');
              setFiltroStatus('todos');
              setFiltroData('periodo');
              setFiltroEquipe('');
              const periodo = getPeriodoAtualDiarias();
              setDataInicioPersonalizada(periodo.dataInicio);
              setDataFimPersonalizada(periodo.dataFim);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={filtroData}
              onChange={(e) => {
                const tipo = e.target.value as FiltroDataDiarias;
                setFiltroData(tipo);
                if (tipo === 'periodo') {
                  const periodo = getPeriodoAtualDiarias();
                  setDataInicioPersonalizada(periodo.dataInicio);
                  setDataFimPersonalizada(periodo.dataFim);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="periodo">Período Atual (21 a 20)</option>
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="ultimos30">Últimos 30 dias</option>
              <option value="personalizado">Personalizado</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {/* Data Personalizada - Início */}
          {filtroData === 'personalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <DatePicker
                value={dataInicioPersonalizada}
                onChange={setDataInicioPersonalizada}
                label=""
                className="text-sm"
              />
            </div>
          )}

          {/* Data Personalizada - Fim */}
          {filtroData === 'personalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <DatePicker
                value={dataFimPersonalizada}
                onChange={setDataFimPersonalizada}
                label=""
                className="text-sm"
              />
            </div>
          )}

          {/* Filtro por Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Colaborador
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filtroColaborador}
                onChange={(e) => setFiltroColaborador(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filtro por Equipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipe
            </label>
            <select
              value={filtroEquipe}
              onChange={(e) => setFiltroEquipe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todas as equipes</option>
              {equipes.map(equipe => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagos</option>
            </select>
          </div>
        </div>

        {/* Mostrar período atual quando filtro for "periodo" */}
        {filtroData === 'periodo' && (
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="font-medium">Período atual:</span> {format(new Date(periodoAtualDiarias.dataInicio + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })} até {format(new Date(periodoAtualDiarias.dataFim + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}
      </div>

      {/* Lista de Diárias */}
      <div className="space-y-3">
        {diariasFiltradas.map((diaria) => (
          <div
            key={diaria.id}
            className={`
              bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md
              ${diaria.status_pagamento === 'pago' ? 'border-green-200 bg-green-50' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{diaria.colaborador_nome}</h3>
                    <span
                      className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${
                          diaria.status_pagamento === 'pago'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      `}
                    >
                      {diaria.status_pagamento === 'pago' ? '✓ Pago' : '⏳ Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{diaria.colaborador_funcao}</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Quantidade</p>
                      <p className="font-semibold text-gray-900">{diaria.quantidade}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor Unitário</p>
                      <p className="font-semibold text-gray-900">{formatarValor(diaria.valor_unitario)}</p>
                    </div>
                    {diaria.adicional > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Adicional</p>
                        <p className="font-semibold text-green-600">+{formatarValor(diaria.adicional)}</p>
                      </div>
                    )}
                    {diaria.desconto > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Desconto</p>
                        <p className="font-semibold text-red-600">-{formatarValor(diaria.desconto)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Valor Total</p>
                      <p className="font-bold text-blue-600 text-lg">{formatarValor(diaria.valor_total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Diária: {formatDateBR(diaria.data_diaria)}
                    </span>
                    {diaria.data_pagamento && (
                      <span className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        Pago: {formatDateBR(diaria.data_pagamento)}
                      </span>
                    )}
                  </div>

                  {diaria.observacoes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                      💬 {diaria.observacoes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {diaria.status_pagamento === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => handleMarcarPago(diaria)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Marcar Pago
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeletar(diaria.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {diariasFiltradas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Nenhuma diária registrada</p>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Diária
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Adicionar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Adicionar Diária</h3>
                  <p className="text-sm text-gray-600">Registre uma nova diária para pagamento</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Colaborador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colaborador <span className="text-red-500">*</span>
                </label>
                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={isSubmitting || loadingColaboradores}
                >
                  <option value="">
                    {loadingColaboradores ? 'Carregando colaboradores...' : 'Selecione um colaborador'}
                  </option>
                  {colaboradores.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.nome} - {col.funcao}
                    </option>
                  ))}
                </select>
                {colaboradores.length === 0 && !loadingColaboradores && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Nenhum colaborador de equipe de massa encontrado
                  </p>
                )}
              </div>

              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Unitário (R$) <span className="text-red-500">*</span>
                  </label>
                  <CurrencyInput
                    value={Number(valorUnitario) || 0}
                    onChange={(value) => setValorUnitario(value.toString())}
                    placeholder="R$ 0,00"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adicional (R$)</label>
                  <CurrencyInput
                    value={Number(adicional) || 0}
                    onChange={(value) => setAdicional(value.toString())}
                    placeholder="R$ 0,00"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                  <CurrencyInput
                    value={Number(desconto) || 0}
                    onChange={(value) => setDesconto(value.toString())}
                    placeholder="R$ 0,00"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Diária <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dataDiaria}
                    onChange={(e) => setDataDiaria(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento
                  </label>
                  <Input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Valor Total Calculado */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Valor Total a Pagar:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatarValor(valorTotalCalculado)}</span>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Observações adicionais..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Diária'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

