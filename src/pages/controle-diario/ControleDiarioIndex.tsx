/**
 * Página Principal - Controle Diário
 * Sistema de controle diário de colaboradores e pagamento de diárias
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, DollarSign, History, Clock, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Layout } from "../../components/layout/Layout";
import { RelacaoDiariaTab } from '../../components/controle-diario/RelacaoDiariaTab';
import { DiariasTab } from '../../components/controle-diario/DiariasTab';
import { HistoricoTab } from '../../components/controle-diario/HistoricoTab';
import { HorasExtrasTab } from '../../components/controle-diario/HorasExtrasTab';
import { getEstatisticasControleDiario } from '../../mocks/controle-diario-mock';
import { formatarValor, EstatisticasControleDiario } from '../../types/controle-diario';

type TabType = 'relacao' | 'diarias' | 'historico' | 'horas-extras';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ControleDiarioIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('relacao');
  const [stats, setStats] = useState<EstatisticasControleDiario>({
    totalRelacoes: 0,
    totalPresencas: 0,
    totalAusencias: 0,
    totalFaltas: 0,
    totalAtestados: 0,
    totalMudancas: 0,
    totalDiarias: 0,
    valorTotalDiarias: 0,
    diariasPendentes: 0,
    valorPendente: 0
  });

  useEffect(() => {
    async function loadStats() {
      const data = await getEstatisticasControleDiario();
      setStats(data);
    }
    loadStats();
  }, []);

  const tabs: Tab[] = [
    {
      id: 'relacao',
      label: 'Relação Diária',
      icon: ClipboardList,
      description: 'Controle de presença e mudanças',
    },
    {
      id: 'diarias',
      label: 'Diárias',
      icon: DollarSign,
      description: 'Pagamentos e gestão financeira',
    },
    {
      id: 'horas-extras',
      label: 'Horas Extras',
      icon: Clock,
      description: 'Gerenciamento de horas extras',
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: History,
      description: 'Consulta de registros passados',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Header - Formato Quadro Branco */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Controle Diário</h1>
                <p className="text-gray-600 mt-1">
                  Gerenciamento completo de presença e diárias dos colaboradores
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Relações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Relações Registradas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRelacoes}</p>
                </div>
              </div>
            </div>

            {/* Total de Presenças */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total de Presenças</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPresencas}</p>
                </div>
              </div>
            </div>

            {/* Valor Total de Diárias */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Valor Total Diárias</p>
                  <p className="text-xl font-bold text-gray-900">{formatarValor(stats.valorTotalDiarias)}</p>
                </div>
              </div>
            </div>

            {/* Diárias Pendentes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pagamentos Pendentes</p>
                  <p className="text-xl font-bold text-gray-900">{formatarValor(stats.valorPendente)}</p>
                  <p className="text-xs text-orange-600 mt-1">{stats.diariasPendentes} diárias</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Formato Quadro Branco */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6 pt-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'relacao' && <RelacaoDiariaTab />}
            {activeTab === 'diarias' && <DiariasTab />}
            {activeTab === 'horas-extras' && <HorasExtrasTab />}
            {activeTab === 'historico' && <HistoricoTab />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ControleDiarioIndex;

