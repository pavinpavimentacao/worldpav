import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/Select';
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
import { formatCurrency } from '../../types/financial';
import {
  Colaborador,
  TIPO_EQUIPE_OPTIONS,
  getTipoEquipeLabel,
  getFuncaoColor,
} from '../../types/colaboradores';
import { 
  mockColaboradores, 
  mockColaboradoresStats 
} from '../../mocks/colaboradores-mock';

const ColaboradoresListMock: React.FC = () => {
  const navigate = useNavigate();
  
  // State usando dados mockados
  const [colaboradores] = useState<Colaborador[]>(mockColaboradores);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tipoEquipeFilter, setTipoEquipeFilter] = useState<string>('todas');
  const [tipoContratoFilter, setTipoContratoFilter] = useState<string>('todos');

  // Filtros aplicados
  const filteredColaboradores = useMemo(() => {
    let filtered = colaboradores;

    // Filtro por tipo de equipe
    if (tipoEquipeFilter !== 'todas') {
      filtered = filtered.filter((colab) => colab.tipo_equipe === tipoEquipeFilter);
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

  // Estatísticas
  const { total, equipeMassa, equipeAdministrativa, registrados } = mockColaboradoresStats;

  const handleViewDetails = (colaborador: Colaborador) => {
    navigate(`/colaboradores/${colaborador.id}`);
  };

  const handleEdit = (colaborador: Colaborador) => {
    navigate(`/colaboradores/${colaborador.id}/edit`);
  };

  const handleDelete = (colaborador: Colaborador) => {
    if (confirm(`Tem certeza que deseja excluir ${colaborador.nome}?`)) {
      alert('Em produção, o colaborador seria excluído do banco de dados.');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
            <Button onClick={() => alert('Em produção, isso abrirá o formulário de cadastro.')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-xl font-semibold text-gray-900">{total}</p>
            </div>
          </div>

          <div className="card flex items-center p-4">
            <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
              <HardHat className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Equipe de Massa</p>
              <p className="text-xl font-semibold text-gray-900">{equipeMassa}</p>
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
                            colaborador.tipo_equipe === 'massa'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {getTipoEquipeLabel(colaborador.tipo_equipe)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getFuncaoColor(colaborador.funcao).bg
                          } ${getFuncaoColor(colaborador.funcao).text}`}
                        >
                          {colaborador.funcao}
                        </span>
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
                            onClick={() => handleViewDetails(colaborador)}
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(colaborador)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(colaborador)}
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
        </div>
      </div>
    </Layout>
  );
};

export default ColaboradoresListMock;

