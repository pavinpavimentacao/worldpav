/**
 * Tab: Empresas de Guarda
 * Lista e cadastro de empresas que fornecem guardas
 */

import React, { useState } from 'react';
import { Plus, Building2, Phone, FileText, Edit, Trash2, X } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { toast } from '../../lib/toast-hooks';
import {
  mockEmpresasGuarda,
  adicionarEmpresaGuarda,
} from '../../mocks/guardas-mock';
import {
  formatarDocumento,
  validarCPF,
  validarCNPJ,
  type EmpresaGuarda,
} from '../../types/guardas';

export const EmpresasGuardaTab: React.FC = () => {
  const [empresas, setEmpresas] = useState(mockEmpresasGuarda);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'CPF' | 'CNPJ'>('CNPJ');

  const handleOpenModal = () => {
    limparFormulario();
    setShowModal(true);
  };

  const limparFormulario = () => {
    setNome('');
    setTelefone('');
    setDocumento('');
    setTipoDocumento('CNPJ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações
    if (!nome.trim()) {
      toast.error('Nome da empresa é obrigatório');
      setIsSubmitting(false);
      return;
    }

    if (!telefone.trim()) {
      toast.error('Telefone é obrigatório');
      setIsSubmitting(false);
      return;
    }

    if (!documento.trim()) {
      toast.error(`${tipoDocumento} é obrigatório`);
      setIsSubmitting(false);
      return;
    }

    // Validar documento
    const documentoLimpo = documento.replace(/\D/g, '');
    const isValido = tipoDocumento === 'CPF' 
      ? validarCPF(documentoLimpo) 
      : validarCNPJ(documentoLimpo);

    if (!isValido) {
      toast.error(`${tipoDocumento} inválido`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const novaEmpresa = adicionarEmpresaGuarda({
        nome: nome.trim(),
        telefone: telefone.trim(),
        documento: documentoLimpo,
        tipo_documento: tipoDocumento,
      });

      setEmpresas([...empresas, novaEmpresa]);
      toast.success('Empresa cadastrada com sucesso!');
      setShowModal(false);
      limparFormulario();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header da Tab */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Empresas de Guarda
          </h2>
          <p className="text-sm text-gray-600">
            Empresas que fornecem guardas para os maquinários
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </Button>
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresas.filter((e) => e.ativo).map((empresa) => (
          <div
            key={empresa.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {empresa.nome}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Phone className="w-3 h-3" />
                    <span>{empresa.telefone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {empresa.tipo_documento}:
              </span>
              <span className="font-medium text-gray-900">
                {formatarDocumento(empresa.documento, empresa.tipo_documento)}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              Cadastrado em {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {empresas.filter((e) => e.ativo).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Nenhuma empresa cadastrada</p>
          <p className="text-sm text-gray-500 mb-4">
            Cadastre empresas que fornecem guardas
          </p>
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Primeira Empresa
          </Button>
        </div>
      )}

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nova Empresa de Guarda
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cadastre uma empresa fornecedora
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome da Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Segurança Total Ltda"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="CNPJ"
                      checked={tipoDocumento === 'CNPJ'}
                      onChange={(e) => setTipoDocumento(e.target.value as 'CNPJ')}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">CNPJ</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="CPF"
                      checked={tipoDocumento === 'CPF'}
                      onChange={(e) => setTipoDocumento(e.target.value as 'CPF')}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">CPF</span>
                  </label>
                </div>
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tipoDocumento} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder={
                    tipoDocumento === 'CPF'
                      ? '000.000.000-00'
                      : '00.000.000/0000-00'
                  }
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tipoDocumento === 'CPF' ? '11 dígitos' : '14 dígitos'}
                </p>
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


