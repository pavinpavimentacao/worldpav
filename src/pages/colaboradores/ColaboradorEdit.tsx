import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { Select } from "../../components/shared/Select";
import { ArrowLeft, Save } from 'lucide-react';
import {
  Colaborador,
  TipoEquipe,
  FuncaoColaborador,
  TIPO_EQUIPE_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  getFuncoesOptions,
  validarFuncaoTipoEquipe,
} from '../../types/colaboradores';
import { getColaboradorById, updateColaborador, toColaboradorLegacy, type ColaboradorSimples } from '../../lib/colaboradoresApi';
import { toast } from '../../lib/toast-hooks';

const ColaboradorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [tipoEquipe, setTipoEquipe] = useState<TipoEquipe>('massa');
  const [funcao, setFuncao] = useState<FuncaoColaborador>('Ajudante');
  const [tipoContrato, setTipoContrato] = useState<'fixo' | 'diarista'>('fixo');
  const [salarioFixo, setSalarioFixo] = useState('0');
  const [dataPagamento1, setDataPagamento1] = useState('');
  const [dataPagamento2, setDataPagamento2] = useState('');
  const [valorPagamento1, setValorPagamento1] = useState('');
  const [valorPagamento2, setValorPagamento2] = useState('');
  const [registrado, setRegistrado] = useState(false);
  const [valeTransporte, setValeTransporte] = useState(false);
  const [qtdPassagens, setQtdPassagens] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadColaborador = async () => {
      if (id) {
        try {
          const colaboradorData = await getColaboradorById(id);
          if (colaboradorData) {
            // Converter para formato legado
            const colaborador = toColaboradorLegacy(colaboradorData);
            
            setNome(colaborador.nome);
            setTipoEquipe(colaborador.tipo_equipe);
            setFuncao(colaborador.funcao);
            setTipoContrato(colaborador.tipo_contrato);
            setSalarioFixo(colaborador.salario_fixo.toString());
            setDataPagamento1(colaborador.data_pagamento_1 || '');
            setDataPagamento2(colaborador.data_pagamento_2 || '');
            setValorPagamento1(colaborador.valor_pagamento_1?.toString() || '');
            setValorPagamento2(colaborador.valor_pagamento_2?.toString() || '');
            setRegistrado(colaborador.registrado);
            setValeTransporte(colaborador.vale_transporte);
            setQtdPassagens(colaborador.qtd_passagens_por_dia?.toString() || '');
            setCpf(colaborador.cpf || '');
            setTelefone(colaborador.telefone || '');
            setEmail(colaborador.email || '');
          } else {
            toast.error('Colaborador não encontrado');
            navigate('/colaboradores');
          }
        } catch (error) {
          console.error('Erro ao carregar colaborador:', error);
          toast.error('Erro ao carregar colaborador');
          navigate('/colaboradores');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadColaborador();
  }, [id, navigate]);

  // Atualizar função quando tipo de equipe mudar
  useEffect(() => {
    const funcoesDisponiveis = getFuncoesOptions(tipoEquipe);
    if (funcoesDisponiveis.length > 0 && !validarFuncaoTipoEquipe(funcao, tipoEquipe)) {
      setFuncao(funcoesDisponiveis[0].value as FuncaoColaborador);
    }
  }, [tipoEquipe]);

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

    try {
      setIsSaving(true);

      await updateColaborador(id!, {
        nome,
        tipo_equipe: tipoEquipe,
        funcao,
        tipo_contrato: tipoContrato,
        salario_fixo: parseFloat(salarioFixo),
        data_pagamento_1: dataPagamento1 || null,
        data_pagamento_2: dataPagamento2 || null,
        valor_pagamento_1: valorPagamento1 ? parseFloat(valorPagamento1) : null,
        valor_pagamento_2: valorPagamento2 ? parseFloat(valorPagamento2) : null,
        registrado,
        vale_transporte: valeTransporte,
        qtd_passagens_por_dia: qtdPassagens ? parseInt(qtdPassagens) : null,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null
      });

      toast.success('Colaborador atualizado com sucesso!');
      navigate(`/colaboradores/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      toast.error('Erro ao atualizar colaborador');
    } finally {
      setIsSaving(false);
    }
  };

  const funcoesOptions = getFuncoesOptions(tipoEquipe);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(`/colaboradores/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Colaborador</h1>
              <p className="text-sm text-gray-500 mt-1">Atualize as informações do colaborador</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dados Básicos</h3>

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
                  Tipo de Equipe <span className="text-red-500">*</span>
                </label>
                <Select
                  value={tipoEquipe}
                  onChange={(value) => setTipoEquipe(value as TipoEquipe)}
                  options={TIPO_EQUIPE_OPTIONS}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função <span className="text-red-500">*</span>
                </label>
                <Select
                  value={funcao}
                  onChange={(value) => setFuncao(value as FuncaoColaborador)}
                  options={funcoesOptions}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato
                </label>
                <Select
                  value={tipoContrato}
                  onChange={(value) => setTipoContrato(value as 'fixo' | 'diarista')}
                  options={TIPO_CONTRATO_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tipoContrato === 'fixo' ? 'Salário Fixo' : 'Valor da Diária'}
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
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dados de Contato</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <Input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <Input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
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
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pagamentos</h3>

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

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status e Benefícios</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registrado}
                    onChange={(e) => setRegistrado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Registrado</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={valeTransporte}
                    onChange={(e) => setValeTransporte(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Vale Transporte</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/colaboradores/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ColaboradorEdit;
