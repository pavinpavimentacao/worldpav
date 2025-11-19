/**
 * Página de Listagem e Gerenciamento de Funções
 * Permite criar, editar e excluir funções de colaboradores
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Briefcase, Users, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/ui/input';
import { toast } from '../../lib/toast-hooks';
import { supabase } from '../../lib/supabase';
import { getOrCreateDefaultCompany } from '../../lib/company-utils';

interface Funcao {
  id: string;
  nome: string;
  descricao?: string | null;
  tipo_equipe?: 'pavimentacao' | 'maquinas' | 'apoio' | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  origem?: 'tabela' | 'colaboradores'; // Indica se veio da tabela funcoes ou da coluna position
  quantidade_colaboradores?: number; // Quantidade de colaboradores usando esta função
}

export default function FuncoesList() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFuncao, setEditingFuncao] = useState<Funcao | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    loadFuncoes();
  }, []);

  const loadFuncoes = async () => {
    try {
      setLoading(true);
      const companyId = await getOrCreateDefaultCompany();

      // Carregar funções da tabela funcoes
      const { data: funcoesTabela, error: errorTabela } = await supabase
        .from('funcoes')
        .select('*')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('nome', { ascending: true });

      if (errorTabela) {
        console.warn('Erro ao carregar funções da tabela (pode não existir ainda):', errorTabela);
      }

      // Carregar funções existentes da coluna position dos colaboradores
      const { data: colaboradores, error: errorColab } = await supabase
        .from('colaboradores')
        .select('position, tipo_equipe')
        .eq('company_id', companyId)
        .not('position', 'is', null)
        .neq('position', '')
        .is('deleted_at', null);

      if (errorColab) {
        console.error('Erro ao carregar colaboradores:', errorColab);
      }

      // Processar funções da tabela
      const funcoesDaTabela: Funcao[] = (funcoesTabela || []).map(f => ({
        ...f,
        origem: 'tabela' as const,
        quantidade_colaboradores: 0,
      }));

      // Processar funções dos colaboradores (valores únicos)
      const funcoesDosColaboradores = new Map<string, Funcao>();
      
      if (colaboradores) {
        colaboradores.forEach(colab => {
          if (colab.position && colab.position.trim()) {
            const nomeFuncao = colab.position.trim();
            if (!funcoesDosColaboradores.has(nomeFuncao)) {
              // Verificar se já existe na tabela
              const existeNaTabela = funcoesDaTabela.some(f => f.nome.toLowerCase() === nomeFuncao.toLowerCase());
              
              if (!existeNaTabela) {
                funcoesDosColaboradores.set(nomeFuncao, {
                  id: `colab_${nomeFuncao}`, // ID temporário
                  nome: nomeFuncao,
                  descricao: null,
                  tipo_equipe: colab.tipo_equipe || null,
                  ativo: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  origem: 'colaboradores' as const,
                  quantidade_colaboradores: 0,
                });
              }
            }
          }
        });

        // Contar quantos colaboradores usam cada função
        colaboradores.forEach(colab => {
          if (colab.position && colab.position.trim()) {
            const nomeFuncao = colab.position.trim();
            
            // Atualizar contagem na tabela
            const funcaoTabela = funcoesDaTabela.find(f => f.nome.toLowerCase() === nomeFuncao.toLowerCase());
            if (funcaoTabela) {
              funcaoTabela.quantidade_colaboradores = (funcaoTabela.quantidade_colaboradores || 0) + 1;
            }
            
            // Atualizar contagem nos colaboradores
            const funcaoColab = funcoesDosColaboradores.get(nomeFuncao);
            if (funcaoColab) {
              funcaoColab.quantidade_colaboradores = (funcaoColab.quantidade_colaboradores || 0) + 1;
            }
          }
        });
      }

      // Combinar todas as funções
      const todasFuncoes = [
        ...funcoesDaTabela,
        ...Array.from(funcoesDosColaboradores.values()),
      ].sort((a, b) => a.nome.localeCompare(b.nome));

      setFuncoes(todasFuncoes);
    } catch (error: any) {
      console.error('Erro ao carregar funções:', error);
      toast.error('Erro ao carregar funções');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (funcao?: Funcao) => {
    // Se a função veio dos colaboradores, não pode ser editada diretamente
    if (funcao && funcao.origem === 'colaboradores') {
      toast.error('Migre esta função para a tabela antes de editá-la');
      return;
    }

    if (funcao) {
      setEditingFuncao(funcao);
      setFormData({
        nome: funcao.nome,
        descricao: funcao.descricao || '',
        ativo: funcao.ativo,
      });
    } else {
      setEditingFuncao(null);
      setFormData({
        nome: '',
        descricao: '',
        ativo: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFuncao(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo_equipe: '',
      ativo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('O nome da função é obrigatório');
      return;
    }

    try {
      const companyId = await getOrCreateDefaultCompany();

      if (editingFuncao) {
        // Atualizar
        const { error } = await supabase
          .from('funcoes')
          .update({
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            ativo: formData.ativo,
          })
          .eq('id', editingFuncao.id);

        if (error) throw error;
        toast.success('Função atualizada com sucesso!');
      } else {
        // Criar
        const { error } = await supabase
          .from('funcoes')
          .insert({
            company_id: companyId,
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            ativo: formData.ativo,
          });

        if (error) throw error;
        toast.success('Função criada com sucesso!');
      }

      handleCloseModal();
      loadFuncoes();
    } catch (error: any) {
      console.error('Erro ao salvar função:', error);
      toast.error(error.message || 'Erro ao salvar função');
    }
  };

  const handleDelete = async (funcao: Funcao) => {
    // Se a função veio dos colaboradores, não pode ser excluída diretamente
    if (funcao.origem === 'colaboradores') {
      toast.error('Esta função está sendo usada por colaboradores. Migre-a para a tabela de funções primeiro.');
      return;
    }

    if (!window.confirm(`Deseja realmente excluir a função "${funcao.nome}"?`)) {
      return;
    }

    try {
      // Verificar se há colaboradores usando esta função
      const { data: colaboradores, error: checkError } = await supabase
        .from('colaboradores')
        .select('id, name')
        .eq('position', funcao.nome)
        .is('deleted_at', null)
        .limit(1);

      if (checkError) throw checkError;

      if (colaboradores && colaboradores.length > 0) {
        toast.error(`Não é possível excluir. Existem colaboradores com esta função: ${colaboradores[0].name}`);
        return;
      }

      // Soft delete
      const { error } = await supabase
        .from('funcoes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', funcao.id);

      if (error) throw error;

      toast.success('Função excluída com sucesso!');
      loadFuncoes();
    } catch (error: any) {
      console.error('Erro ao excluir função:', error);
      toast.error(error.message || 'Erro ao excluir função');
    }
  };

  const handleMigrarParaTabela = async (funcao: Funcao) => {
    if (funcao.origem !== 'colaboradores') {
      return;
    }

    try {
      const companyId = await getOrCreateDefaultCompany();

      // Verificar se já existe na tabela (case-insensitive)
      const { data: funcoesExistentes, error: checkError } = await supabase
        .from('funcoes')
        .select('id, nome')
        .eq('company_id', companyId)
        .is('deleted_at', null);

      if (checkError) {
        // Se a tabela não existe ainda, continuar
        if (checkError.code === '42P01') {
          console.warn('Tabela funcoes não existe ainda, será criada pela migration');
        } else {
          throw checkError;
        }
      }

      const existe = funcoesExistentes?.some(
        f => f.nome.toLowerCase() === funcao.nome.toLowerCase()
      );

      if (existe) {
        toast.error('Esta função já existe na tabela de funções');
        loadFuncoes(); // Recarregar para atualizar a lista
        return;
      }

      // Criar na tabela
      const { error } = await supabase
        .from('funcoes')
        .insert({
          company_id: companyId,
          nome: funcao.nome,
          descricao: funcao.descricao || null,
          ativo: true,
        });

      if (error) {
        // Se a tabela não existe, informar o usuário
        if (error.code === '42P01') {
          toast.error('A tabela de funções ainda não foi criada. Execute a migration 20_funcoes.sql primeiro.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Função migrada para a tabela com sucesso! Agora você pode editá-la.');
      loadFuncoes();
    } catch (error: any) {
      console.error('Erro ao migrar função:', error);
      toast.error(error.message || 'Erro ao migrar função');
    }
  };

  const handleToggleAtivo = async (funcao: Funcao) => {
    // Se a função veio dos colaboradores, não pode ser alterada diretamente
    if (funcao.origem === 'colaboradores') {
      toast.error('Migre esta função para a tabela antes de alterá-la');
      return;
    }

    try {
      const { error } = await supabase
        .from('funcoes')
        .update({ ativo: !funcao.ativo })
        .eq('id', funcao.id);

      if (error) throw error;

      toast.success(`Função ${!funcao.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      loadFuncoes();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da função');
    }
  };

  const funcoesFiltradas = funcoes.filter(funcao =>
    funcao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (funcao.descricao && funcao.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando funções...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Funções
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie as funções e cargos dos colaboradores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={loadFuncoes} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Função
            </Button>
          </div>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar funções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Funções */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcoesFiltradas.map((funcao) => (
            <div
              key={funcao.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                funcao.ativo ? 'border-gray-200' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {funcao.nome}
                  </h3>
                  {funcao.descricao && (
                    <p className="text-sm text-gray-600 mb-2">{funcao.descricao}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        funcao.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {funcao.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                    {funcao.origem === 'colaboradores' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                        Não migrada
                      </span>
                    )}
                    {funcao.quantidade_colaboradores !== undefined && funcao.quantidade_colaboradores > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        {funcao.quantidade_colaboradores} colaborador{funcao.quantidade_colaboradores !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                {funcao.origem === 'colaboradores' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMigrarParaTabela(funcao)}
                      className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Migrar para Tabela
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(funcao)}
                      className="text-gray-600"
                      disabled
                      title="Edite após migrar para a tabela"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(funcao)}
                      className="text-red-600 hover:bg-red-50"
                      disabled
                      title="Exclua após migrar para a tabela"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(funcao)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAtivo(funcao)}
                      className={funcao.ativo ? 'text-orange-600' : 'text-green-600'}
                    >
                      {funcao.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(funcao)}
                      className="text-red-600 hover:bg-red-50 border-red-300"
                      title="Excluir função"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {funcoesFiltradas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Nenhuma função encontrada' : 'Nenhuma função cadastrada'}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Função
              </Button>
            )}
          </div>
        )}

        {/* Modal de Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingFuncao ? 'Editar Função' : 'Nova Função'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {editingFuncao ? 'Atualize os dados da função' : 'Preencha os dados da nova função'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Função <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Operador de Rolo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição opcional da função..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                    Função ativa
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    {editingFuncao ? 'Atualizar' : 'Criar'} Função
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

