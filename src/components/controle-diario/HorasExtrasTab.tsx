/**
 * Tab: Horas Extras
 * Gerenciamento de horas extras dos colaboradores
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, User, Calendar, DollarSign, AlertCircle, Filter, X, Search, FileSpreadsheet, FileText, Download, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from "../shared/Button";
import { supabase } from '../../lib/supabase';
import { getColaboradores } from '../../lib/colaboradoresApi';
import { getOrCreateDefaultCompany } from '../../lib/company-utils';
import { toast } from '../../lib/toast-hooks';
import HoraExtraForm from '../forms/HoraExtraForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '../ui/date-picker';
import { getPeriodoAtualHorasExtras, calcularPeriodoHorasExtras } from '../../utils/periodo-calculo';
import { HorasExtrasExporter, HoraExtraExportData } from '../../utils/horas-extras-exporter';
import { getEquipes } from '../../lib/equipesApi';

interface HoraExtraComColaborador {
  id: string;
  colaborador_id: string;
  data: string;
  horas: number;
  valor_calculado: number;
  tipo_dia: 'diurno' | 'noturno' | 'normal' | 'sabado' | 'domingo' | 'feriado';
  horario_entrada?: string | null;
  horario_saida?: string | null;
  created_at: string;
  colaborador: {
    id: string;
    name: string;
    salario_fixo: number;
    tipo_equipe?: string | null;
    equipe_id?: string | null;
  };
}

type FiltroData = 'hoje' | 'ontem' | 'ultimos30' | 'periodo' | 'personalizado' | 'todos';

const TIPO_DIA_LABELS: Record<string, string> = {
  diurno: 'Diurno',
  noturno: 'Noturno',
  normal: 'Dia Normal',
  sabado: 'Sábado',
  domingo: 'Domingo',
  feriado: 'Feriado'
};

const TIPO_DIA_CORES: Record<string, string> = {
  diurno: 'bg-blue-100 text-blue-800 border-blue-200',
  noturno: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  sabado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  domingo: 'bg-red-100 text-red-800 border-red-200',
  feriado: 'bg-purple-100 text-purple-800 border-purple-200'
};

export const HorasExtrasTab: React.FC = () => {
  const [horasExtras, setHorasExtras] = useState<HoraExtraComColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [colaboradores, setColaboradores] = useState<Array<{ id: string; name: string; salario_fixo: number; tipo_equipe?: string | null; equipe_id?: string | null }>>([]);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<string>('');
  const [selectedColaboradorSalario, setSelectedColaboradorSalario] = useState<number>(0);
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string }>>([]);
  const [editingHoraExtra, setEditingHoraExtra] = useState<HoraExtraComColaborador | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Filtros
  const [filtroData, setFiltroData] = useState<FiltroData>('periodo');
  const [filtroNome, setFiltroNome] = useState<string>('');
  const [filtroEquipe, setFiltroEquipe] = useState<string>('');
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState<string>('');
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState<string>('');

  useEffect(() => {
    loadHorasExtras();
    loadColaboradores();
    loadEquipes();
    // Inicializar período atual
    const periodo = getPeriodoAtualHorasExtras();
    setDataInicioPersonalizada(periodo.dataInicio);
    setDataFimPersonalizada(periodo.dataFim);
  }, []);

  const loadEquipes = async () => {
    try {
      const companyId = await getOrCreateDefaultCompany();
      const equipesData = await getEquipes(companyId);
      setEquipes(equipesData.map(eq => ({ id: eq.id, name: eq.name })));
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes');
    }
  };

  const loadColaboradores = async () => {
    try {
      const companyId = await getOrCreateDefaultCompany();
      // Buscar colaboradores diretamente do Supabase para garantir que temos equipe_id
      const { data: colaboradoresData, error } = await supabase
        .from('colaboradores')
        .select('id, name, salario_fixo, tipo_equipe, equipe_id')
        .eq('company_id', companyId)
        .eq('status', 'ativo')
        .is('deleted_at', null);

      if (error) {
        console.error('Erro ao buscar colaboradores:', error);
        toast.error('Erro ao carregar colaboradores');
        return;
      }

      setColaboradores(
        (colaboradoresData || []).map(c => ({
          id: c.id,
          name: c.name,
          salario_fixo: c.salario_fixo || 0,
          tipo_equipe: c.tipo_equipe || null,
          equipe_id: c.equipe_id || null
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    }
  };

  const loadHorasExtras = async () => {
    try {
      setLoading(true);
      
      // Buscar horas extras
      const { data: horasExtrasData, error: horasExtrasError } = await supabase
        .from('colaboradores_horas_extras')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (horasExtrasError) {
        console.error('Erro ao buscar horas extras:', horasExtrasError);
        toast.error('Erro ao carregar horas extras');
        return;
      }

      if (!horasExtrasData || horasExtrasData.length === 0) {
        setHorasExtras([]);
        return;
      }

      // Buscar colaboradores relacionados
      const colaboradorIds = [...new Set(horasExtrasData.map(he => he.colaborador_id))];
      const { data: colaboradoresData, error: colaboradoresError } = await supabase
        .from('colaboradores')
        .select('id, name, salario_fixo, tipo_equipe, equipe_id')
        .in('id', colaboradorIds);

      if (colaboradoresError) {
        console.error('Erro ao buscar colaboradores:', colaboradoresError);
        toast.error('Erro ao carregar dados dos colaboradores');
        return;
      }

      // Criar mapa de colaboradores para busca rápida
      const colaboradoresMap = new Map(
        (colaboradoresData || []).map(c => [c.id, c])
      );

      // Transformar os dados para o formato esperado
      const horasExtrasFormatadas: HoraExtraComColaborador[] = horasExtrasData
        .map((item) => {
          const colaborador = colaboradoresMap.get(item.colaborador_id);
          if (!colaborador) {
            return null;
          }
          
          // Debug: verificar tipo_dia
          if (item.tipo_dia === 'noturno' || item.tipo_dia === 'diurno') {
            console.log('🔍 Tipo de dia encontrado:', {
              id: item.id,
              tipo_dia: item.tipo_dia,
              tipo_dia_tipo: typeof item.tipo_dia,
              label: TIPO_DIA_LABELS[item.tipo_dia]
            });
          }
          
          return {
            id: item.id,
            colaborador_id: item.colaborador_id,
            data: item.data,
            horas: item.horas,
            valor_calculado: item.valor_calculado,
            tipo_dia: item.tipo_dia,
            horario_entrada: item.horario_entrada || null,
            horario_saida: item.horario_saida || null,
            created_at: item.created_at,
            colaborador: {
              id: colaborador.id,
              name: colaborador.name,
              salario_fixo: colaborador.salario_fixo || 0,
              tipo_equipe: colaborador.tipo_equipe || null,
              equipe_id: colaborador.equipe_id || null
            }
          };
        })
        .filter((item): item is HoraExtraComColaborador => item !== null);

      setHorasExtras(horasExtrasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar horas extras:', error);
      toast.error('Erro ao carregar horas extras');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (colaboradores.length === 0) {
      toast.error('Nenhum colaborador ativo encontrado');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedColaboradorId('');
    setSelectedColaboradorSalario(0);
    setEditingHoraExtra(null);
  };

  const handleSelectColaborador = (colaboradorId: string) => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    if (colaborador) {
      setSelectedColaboradorId(colaboradorId);
      setSelectedColaboradorSalario(colaborador.salario_fixo);
    }
  };

  const handleSave = () => {
    loadHorasExtras();
    handleCloseModal();
    toast.success(editingHoraExtra ? 'Hora extra atualizada com sucesso!' : 'Hora extra cadastrada com sucesso!');
  };

  const handleEdit = (horaExtra: HoraExtraComColaborador) => {
    setEditingHoraExtra(horaExtra);
    setSelectedColaboradorId(horaExtra.colaborador_id);
    setSelectedColaboradorSalario(horaExtra.colaborador.salario_fixo);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta hora extra?')) {
      return;
    }

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('colaboradores_horas_extras')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Hora extra excluída com sucesso!');
      loadHorasExtras();
    } catch (error) {
      console.error('Erro ao excluir hora extra:', error);
      toast.error('Erro ao excluir hora extra');
    } finally {
      setDeletingId(null);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  // Calcular período atual de horas extras
  const periodoAtual = getPeriodoAtualHorasExtras();

  // Aplicar filtros
  const horasExtrasFiltradas = useMemo(() => {
    let filtradas = [...horasExtras];

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
          // Usar período atual de horas extras (26 a 25)
          dataInicio = periodoAtual.dataInicio;
          dataFim = periodoAtual.dataFim;
          break;
        case 'personalizado':
          if (dataInicioPersonalizada && dataFimPersonalizada) {
            dataInicio = dataInicioPersonalizada;
            dataFim = dataFimPersonalizada;
          }
          break;
      }

      if (dataInicio && dataFim) {
        filtradas = filtradas.filter(he => {
          const dataHe = he.data;
          return dataHe >= dataInicio! && dataHe <= dataFim!;
        });
      }
    }

    // Filtro por nome
    if (filtroNome.trim()) {
      const nomeLower = filtroNome.toLowerCase();
      filtradas = filtradas.filter(he =>
        he.colaborador.name.toLowerCase().includes(nomeLower)
      );
    }

    // Filtro por equipe (usando equipe_id)
    if (filtroEquipe) {
      filtradas = filtradas.filter(he =>
        he.colaborador.equipe_id === filtroEquipe
      );
    }

    return filtradas;
  }, [horasExtras, filtroData, filtroNome, filtroEquipe, dataInicioPersonalizada, dataFimPersonalizada, periodoAtual]);

  // Calcular totais (considerando período atual por padrão)
  const totalHoras = horasExtrasFiltradas.reduce((sum, he) => sum + he.horas, 0);
  const totalValor = horasExtrasFiltradas.reduce((sum, he) => sum + he.valor_calculado, 0);

  // Usar equipes da tabela equipes

  const handleFiltroDataChange = (tipo: FiltroData) => {
    setFiltroData(tipo);
    if (tipo === 'periodo') {
      const periodo = getPeriodoAtualHorasExtras();
      setDataInicioPersonalizada(periodo.dataInicio);
      setDataFimPersonalizada(periodo.dataFim);
    }
  };

  const limparFiltros = () => {
    setFiltroData('periodo');
    setFiltroNome('');
    setFiltroEquipe('');
    const periodo = getPeriodoAtualHorasExtras();
    setDataInicioPersonalizada(periodo.dataInicio);
    setDataFimPersonalizada(periodo.dataFim);
  };

  const handleExportExcel = () => {
    try {
      if (horasExtrasFiltradas.length === 0) {
        toast.error('Nenhuma hora extra para exportar');
        return;
      }

      const dadosExport: HoraExtraExportData[] = horasExtrasFiltradas.map((he) => ({
        id: he.id,
        colaborador: he.colaborador.name,
        data: he.data,
        horario_entrada: he.horario_entrada,
        horario_saida: he.horario_saida,
        tipo_dia: he.tipo_dia,
        horas: he.horas,
        valor_calculado: he.valor_calculado,
        created_at: he.created_at,
      }));

      const periodo = filtroData === 'periodo' 
        ? periodoAtual 
        : filtroData === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada
        ? { dataInicio: dataInicioPersonalizada, dataFim: dataFimPersonalizada }
        : undefined;

      HorasExtrasExporter.exportToExcel(dadosExport, {
        periodo,
        filtros: {
          nome: filtroNome || undefined,
          equipe: filtroEquipe || undefined,
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
      if (horasExtrasFiltradas.length === 0) {
        toast.error('Nenhuma hora extra para exportar');
        return;
      }

      const dadosExport: HoraExtraExportData[] = horasExtrasFiltradas.map((he) => ({
        id: he.id,
        colaborador: he.colaborador.name,
        data: he.data,
        horario_entrada: he.horario_entrada,
        horario_saida: he.horario_saida,
        tipo_dia: he.tipo_dia,
        horas: he.horas,
        valor_calculado: he.valor_calculado,
        created_at: he.created_at,
      }));

      const periodo = filtroData === 'periodo' 
        ? periodoAtual 
        : filtroData === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada
        ? { dataInicio: dataInicioPersonalizada, dataFim: dataFimPersonalizada }
        : undefined;

      HorasExtrasExporter.exportToPDF(dadosExport, {
        periodo,
        filtros: {
          nome: filtroNome || undefined,
          equipe: filtroEquipe || undefined,
        },
      });

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Horas Extras</h2>
          <p className="text-gray-600 mt-1">
            Gerenciamento de horas extras dos colaboradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          {horasExtrasFiltradas.length > 0 && (
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
          <Button 
            onClick={handleOpenModal}
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Hora Extra</span>
          </Button>
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
            onClick={limparFiltros}
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
              onChange={(e) => handleFiltroDataChange(e.target.value as FiltroData)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="periodo">Período Atual (26 a 25)</option>
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
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
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
        </div>

        {/* Mostrar período atual quando filtro for "periodo" */}
        {filtroData === 'periodo' && (
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="font-medium">Período atual:</span> {formatarData(periodoAtual.dataInicio)} até {formatarData(periodoAtual.dataFim)}
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total de Horas</p>
              <p className="text-xl font-bold text-gray-900">{totalHoras.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">{formatarValor(totalValor)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Registros</p>
              <p className="text-xl font-bold text-gray-900">{horasExtrasFiltradas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Horas Extras */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : horasExtrasFiltradas.length === 0 ? (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma hora extra registrada</h3>
          <p className="text-gray-600 mb-4">
            Clique em "Adicionar Hora Extra" para começar a registrar horas extras dos colaboradores.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horários
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Dia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Extras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horasExtrasFiltradas.map((horaExtra) => (
                  <tr key={horaExtra.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {horaExtra.colaborador.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatarData(horaExtra.data)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {horaExtra.horario_entrada && horaExtra.horario_saida ? (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="text-gray-600">Entrada:</span>
                            <span className="ml-2 font-medium">{horaExtra.horario_entrada}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-gray-600">Saída:</span>
                            <span className="ml-2 font-medium">{horaExtra.horario_saida}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        TIPO_DIA_CORES[horaExtra.tipo_dia] || TIPO_DIA_CORES['normal']
                      }`}>
                        {TIPO_DIA_LABELS[horaExtra.tipo_dia] || horaExtra.tipo_dia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {horaExtra.horas.toFixed(1)}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatarValor(horaExtra.valor_calculado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(horaExtra.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(horaExtra)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-xs font-medium">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(horaExtra.id)}
                          disabled={deletingId === horaExtra.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Excluir"
                        >
                          {deletingId === horaExtra.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">Excluir</span>
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

      {/* Modal para selecionar colaborador */}
      {showModal && !selectedColaboradorId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Selecionar Colaborador</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione o Colaborador *
              </label>
              <select
                value={selectedColaboradorId}
                onChange={(e) => handleSelectColaborador(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.name} - {formatarValor(colaborador.salario_fixo)}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de hora extra (já tem seu próprio modal) */}
      {showModal && selectedColaboradorId && (
        <HoraExtraForm
          colaboradorId={selectedColaboradorId}
          salarioFixo={selectedColaboradorSalario}
          onSave={handleSave}
          onCancel={handleCloseModal}
          horaExtraId={editingHoraExtra?.id}
          initialData={editingHoraExtra ? {
            data: editingHoraExtra.data,
            horario_entrada: editingHoraExtra.horario_entrada || '',
            horario_saida: editingHoraExtra.horario_saida || '',
            tipo_dia: editingHoraExtra.tipo_dia
          } : undefined}
        />
      )}
    </div>
  );
};

