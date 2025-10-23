/**
 * Tab: Guardas
 * Lista e cadastro de guardas vinculados a empresas
 */

import React, { useState } from 'react';
import { Plus, User, Phone, Building2, X } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { toast } from '../../lib/toast-hooks';
import {
  mockGuardas,
  mockEmpresasGuarda,
  adicionarGuarda,
} from '../../mocks/guardas-mock';

export const GuardasTab: React.FC = () => {
  const [guardas, setGuardas] = useState(mockGuardas);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form fields
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresaId, setEmpresaId] = useState('');

  const empresasAtivas = mockEmpresasGuarda.filter((e) => e.ativo);

  const handleOpenModal = () => {
    setNome('');
    setTelefone('');
    setEmpresaId(empresasAtivas[0]?.id || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!nome.trim() || !telefone.trim() || !empresaId) {
      toast.error('Preencha todos os campos');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const novoGuarda = adicionarGuarda({
        nome: nome.trim(),
        telefone: telefone.trim(),
        empresa_id: empresaId,
      });

      setGuardas([...guardas, novoGuarda]);
      toast.success('Guarda cadastrado com sucesso!');
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar guarda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guardasFiltrados = guardas
    .filter((g) => g.ativo)
    .filter((g) =>
      searchTerm
        ? g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.empresa_nome?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Guardas</h2>
          <p className="text-sm text-gray-600">
            Guardas cadastrados por empresa
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Guarda
        </Button>
      </div>

      {/* Busca */}
      <Input
        type="text"
        placeholder="Buscar guarda ou empresa..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Lista de Guardas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guardasFiltrados.map((guarda) => (
          <div
            key={guarda.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{guarda.nome}</h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                  <Phone className="w-3 h-3" />
                  <span>{guarda.telefone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm bg-gray-50 rounded-lg p-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{guarda.empresa_nome}</span>
            </div>
          </div>
        ))}
      </div>

      {guardasFiltrados.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchTerm ? 'Nenhum guarda encontrado' : 'Nenhum guarda cadastrado'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Novo Guarda
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Guarda <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99876-5432"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa <span className="text-red-500">*</span>
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma empresa</option>
                  {empresasAtivas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
                {empresasAtivas.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Cadastre uma empresa primeiro
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || empresasAtivas.length === 0}>
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


