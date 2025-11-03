/**
 * Tab: Horas Extras do Colaborador
 * Exibe e gerencia as horas extras registradas para o colaborador
 */

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar, DollarSign, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateBR } from '../../utils/date-format';
import HoraExtraForm from '../forms/HoraExtraForm';

interface HoraExtra {
  id: string;
  colaborador_id: string;
  data: string;
  horas: number;
  valor_calculado: number;
  tipo_dia: 'normal' | 'sabado' | 'domingo' | 'feriado';
  created_at: string;
}

interface HorasExtrasTabProps {
  colaboradorId: string;
  colaboradorNome: string;
  salarioFixo: number;
}

const TIPOS_DIA_LABELS: Record<string, string> = {
  'normal': 'Dia Normal',
  'sabado': 'Sábado',
  'domingo': 'Domingo',
  'feriado': 'Feriado'
};

const TIPOS_DIA_CORES: Record<string, string> = {
  'normal': 'bg-blue-100 text-blue-800 border-blue-200',
  'sabado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'domingo': 'bg-red-100 text-red-800 border-red-200',
  'feriado': 'bg-purple-100 text-purple-800 border-purple-200'
};

export function HorasExtrasTab({ colaboradorId, colaboradorNome, salarioFixo }: HorasExtrasTabProps) {
  const [horasExtras, setHorasExtras] = useState<HoraExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHorasExtras();
  }, [colaboradorId, dataInicio, dataFim]);

  const loadHorasExtras = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando horas extras para colaborador:', colaboradorId);

      let query = supabase
        .from('colaboradores_horas_extras')
        .select('*')
        .eq('colaborador_id', colaboradorId);

      // Aplicar filtros de data
      if (dataInicio) {
        query = query.gte('data', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data', dataFim);
      }

      const { data, error } = await query.order('data', { ascending: false });

      if (error) throw error;

      console.log('📊 Horas extras encontradas:', data?.length || 0);
      setHorasExtras(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar horas extras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro de hora extra?')) {
      return;
    }

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('colaboradores_horas_extras')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Hora extra excluída com sucesso');
      loadHorasExtras();
    } catch (error) {
      console.error('❌ Erro ao excluir hora extra:', error);
      alert('Erro ao excluir hora extra');
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

  const totalHoras = horasExtras.reduce((sum, he) => sum + he.horas, 0);
  const valorTotal = horasExtras.reduce((sum, he) => sum + he.valor_calculado, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando horas extras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Horas Extras - {colaboradorNome}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Hora Extra
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Total de Registros</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">{horasExtras.length}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Total de Horas</h3>
          </div>
          <p className="text-3xl font-bold text-purple-700">
            {totalHoras.toFixed(1)}h
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Valor Total</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {formatarValor(valorTotal)}
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

      {/* Lista de Horas Extras */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Registros ({horasExtras.length})
        </h3>

        {horasExtras.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-gray-200">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Nenhuma hora extra registrada para {colaboradorNome}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Hora Extra
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {horasExtras.map((horaExtra) => (
              <div
                key={horaExtra.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatDateBR(horaExtra.data)}
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            TIPOS_DIA_CORES[horaExtra.tipo_dia] || TIPOS_DIA_CORES['normal']
                          }`}
                        >
                          {TIPOS_DIA_LABELS[horaExtra.tipo_dia] || horaExtra.tipo_dia}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Horas:</span>
                          <p className="font-semibold text-gray-900">
                            {horaExtra.horas.toFixed(1)}h
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor Calculado:</span>
                          <p className="font-semibold text-green-600">
                            {formatarValor(horaExtra.valor_calculado)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Registrado em:</span>
                          <p className="font-semibold text-gray-700 text-xs">
                            {new Date(horaExtra.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão Deletar */}
                  <button
                    onClick={() => handleDelete(horaExtra.id)}
                    disabled={deletingId === horaExtra.id}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === horaExtra.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <HoraExtraForm
          colaboradorId={colaboradorId}
          salarioFixo={salarioFixo}
          onSave={() => {
            setShowForm(false);
            loadHorasExtras();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

