import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import { FileUpload } from './FileUpload';
import { User, Briefcase, CreditCard, Calendar, FileText } from 'lucide-react';
import {
  ColaboradorExpandido,
  TIPO_EQUIPE_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  CATEGORIA_CNH_OPTIONS,
  getFuncoesOptions,
  CategoriaCNH,
  TipoEquipe,
  FuncaoColaborador,
} from '../../types/colaboradores';
import { uploadDocumento } from '../../services/colaborador-storage';
import { toast } from '../../lib/toast-hooks';
import { USE_MOCK, logMockOperation } from '../../config/mock-config';
import { formatCPF, formatPhone, formatEmail, unformatCPF, unformatPhone, isValidCPF, isValidEmail, isValidPhone } from '../../utils/formatters';

interface InformacoesGeraisTabProps {
  colaborador: ColaboradorExpandido;
  onUpdate: (data: Partial<ColaboradorExpandido>) => void;
  isLoading?: boolean;
}

export const InformacoesGeraisTab: React.FC<InformacoesGeraisTabProps> = ({
  colaborador,
  onUpdate,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<ColaboradorExpandido>>({
    nome: colaborador.nome || '',
    tipo_equipe: colaborador.tipo_equipe || 'massa',
    funcao: colaborador.funcao || 'Ajudante',
    tipo_contrato: colaborador.tipo_contrato || 'fixo',
    cpf: colaborador.cpf || '',
    cnh: colaborador.cnh || '',
    categoria_cnh: colaborador.categoria_cnh || undefined,
    validade_cnh: colaborador.validade_cnh || '',
    data_admissao: colaborador.data_admissao || '',
    telefone: colaborador.telefone || '',
    email: colaborador.email || '',
    observacoes: colaborador.observacoes || '',
  });

  // Estados para validação
  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    telefone?: string;
    email?: string;
  }>({});

  // Auto-save com debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Verificar se houve mudanças
      const mudou = Object.keys(formData).some(
        (key) => formData[key as keyof typeof formData] !== colaborador[key as keyof ColaboradorExpandido]
      );

      if (mudou) {
        onUpdate(formData);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    let formattedValue = value;
    let validationError = '';

    // Formatação e validação específica por campo
    if (field === 'cpf' && typeof value === 'string') {
      formattedValue = formatCPF(value);
      if (value && !isValidCPF(value)) {
        validationError = 'CPF inválido';
      }
    } else if (field === 'telefone' && typeof value === 'string') {
      formattedValue = formatPhone(value);
      if (value && !isValidPhone(value)) {
        validationError = 'Telefone inválido';
      }
    } else if (field === 'email' && typeof value === 'string') {
      formattedValue = formatEmail(value);
      if (value && !isValidEmail(value)) {
        validationError = 'Email inválido';
      }
    }

    // Atualizar dados do formulário
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Atualizar erros de validação
    setValidationErrors((prev) => ({
      ...prev,
      [field]: validationError || undefined,
    }));
  };

  const handleUploadDocumentos = async (files: File[]) => {
    try {
      if (USE_MOCK) {
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        logMockOperation('Upload de documentos pessoais', { 
          files: files.map(f => f.name),
          colaboradorId: colaborador.id 
        });
        toast.success(`${files.length} documento(s) enviado(s) com sucesso!`);
        return;
      }

      // Upload real
      const uploads = await Promise.all(
        files.map((file) =>
          uploadDocumento(file, colaborador.id, 'documentos-pessoais')
        )
      );

      const sucesso = uploads.filter((u) => u !== null).length;
      if (sucesso > 0) {
        toast.success(`${sucesso} documento(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      toast.error('Erro ao enviar documentos');
    }
  };

  const funcoesOptions = getFuncoesOptions(formData.tipo_equipe as TipoEquipe);

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Dados Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome completo do colaborador"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <Input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              disabled={isLoading}
              maxLength={14}
              className={validationErrors.cpf ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {validationErrors.cpf && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.cpf}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <Input
              type="text"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={isLoading}
              className={validationErrors.telefone ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {validationErrors.telefone && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.telefone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              disabled={isLoading}
              className={validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
          Dados Profissionais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Equipe <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.tipo_equipe!}
              onChange={(value) => handleChange('tipo_equipe', value)}
              options={TIPO_EQUIPE_OPTIONS}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Função <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.funcao!}
              onChange={(value) => handleChange('funcao', value)}
              options={funcoesOptions}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Contrato
            </label>
            <Select
              value={formData.tipo_contrato!}
              onChange={(value) => handleChange('tipo_contrato', value)}
              options={TIPO_CONTRATO_OPTIONS}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Admissão
            </label>
            <Input
              type="date"
              value={formData.data_admissao}
              onChange={(e) => handleChange('data_admissao', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* CNH */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Carteira de Habilitação (CNH)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da CNH
            </label>
            <Input
              type="text"
              value={formData.cnh}
              onChange={(e) => handleChange('cnh', e.target.value)}
              placeholder="00000000000"
              disabled={isLoading}
              maxLength={11}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <Select
              value={formData.categoria_cnh || ''}
              onChange={(value) => handleChange('categoria_cnh', value as CategoriaCNH)}
              options={[
                { value: '', label: 'Selecione...' },
                ...CATEGORIA_CNH_OPTIONS,
              ]}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade da CNH
            </label>
            <Input
              type="date"
              value={formData.validade_cnh}
              onChange={(e) => handleChange('validade_cnh', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Observações
        </h3>

        <textarea
          value={formData.observacoes}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          placeholder="Observações adicionais sobre o colaborador..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          disabled={isLoading}
        />
      </div>

      {/* Upload de Documentos Gerais */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Documentos Pessoais
        </h3>

        <FileUpload
          onUpload={handleUploadDocumentos}
          multiple
          maxFiles={5}
          label="Documentos Pessoais (RG, CPF, Comprovante de Residência, etc.)"
          helpText="PDF, PNG ou JPG até 10MB"
          disabled={isLoading}
        />
      </div>

      {/* Indicador de Auto-save */}
      {!isLoading && (
        <div className="text-center text-sm text-gray-500">
          <p>✓ As alterações são salvas automaticamente</p>
        </div>
      )}
    </div>
  );
};


          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Observações
        </h3>

        <textarea
          value={formData.observacoes}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          placeholder="Observações adicionais sobre o colaborador..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          disabled={isLoading}
        />
      </div>

      {/* Upload de Documentos Gerais */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Documentos Pessoais
        </h3>

        <FileUpload
          onUpload={handleUploadDocumentos}
          multiple
          maxFiles={5}
          label="Documentos Pessoais (RG, CPF, Comprovante de Residência, etc.)"
          helpText="PDF, PNG ou JPG até 10MB"
          disabled={isLoading}
        />
      </div>

      {/* Indicador de Auto-save */}
      {!isLoading && (
        <div className="text-center text-sm text-gray-500">
          <p>✓ As alterações são salvas automaticamente</p>
        </div>
      )}
    </div>
  );
};

