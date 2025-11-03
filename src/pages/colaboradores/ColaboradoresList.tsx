import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { Select } from "../../components/shared/Select";
import { ColaboradorForm } from "../../components/forms/ColaboradorForm";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  HardHat,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast-hooks';
import { formatCurrency } from '../../types/financial';
import {
  getColaboradores,
  deleteColaborador,
  getEstatisticasColaboradores,
  toColaboradorLegacy,
  type ColaboradorSimples,
  type ColaboradorFilters as ApiFilters
} from '../../lib/colaboradoresApi';
import { getEquipes as getEquipesFromApi } from '../../lib/equipesApi';
import { getOrCreateDefaultCompany } from '../../lib/company-utils';
import {
  Colaborador,
  TipoEquipe,
  FuncaoColaborador,
  ColaboradorFilters,
  TIPO_EQUIPE_OPTIONS,
  getTipoEquipeLabel,
} from '../../types/colaboradores';

const ColaboradoresList: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [equipesMap, setEquipesMap] = useState<Map<string, string>>(new Map()); // ✅ Mapa de equipe_id -> nome
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [companyId, setCompanyId] = useState<string>('');

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tipoEquipeFilter, setTipoEquipeFilter] = useState<string>('todas');
  const [tipoContratoFilter, setTipoContratoFilter] = useState<string>('todos');

  // Load company ID and colaboradores
  useEffect(() => {
    loadUserCompany();
  }, []);

  useEffect(() => {
    if (companyId) {
      loadColaboradores();
      loadStats();
      loadEquipes(); // ✅ Carregar equipes
    }
  }, [companyId]);

  const loadEquipes = async () => {
    try {
      const equipes = await getEquipesFromApi(companyId);
      console.log('📋 [ColaboradoresList] Equipes retornadas da API:', equipes);
      console.log('📋 [ColaboradoresList] IDs das equipes:', equipes.map(eq => eq.id));
      const map = new Map<string, string>();
      equipes.forEach(eq => {
        map.set(eq.id, eq.name);
      });
      setEquipesMap(map);
      console.log('✅ [ColaboradoresList] Equipes carregadas no map:', Array.from(map.entries()));
    } catch (error) {
      console.error('❌ [ColaboradoresList] Erro ao carregar equipes:', error);
    }
  };

  const loadUserCompany = async () => {
    try {
      console.log('🔍 [ColaboradoresList] Carregando company ID...');
      // ✅ Usar getOrCreateDefaultCompany em vez de consultar tabela users
      const companyIdResult = await getOrCreateDefaultCompany();
      console.log('✅ [ColaboradoresList] Company ID recebido:', companyIdResult);
      setCompanyId(companyIdResult);
      console.log('✅ [ColaboradoresList] Company ID definido no state');
    } catch (error) {
      console.error('❌ [ColaboradoresList] Erro ao carregar empresa do usuário:', error);
      toast.error('Erro ao carregar dados do usuário');
    }
  };

  const loadColaboradores = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os colaboradores - os filtros são aplicados localmente no useMemo
      const filters: ApiFilters = {
        status: 'todos'
      };
      
      const data = await getColaboradores(companyId, filters);
      console.log('📋 [ColaboradoresList] Colaboradores carregados:', data);
      console.log('📋 [ColaboradoresList] Primeiro colaborador:', data[0]);
      
      // Converter para formato legado para manter compatibilidade
      const colaboradoresLegacy = data.map(toColaboradorLegacy);
      setColaboradores(colaboradoresLegacy);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) {
      return;
    }

    try {
      await deleteColaborador(id);
      toast.success('Colaborador excluído com sucesso!');
      loadColaboradores();
    } catch (error: any) {
      console.error('Erro ao excluir colaborador:', error);
      toast.error(error.message || 'Erro ao excluir colaborador');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedColaborador(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadColaboradores();
  };

  // Filtros aplicados
  const filteredColaboradores = useMemo(() => {
    let filtered = colaboradores;

    // Filtro por tipo de equipe
    if (tipoEquipeFilter !== 'todas') {
      filtered = filtered.filter((colab) => {
        // Mapear os valores corretos do tipo de equipe
        if (tipoEquipeFilter === 'equipe_a') return colab.tipo_equipe === 'equipe_a';
        if (tipoEquipeFilter === 'equipe_b') return colab.tipo_equipe === 'equipe_b';
        if (tipoEquipeFilter === 'escritorio') return colab.tipo_equipe === 'escritorio';
        return false;
      });
    }

    // Filtro por tipo de contrato
    if (tipoContratoFilter !== 'todos') {
      filtered = filtered.filter((colab) => colab.tipo_contrato === tipoContratoFilter);
    }

    // Filtro de busca por texto
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (colab) =>
          colab.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
          colab.funcao.toLowerCase().includes(lowerCaseSearchTerm) ||
          colab.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
          colab.cpf?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  }, [colaboradores, searchTerm, tipoEquipeFilter, tipoContratoFilter]);

  // Estatísticas - usar dados da API real
  const [stats, setStats] = useState({
    total: 0,
    massa: 0,
    administrativa: 0,
    ativos: 0,
    inativos: 0
  });

  const loadStats = async () => {
    try {
      const data = await getEstatisticasColaboradores(companyId);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Estatísticas para exibição
  const totalColaboradores = stats.total;
  const equipeA = stats.massa; // Equipe de massa = equipe A
  const equipeB = 0; // Não temos equipe B no novo sistema
  const equipeAdministrativa = stats.administrativa;
  const registrados = stats.ativos; // Assumindo que ativos = registrados

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Colaboradores
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os colaboradores das equipes de massa e administrativa.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-xl font-semibold text-gray-900">{totalColaboradores}</p>
            </div>
          </div>

          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
              <HardHat className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipe A</p>
              <p className="text-xl font-semibold text-gray-900">{equipeA}</p>
            </div>
          </div>

          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <HardHat className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipe B</p>
              <p className="text-xl font-semibold text-gray-900">{equipeB}</p>
            </div>
          </div>

          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipe Administrativa</p>
              <p className="text-xl font-semibold text-gray-900">{equipeAdministrativa}</p>
            </div>
          </div>

          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Registrados</p>
              <p className="text-xl font-semibold text-gray-900">{registrados}</p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, função, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={tipoEquipeFilter}
              onChange={setTipoEquipeFilter}
              options={[
                { value: 'todas', label: 'Todas as Equipes' },
                ...TIPO_EQUIPE_OPTIONS,
              ]}
              placeholder="Filtrar por equipe"
            />

            <Select
              value={tipoContratoFilter}
              onChange={setTipoContratoFilter}
              options={[
                { value: 'todos', label: 'Todos os Contratos' },
                { value: 'fixo', label: 'Fixo' },
                { value: 'diarista', label: 'Diarista' },
              ]}
              placeholder="Filtrar por contrato"
            />
          </div>
        </div>

        {/* Lista de Colaboradores */}
        <div className="card">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Carregando colaboradores...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Equipe
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Função
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contrato
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Salário
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredColaboradores.length > 0 ? (
                    filteredColaboradores.map((colaborador) => (
                      <tr key={colaborador.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {colaborador.nome}
                            </div>
                            {colaborador.email && (
                              <div className="text-sm text-gray-500">{colaborador.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              // Se tem equipe_id no mapa, usar cores neutras
                              colaborador.equipe_id && equipesMap.has(colaborador.equipe_id)
                                ? 'bg-blue-100 text-blue-800'
                                : colaborador.tipo_equipe === 'equipe_a'
                                ? 'bg-orange-100 text-orange-800'
                                : colaborador.tipo_equipe === 'equipe_b'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
{(() => {
                            // Tentar buscar nome da equipe pelo equipe_id
                            if (colaborador.equipe_id && equipesMap.has(colaborador.equipe_id)) {
                              const equipeNome = equipesMap.get(colaborador.equipe_id);
                              console.log(`🔍 [Render] Colaborador ${colaborador.nome}: equipe_id=${colaborador.equipe_id}, nome=${equipeNome}`);
                              console.log(`📋 [Render] Equipes map size:`, equipesMap.size);
                              console.log(`📋 [Render] Equipes map entries:`, Array.from(equipesMap.entries()));
                              return equipeNome;
                            }
                            // Fallback para tipo_equipe
                            console.log(`🔍 [Render] Colaborador ${colaborador.nome}: usando tipo_equipe=${colaborador.tipo_equipe}`);
                            console.log(`🔍 [Render] equipe_id: ${colaborador.equipe_id}, map has: ${colaborador.equipe_id ? equipesMap.has(colaborador.equipe_id) : 'undefined'}`);
                            return getTipoEquipeLabel(colaborador.tipo_equipe);
                          })()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{colaborador.funcao}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {colaborador.tipo_contrato}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(colaborador.salario_fixo)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {colaborador.registrado ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Registrado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Não Registrado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/colaboradores/${colaborador.id}`)}
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              Detalhes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(colaborador.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 whitespace-nowrap text-center text-sm text-gray-500"
                      >
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          Nenhum colaborador encontrado
                        </p>
                        <p className="text-gray-500">
                          {searchTerm || tipoEquipeFilter !== 'todas' || tipoContratoFilter !== 'todos'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece cadastrando um novo colaborador'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ColaboradorForm
          colaborador={selectedColaborador}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          companyId={companyId}
        />
      )}
    </Layout>
  );
};

export default ColaboradoresList;