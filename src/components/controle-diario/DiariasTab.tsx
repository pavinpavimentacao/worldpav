/**
 * Tab: Diárias (Pagamentos)
 * Gestão de pagamento de diárias para colaboradores
 */

import React, { useState, useMemo } from 'react';
import { Plus, DollarSign, Calendar, User, Edit2, Trash2, Check, X, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from "../shared/Button";
import { Input } from '../ui/input';
import { toast } from '../../lib/toast-hooks';
import { mockColaboradores } from '../../mocks/colaboradores-mock';
import {
  listarRegistrosDiarias,
  criarRegistroDiaria,
  atualizarRegistroDiaria,
  deletarRegistroDiaria,
} from '../../mocks/controle-diario-mock';
import { RegistroDiaria, formatarValor, calcularValorTotalDiaria } from '../../types/controle-diario';
import { formatDateBR } from '../../utils/date-format';

export const DiariasTab: React.FC = () => {
  const [diarias, setDiarias] = useState<RegistroDiaria[]>(listarRegistrosDiarias());
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [diariaSelecionada, setDiariaSelecionada] = useState<RegistroDiaria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [colaboradorId, setColaboradorId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valorUnitario, setValorUnitario] = useState('150.00');
  const [adicional, setAdicional] = useState('0');
  const [desconto, setDesconto] = useState('0');
  const [dataDiaria, setDataDiaria] = useState(new Date().toISOString().split('T')[0]);
  const [dataPagamento, setDataPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Filtros
  const [filtroColaborador, setFiltroColaborador] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago'>('todos');

  // Colaboradores ativos de pavimentação
  const colaboradoresPavimentacao = mockColaboradores.filter(
    (c) => c.ativo && (c.tipo_equipe === 'pavimentacao' || c.tipo_equipe === 'ambas')
  );

  // Filtrar diárias
  const diariasFiltradas = useMemo(() => {
    return diarias.filter((diaria) => {
      const matchColaborador =
        filtroColaborador === '' ||
        diaria.colaborador_nome?.toLowerCase().includes(filtroColaborador.toLowerCase()) ||
        diaria.colaborador_funcao?.toLowerCase().includes(filtroColaborador.toLowerCase());

      const matchStatus = filtroStatus === 'todos' || diaria.status_pagamento === filtroStatus;

      return matchColaborador && matchStatus;
    });
  }, [diarias, filtroColaborador, filtroStatus]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const totalDiarias = diariasFiltradas.reduce((sum, d) => sum + d.quantidade, 0);
    const valorTotal = diariasFiltradas.reduce((sum, d) => sum + d.valor_total, 0);
    const pendentes = diariasFiltradas.filter((d) => d.status_pagamento === 'pendente').length;
    const valorPendente = diariasFiltradas
      .filter((d) => d.status_pagamento === 'pendente')
      .reduce((sum, d) => sum + d.valor_total, 0);

    return { totalDiarias, valorTotal, pendentes, valorPendente };
  }, [diariasFiltradas]);

  const limparFormulario = () => {
    setColaboradorId('');
    setQuantidade('1');
    setValorUnitario('150.00');
    setAdicional('0');
    setDesconto('0');
    setDataDiaria(new Date().toISOString().split('T')[0]);
    setDataPagamento('');
    setObservacoes('');
  };

  const handleOpenModal = () => {
    limparFormulario();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const qtd = parseInt(quantidade);
      const valorUnit = parseFloat(valorUnitario);
      const adic = parseFloat(adicional);
      const desc = parseFloat(desconto);

      if (isNaN(qtd) || qtd <= 0) {
        toast.error('Quantidade inválida');
        setIsSubmitting(false);
        return;
      }

      if (isNaN(valorUnit) || valorUnit <= 0) {
        toast.error('Valor unitário inválido');
        setIsSubmitting(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const colaborador = colaboradoresPavimentacao.find((c) => c.id === colaboradorId);

      const novaDiaria = criarRegistroDiaria({
        colaborador_id: colaboradorId,
        quantidade: qtd,
        valor_unitario: valorUnit,
        adicional: adic,
        desconto: desc,
        data_diaria: dataDiaria,
        data_pagamento: dataPagamento || undefined,
        observacoes: observacoes.trim() || undefined,
      });

      // Adicionar nome e função do colaborador
      novaDiaria.colaborador_nome = colaborador?.nome;
      novaDiaria.colaborador_funcao = colaborador?.funcao;

      setDiarias([novaDiaria, ...diarias]);
      toast.success('Diária registrada com sucesso!');
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar diária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcarPago = (diaria: RegistroDiaria) => {
    const atualizada = atualizarRegistroDiaria(diaria.id, {
      status_pagamento: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
    });

    if (atualizada) {
      setDiarias((prev) => prev.map((d) => (d.id === diaria.id ? atualizada : d)));
      toast.success('Diária marcada como paga!');
    }
  };

  const handleDeletar = (id: string) => {
    if (window.confirm('Deseja realmente excluir este registro de diária?')) {
      if (deletarRegistroDiaria(id)) {
        setDiarias((prev) => prev.filter((d) => d.id !== id));
        toast.success('Diária excluída com sucesso!');
      }
    }
  };

  const valorTotalCalculado = useMemo(() => {
    const qtd = parseInt(quantidade) || 0;
    const valorUnit = parseFloat(valorUnitario) || 0;
    const adic = parseFloat(adicional) || 0;
    const desc = parseFloat(desconto) || 0;
    return calcularValorTotalDiaria(qtd, valorUnit, adic, desc);
  }, [quantidade, valorUnitario, adicional, desconto]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pagamento de Diárias</h2>
          <p className="text-gray-600 mt-1">Gestão financeira de diárias por colaborador</p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Adicionar Diária</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total de Diárias</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalDiarias}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">{formatarValor(estatisticas.valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.pendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Pendente</p>
              <p className="text-xl font-bold text-gray-900">{formatarValor(estatisticas.valorPendente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Colaborador</label>
            <Input
              type="text"
              value={filtroColaborador}
              onChange={(e) => setFiltroColaborador(e.target.value)}
              placeholder="Nome ou função..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagos</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFiltroColaborador('');
                setFiltroStatus('todos');
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Diárias */}
      <div className="space-y-3">
        {diariasFiltradas.map((diaria) => (
          <div
            key={diaria.id}
            className={`
              bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md
              ${diaria.status_pagamento === 'pago' ? 'border-green-200 bg-green-50' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{diaria.colaborador_nome}</h3>
                    <span
                      className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${
                          diaria.status_pagamento === 'pago'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      `}
                    >
                      {diaria.status_pagamento === 'pago' ? '✓ Pago' : '⏳ Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{diaria.colaborador_funcao}</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Quantidade</p>
                      <p className="font-semibold text-gray-900">{diaria.quantidade}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor Unitário</p>
                      <p className="font-semibold text-gray-900">{formatarValor(diaria.valor_unitario)}</p>
                    </div>
                    {diaria.adicional > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Adicional</p>
                        <p className="font-semibold text-green-600">+{formatarValor(diaria.adicional)}</p>
                      </div>
                    )}
                    {diaria.desconto > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Desconto</p>
                        <p className="font-semibold text-red-600">-{formatarValor(diaria.desconto)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Valor Total</p>
                      <p className="font-bold text-blue-600 text-lg">{formatarValor(diaria.valor_total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Diária: {formatDateBR(diaria.data_diaria)}
                    </span>
                    {diaria.data_pagamento && (
                      <span className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        Pago: {formatDateBR(diaria.data_pagamento)}
                      </span>
                    )}
                  </div>

                  {diaria.observacoes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                      💬 {diaria.observacoes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {diaria.status_pagamento === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => handleMarcarPago(diaria)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Marcar Pago
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeletar(diaria.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {diariasFiltradas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Nenhuma diária registrada</p>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Diária
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Adicionar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Adicionar Diária</h3>
                  <p className="text-sm text-gray-600">Registre uma nova diária para pagamento</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Colaborador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colaborador <span className="text-red-500">*</span>
                </label>
                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecione um colaborador</option>
                  {colaboradoresPavimentacao.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.nome} - {col.funcao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Unitário (R$) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adicional (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={adicional}
                    onChange={(e) => setAdicional(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Diária <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dataDiaria}
                    onChange={(e) => setDataDiaria(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento
                  </label>
                  <Input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Valor Total Calculado */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Valor Total a Pagar:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatarValor(valorTotalCalculado)}</span>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Observações adicionais..."
                  disabled={isSubmitting}
                />
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
                  {isSubmitting ? 'Registrando...' : 'Registrar Diária'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

