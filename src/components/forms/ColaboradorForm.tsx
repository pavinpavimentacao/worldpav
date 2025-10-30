import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FloatingSelect } from '../shared/FloatingSelect';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast-hooks';
import { getEquipes } from '../../lib/equipesApi';
import {
  Colaborador,
  ColaboradorInsert,
  ColaboradorUpdate,
  TipoEquipe,
  FuncaoColaborador,
  TIPO_EQUIPE_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  getFuncoesOptions,
  validarFuncaoTipoEquipe,
} from '../../types/colaboradores';

interface ColaboradorFormProps {
  colaborador?: Colaborador | null;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

export const ColaboradorForm: React.FC<ColaboradorFormProps> = ({
  colaborador,
  onClose,
  onSuccess,
  companyId,
}) => {
  const isEditing = !!colaborador;

  // Form state
  const [nome, setNome] = useState(colaborador?.nome || '');
  const [equipeId, setEquipeId] = useState(colaborador?.equipe_id || '');
  const [tipoEquipe, setTipoEquipe] = useState<TipoEquipe>(
    colaborador?.tipo_equipe || 'equipe_a'
  );
  const [funcao, setFuncao] = useState<FuncaoColaborador>(
    colaborador?.funcao || 'Ajudante'
  );
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string }>>([]);
  const [tipoContrato, setTipoContrato] = useState(
    colaborador?.tipo_contrato || 'fixo'
  );
  const [salarioFixo, setSalarioFixo] = useState(
    colaborador?.salario_fixo?.toString() || '0'
  );
  const [dataPagamento1, setDataPagamento1] = useState(
    colaborador?.data_pagamento_1 || ''
  );
  const [dataPagamento2, setDataPagamento2] = useState(
    colaborador?.data_pagamento_2 || ''
  );
  const [valorPagamento1, setValorPagamento1] = useState(
    colaborador?.valor_pagamento_1?.toString() || ''
  );
  const [valorPagamento2, setValorPagamento2] = useState(
    colaborador?.valor_pagamento_2?.toString() || ''
  );
  const [registrado, setRegistrado] = useState(colaborador?.registrado || false);
  const [valeTransporte, setValeTransporte] = useState(
    colaborador?.vale_transporte || false
  );
  const [qtdPassagens, setQtdPassagens] = useState(
    colaborador?.qtd_passagens_por_dia?.toString() || ''
  );
  const [cpf, setCpf] = useState(colaborador?.cpf || '');
  const [telefone, setTelefone] = useState(colaborador?.telefone || '');
  const [email, setEmail] = useState(colaborador?.email || '');
  const [equipamentoId, setEquipamentoId] = useState(
    colaborador?.equipamento_vinculado_id || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);

  // Load equipes e equipamentos
  useEffect(() => {
    loadEquipamentos();
    loadEquipes();
  }, [companyId]);

  // Atualizar função quando tipo de equipe mudar
  useEffect(() => {
    const funcoesDisponiveis = getFuncoesOptions(tipoEquipe);
    if (funcoesDisponiveis.length > 0 && !validarFuncaoTipoEquipe(funcao, tipoEquipe)) {
      setFuncao(funcoesDisponiveis[0].value as FuncaoColaborador);
    }
  }, [tipoEquipe]);

  const loadEquipamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('pumps')
        .select('id, prefix, model')
        .eq('company_id', companyId)
        .order('prefix');

      if (error) throw error;
      setEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  };

  const loadEquipes = async () => {
    try {
      const equipesData = await getEquipes(companyId);
      setEquipes(equipesData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!validarFuncaoTipoEquipe(funcao, tipoEquipe)) {
      toast.error(`A função ${funcao} não é válida para equipe ${tipoEquipe}`);
      return;
    }

    if (valeTransporte && (!qtdPassagens || parseInt(qtdPassagens) <= 0)) {
      toast.error('Quantidade de passagens é obrigatória quando vale transporte está ativo');
      return;
    }

    setIsSubmitting(true);

    try {
      const colaboradorData = {
        nome: nome.trim(),
        tipo_equipe: tipoEquipe, // Manter para compatibilidade
        equipe_id: equipeId || null, // ✅ Novo: usar equipe_id
        funcao,
        tipo_contrato: tipoContrato,
        salario_fixo: parseFloat(salarioFixo) || 0,
        data_pagamento_1: dataPagamento1 || null,
        data_pagamento_2: dataPagamento2 || null,
        valor_pagamento_1: valorPagamento1 ? parseFloat(valorPagamento1) : null,
        valor_pagamento_2: valorPagamento2 ? parseFloat(valorPagamento2) : null,
        equipamento_vinculado_id: equipamentoId || null,
        registrado,
        vale_transporte: valeTransporte,
        qtd_passagens_por_dia: qtdPassagens ? parseInt(qtdPassagens) : null,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        company_id: companyId,
      };

      if (isEditing) {
        const updateData: ColaboradorUpdate = colaboradorData;
        const { error } = await supabase
          .from('colaboradores')
          .update(updateData)
          .eq('id', colaborador.id);

        if (error) throw error;
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        const insertData: ColaboradorInsert = colaboradorData;
        const { error } = await supabase.from('colaboradores').insert(insertData);

        if (error) throw error;
        toast.success('Colaborador cadastrado com sucesso!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast.error(error.message || 'Erro ao salvar colaborador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const funcoesOptions = getFuncoesOptions(tipoEquipe);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados do colaborador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Dados Básicos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo do colaborador"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipe <span className="text-red-500">*</span>
                </label>
                <FloatingSelect
                  value={equipeId}
                  onChange={(value) => setEquipeId(value)}
                  options={[
                    { value: '', label: 'Selecione a equipe' },
                    ...equipes.map(eq => ({
                      value: eq.id,
                      label: eq.name
                    }))
                  ]}
                  disabled={equipes.length === 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função <span className="text-red-500">*</span>
                </label>
                <FloatingSelect
                  value={funcao}
                  onChange={(value) => setFuncao(value as FuncaoColaborador)}
                  options={funcoesOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato
                </label>
                <FloatingSelect
                  value={tipoContrato}
                  onChange={(value) => setTipoContrato(value as 'fixo' | 'diarista')}
                  options={TIPO_CONTRATO_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salário Fixo
                </label>
                <Input
                  type="number"
                  value={salarioFixo}
                  onChange={(e) => setSalarioFixo(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Dados de Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <Input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@email.com"
                />
              </div>
            </div>
          </div>

          {/* Pagamentos (apenas para contrato fixo) */}
          {tipoContrato === 'fixo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Pagamentos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento 1
                  </label>
                  <Input
                    type="date"
                    value={dataPagamento1}
                    onChange={(e) => setDataPagamento1(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Pagamento 1
                  </label>
                  <Input
                    type="number"
                    value={valorPagamento1}
                    onChange={(e) => setValorPagamento1(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento 2
                  </label>
                  <Input
                    type="date"
                    value={dataPagamento2}
                    onChange={(e) => setDataPagamento2(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Pagamento 2
                  </label>
                  <Input
                    type="number"
                    value={valorPagamento2}
                    onChange={(e) => setValorPagamento2(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Equipamento e Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Equipamento e Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipamento Vinculado
                </label>
                <FloatingSelect
                  value={equipamentoId}
                  onChange={setEquipamentoId}
                  options={[
                    { value: '', label: 'Nenhum' },
                    ...equipamentos.map((eq) => ({
                      value: eq.id,
                      label: `${eq.prefix} - ${eq.model}`,
                    })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qtd. Passagens/Dia
                </label>
                <Input
                  type="number"
                  value={qtdPassagens}
                  onChange={(e) => setQtdPassagens(e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={!valeTransporte}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registrado}
                    onChange={(e) => setRegistrado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Registrado
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={valeTransporte}
                    onChange={(e) => setValeTransporte(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Vale Transporte
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                ? 'Atualizar'
                : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

