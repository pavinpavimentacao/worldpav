import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select } from "../shared/Select";
import { User, Briefcase, DollarSign } from 'lucide-react';
import {
  ColaboradorExpandido,
  TIPO_EQUIPE_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  getFuncoesOptions,
  TipoEquipe,
} from '../../types/colaboradores';
import { logMockOperation } from '../../config/mock-config';
import { formatCPF, formatPhone, formatEmail, unformatCPF, unformatPhone, isValidCPF, isValidEmail, isValidPhone } from '../../utils/formatters';

interface InformacoesPessoaisTabProps {
  colaborador: ColaboradorExpandido;
  onUpdate: (data: Partial<ColaboradorExpandido>) => void;
  isLoading?: boolean;
}

export const InformacoesPessoaisTab: React.FC<InformacoesPessoaisTabProps> = ({
  colaborador,
  onUpdate,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<ColaboradorExpandido>>({
    nome: colaborador.nome || '',
    tipo_equipe: colaborador.tipo_equipe || 'massa',
    funcao: colaborador.funcao || 'Ajudante',
    tipo_contrato: colaborador.tipo_contrato || 'fixo',
    salario_fixo: colaborador.salario_fixo || 0,
    cpf: colaborador.cpf || '',
    telefone: colaborador.telefone || '',
    email: colaborador.email || '',
    vale_transporte: colaborador.vale_transporte || false,
    qtd_passagens_por_dia: colaborador.qtd_passagens_por_dia || 0,
    registrado: colaborador.registrado || false,
    valor_pagamento_1: colaborador.valor_pagamento_1 || 0,
    valor_pagamento_2: colaborador.valor_pagamento_2 || 0,
    data_pagamento_1: colaborador.data_pagamento_1 || '',
    data_pagamento_2: colaborador.data_pagamento_2 || '',
  });

  // Estados para validação
  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    telefone?: string;
    email?: string;
  }>({});

  // Sincronizar formData quando colaborador mudar (ex: após salvar)
  useEffect(() => {
    setFormData({
      nome: colaborador.nome || '',
      tipo_equipe: colaborador.tipo_equipe || 'massa',
      funcao: colaborador.funcao || 'Ajudante',
      tipo_contrato: colaborador.tipo_contrato || 'fixo',
      salario_fixo: colaborador.salario_fixo || 0,
      cpf: colaborador.cpf || '',
      telefone: colaborador.telefone || '',
      email: colaborador.email || '',
      vale_transporte: colaborador.vale_transporte || false,
      qtd_passagens_por_dia: colaborador.qtd_passagens_por_dia || 0,
      registrado: colaborador.registrado || false,
      valor_pagamento_1: colaborador.valor_pagamento_1 || 0,
      valor_pagamento_2: colaborador.valor_pagamento_2 || 0,
      data_pagamento_1: colaborador.data_pagamento_1 || '',
      data_pagamento_2: colaborador.data_pagamento_2 || '',
    });
  }, [colaborador.id]); // Apenas quando o ID mudar (novo colaborador)

  // Auto-save com debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Verificar se houve mudanças
      const mudou = Object.keys(formData).some(
        (key) => formData[key as keyof typeof formData] !== colaborador[key as keyof ColaboradorExpandido]
      );

      if (mudou) {
        logMockOperation('Auto-save Informações Pessoais', formData);
        onUpdate(formData);
      }
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Sincronizar valores de pagamento com salário fixo (apenas uma vez ao mudar salário)
  useEffect(() => {
    if (formData.salario_fixo && formData.tipo_contrato === 'fixo') {
      const valorPagamento = formData.salario_fixo / 2;
      
      // Só atualizar se os valores realmente mudaram
      const valorAtualPagamento1 = formData.valor_pagamento_1 || 0;
      const valorAtualPagamento2 = formData.valor_pagamento_2 || 0;
      
      // Verifica se precisa recalcular (diferença maior que 0.01 para evitar problemas de ponto flutuante)
      if (Math.abs(valorAtualPagamento1 - valorPagamento) > 0.01 || 
          Math.abs(valorAtualPagamento2 - valorPagamento) > 0.01) {
        
        const dataAtual = new Date();
        const dia5 = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 5);
        const dia20 = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 20);
        
        // Se já passou do dia 5, usar próximo mês
        if (dataAtual.getDate() > 5) {
          dia5.setMonth(dia5.getMonth() + 1);
        }
        // Se já passou do dia 20, usar próximo mês
        if (dataAtual.getDate() > 20) {
          dia20.setMonth(dia20.getMonth() + 1);
        }

        const dadosAtualizados = {
          ...formData,
          valor_pagamento_1: valorPagamento,
          valor_pagamento_2: valorPagamento,
          data_pagamento_1: dia5.toISOString().split('T')[0],
          data_pagamento_2: dia20.toISOString().split('T')[0],
        };
        
        setFormData(dadosAtualizados);
        logMockOperation('Valores de pagamento sincronizados', dadosAtualizados);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.salario_fixo, formData.tipo_contrato]);

  const handleChange = (field: keyof typeof formData, value: string | number | boolean | null | undefined) => {
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
              value={formData.cpf || ''}
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
              value={formData.telefone || ''}
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
              value={formData.email || ''}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Equipe
            </label>
            <Select
              value={formData.tipo_equipe || ''}
              onChange={(value) => handleChange('tipo_equipe', value as TipoEquipe)}
              options={[
                { value: '', label: 'Selecione...' },
                ...TIPO_EQUIPE_OPTIONS,
              ]}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Função/Cargo
            </label>
            <Select
              value={formData.funcao || ''}
              onChange={(value) => handleChange('funcao', value)}
              options={[
                { value: '', label: 'Selecione...' },
                ...funcoesOptions,
              ]}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Contrato
            </label>
            <Select
              value={formData.tipo_contrato || ''}
              onChange={(value) => handleChange('tipo_contrato', value)}
              options={[
                { value: '', label: 'Selecione...' },
                ...TIPO_CONTRATO_OPTIONS,
              ]}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="registrado"
              checked={formData.registrado}
              onChange={(e) => handleChange('registrado', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="registrado" className="text-sm font-medium text-gray-700">
              Colaborador Registrado
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="vale_transporte"
              checked={formData.vale_transporte}
              onChange={(e) => handleChange('vale_transporte', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="vale_transporte" className="text-sm font-medium text-gray-700">
              Vale Transporte
            </label>
          </div>
        </div>

        {formData.vale_transporte && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Passagens por Dia
            </label>
              <Input
                type="number"
                value={formData.qtd_passagens_por_dia || 0}
                onChange={(e) => handleChange('qtd_passagens_por_dia', parseInt(e.target.value) || 0)}
                placeholder="4"
                min="0"
                max="10"
                disabled={isLoading}
                className="w-32"
              />
          </div>
        )}
      </div>

      {/* Informações Financeiras */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Informações Financeiras
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.tipo_contrato === 'diarista' ? 'Valor da Diária' : 'Salário Fixo'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                type="number"
                value={formData.salario_fixo}
                onChange={(e) => handleChange('salario_fixo', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                step="0.01"
                min="0"
                disabled={isLoading}
                className="pl-8"
              />
            </div>
          </div>

          {formData.tipo_contrato === 'fixo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Pagamento 1
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={formData.valor_pagamento_1 || 0}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    disabled={true}
                    className="pl-8 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Pagamento 1
                </label>
                <Input
                  type="date"
                  value={formData.data_pagamento_1 || ''}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Pagamento 2
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={formData.valor_pagamento_2 || 0}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    disabled={true}
                    className="pl-8 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Pagamento 2
                </label>
                <Input
                  type="date"
                  value={formData.data_pagamento_2 || ''}
                  disabled={true}
                  className="bg-gray-50"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Resumo:</strong> {formData.nome} trabalha como {formData.funcao} 
            {formData.tipo_contrato === 'fixo' 
              ? ` com salário fixo de R$ ${formData.salario_fixo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : ` como diarista recebendo R$ ${formData.salario_fixo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por dia`
            }
            {formData.vale_transporte && `, com ${formData.qtd_passagens_por_dia} passagens de vale transporte por dia`}.
          </p>
        </div>
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
