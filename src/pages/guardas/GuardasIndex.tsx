/**
 * Página Principal - Sistema de Guardas
 * Gerenciamento de empresas, guardas e diárias
 */

import React, { useState, useMemo } from 'react';
import { Shield, Building2, Users, FileText, Plus, Search, Calendar, DollarSign } from 'lucide-react';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { EmpresasGuardaTab } from '../../components/guardas/EmpresasGuardaTab';
import { GuardasTab } from '../../components/guardas/GuardasTab';
import { DiariasGuardaTab } from '../../components/guardas/DiariasGuardaTab';
import { getEstatisticasGuardas, mockDiariasGuarda } from '../../mocks/guardas-mock';

type TabType = 'empresas' | 'guardas' | 'diarias';

const GuardasIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('diarias');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  
  // Filtrar diárias
  const diariasFiltradas = useMemo(() => {
    return mockDiariasGuarda.filter((diaria) => {
      const matchSearch =
        searchTerm === '' ||
        diaria.guarda_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diaria.empresa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diaria.rua.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diaria.solicitante.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDate = selectedDate === '' || diaria.data_diaria === selectedDate;
      
      const matchTurno = selectedTurno === '' || diaria.turno === selectedTurno;

      return matchSearch && matchDate && matchTurno;
    });
  }, [searchTerm, selectedDate, selectedTurno]);

  // Estatísticas filtradas
  const stats = useMemo(() => {
    const baseStats = getEstatisticasGuardas();
    const valorTotalFiltrado = diariasFiltradas.reduce((acc, d) => acc + d.valor_diaria, 0);
    
    return {
      ...baseStats,
      totalDiarias: diariasFiltradas.length,
      valorTotal: valorTotalFiltrado,
      valorMedio: diariasFiltradas.length > 0 ? valorTotalFiltrado / diariasFiltradas.length : 0,
    };
  }, [diariasFiltradas]);

  const tabs = [
    {
      id: 'diarias' as TabType,
      label: 'Diárias',
      icon: FileText,
      count: stats.totalDiarias,
    },
    {
      id: 'guardas' as TabType,
      label: 'Guardas',
      icon: Users,
      count: stats.totalGuardas,
    },
    {
      id: 'empresas' as TabType,
      label: 'Empresas',
      icon: Building2,
      count: stats.totalEmpresas,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Header - Formato Quadro Branco */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Gestão de Guardas
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Empresas, guardas e controle de diárias
              </p>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total de Diárias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDiarias}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Valor Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Guardas Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGuardas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmpresas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Formato Quadro Branco */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                      ${
                        isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${
                          isActive
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filtros - Apenas para aba Diárias */}
          {activeTab === 'diarias' && (
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar guarda, empresa, rua..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por Data */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por Turno */}
                <div>
                  <select
                    value={selectedTurno}
                    onChange={(e) => setSelectedTurno(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Todos os turnos</option>
                    <option value="manha">🌅 Manhã</option>
                    <option value="tarde">☀️ Tarde</option>
                    <option value="noite">🌙 Noite</option>
                    <option value="madrugada">🌃 Madrugada</option>
                  </select>
                </div>

                {/* Botão Limpar Filtros */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDate('');
                      setSelectedTurno('');
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>

              {/* Resumo dos Filtros Ativos */}
              {(searchTerm || selectedDate || selectedTurno) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Busca: "{searchTerm}"
                    </span>
                  )}
                  {selectedDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Data: {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {selectedTurno && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Turno: {
                        selectedTurno === 'manha' ? '🌅 Manhã' :
                        selectedTurno === 'tarde' ? '☀️ Tarde' :
                        selectedTurno === 'noite' ? '🌙 Noite' :
                        '🌃 Madrugada'
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'empresas' && <EmpresasGuardaTab />}
            {activeTab === 'guardas' && <GuardasTab />}
            {activeTab === 'diarias' && (
              <DiariasGuardaTab 
                diariasFiltradas={diariasFiltradas}
                onDiariasChange={() => {
                  // Recarregar estatísticas quando diárias mudarem
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GuardasIndex;

