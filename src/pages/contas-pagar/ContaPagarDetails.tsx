import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  FileText, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  User,
  Tag,
  FileDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { formatCurrency } from '../../utils/format'
import { formatDateSafe } from '../../utils/date-utils'
import { useToast } from '../../lib/toast-hooks'
import { getContaPagarById, deleteContaPagar } from '../../lib/contas-pagar-api'
import type { ContaPagar } from '../../types/contas-pagar'
import { STATUS_COLORS, calcularDiasParaVencimento } from '../../types/contas-pagar'

export default function ContaPagarDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const [conta, setConta] = useState<ContaPagar | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      carregarConta(id)
    }
  }, [id])

  const carregarConta = async (contaId: string) => {
    try {
      setLoading(true)
      console.log('🔍 [ContaPagarDetails] Carregando conta:', contaId)

      const contaData = await getContaPagarById(contaId)

      if (!contaData) {
        toast.error('Conta não encontrada')
        navigate('/contas-pagar')
        return
      }

      setConta(contaData)
      console.log('✅ [ContaPagarDetails] Conta carregada:', contaData.numero_nota)
    } catch (error: any) {
      console.error('❌ [ContaPagarDetails] Erro ao carregar conta:', error)
      toast.error(error.message || 'Erro ao carregar dados da conta')
      navigate('/contas-pagar')
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async () => {
    if (!id) return
    
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      console.log('🗑️  [ContaPagarDetails] Excluindo conta:', id)
      await deleteContaPagar(id)

      toast.success('Conta excluída com sucesso!')
      console.log('✅ [ContaPagarDetails] Conta excluída com sucesso')
      navigate('/contas-pagar')
    } catch (error: any) {
      console.error('❌ [ContaPagarDetails] Erro ao excluir conta:', error)
      toast.error(error.message || 'Erro ao excluir conta')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paga':
        return <CheckCircle2 className="h-6 w-6" />
      case 'Pendente':
        return <Clock className="h-6 w-6" />
      case 'Atrasada':
        return <AlertCircle className="h-6 w-6" />
      case 'Cancelada':
        return <XCircle className="h-6 w-6" />
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  const getDiasVencimentoInfo = () => {
    if (!conta) return null
    if (conta.status === 'Paga' || conta.status === 'Cancelada') return null
    
    const dias = calcularDiasParaVencimento(conta.data_vencimento)
    
    if (dias < 0) {
      return {
        texto: `Atrasado há ${Math.abs(dias)} dia(s)`,
        cor: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    } else if (dias === 0) {
      return {
        texto: 'Vence hoje',
        cor: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      }
    } else if (dias <= 7) {
      return {
        texto: `Vence em ${dias} dia(s)`,
        cor: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      }
    }
    return null
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!conta) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conta não encontrada</h3>
          <button
            onClick={() => navigate('/contas-pagar')}
            className="text-primary-600 hover:text-primary-700"
          >
            Voltar para lista de contas
          </button>
        </div>
      </Layout>
    )
  }

  const diasInfo = getDiasVencimentoInfo()

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contas-pagar')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Conta</h1>
              <p className="text-gray-500 mt-1">Informações completas da conta a pagar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/contas-pagar/${id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-5 w-5" />
              Editar
            </button>
            <button
              onClick={handleExcluir}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Excluir
            </button>
          </div>
        </div>

        {/* Alerta de Vencimento */}
        {diasInfo && (
          <div className={`p-4 rounded-lg border ${diasInfo.bg} ${diasInfo.border}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${diasInfo.cor}`} />
              <span className={`font-medium ${diasInfo.cor}`}>{diasInfo.texto}</span>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-full ${STATUS_COLORS[conta.status].bg} flex items-center justify-center ${STATUS_COLORS[conta.status].text}`}>
                {getStatusIcon(conta.status)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{conta.numero_nota}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[conta.status].badge}`}>
                    {conta.status}
                  </span>
                  {conta.categoria && (
                    <span className="text-sm text-gray-500">• {conta.categoria}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Valor</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(Number(conta.valor))}</p>
            </div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados da Nota Fiscal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Dados da Nota Fiscal
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data de Emissão</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateSafe(conta.data_emissao)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data de Vencimento</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateSafe(conta.data_vencimento)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Valor da Nota</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatCurrency(Number(conta.valor))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Fornecedor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Informações do Fornecedor
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fornecedor</p>
                  <p className="text-base font-medium text-gray-900">
                    {conta.fornecedor || 'Não informado'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="text-base font-medium text-gray-900">
                    {conta.categoria || 'Não informada'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Descrição</p>
                  <p className="text-base text-gray-900">
                    {conta.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Pagamento (se paga) */}
        {conta.status === 'Paga' && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações de Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {conta.data_pagamento && (
                <div>
                  <p className="text-sm text-green-700">Data de Pagamento</p>
                  <p className="text-base font-medium text-green-900">
                    {formatDateSafe(conta.data_pagamento)}
                  </p>
                </div>
              )}
              {conta.valor_pago && (
                <div>
                  <p className="text-sm text-green-700">Valor Pago</p>
                  <p className="text-base font-medium text-green-900">
                    {formatCurrency(Number(conta.valor_pago))}
                  </p>
                </div>
              )}
              {conta.forma_pagamento && (
                <div>
                  <p className="text-sm text-green-700">Forma de Pagamento</p>
                  <p className="text-base font-medium text-green-900">
                    {conta.forma_pagamento}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {conta.observacoes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              Observações
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{conta.observacoes}</p>
          </div>
        )}

        {/* Anexo */}
        {conta.anexo_url && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Anexo da Nota Fiscal
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {conta.anexo_nome || 'Nota Fiscal'}
                  </p>
                  <p className="text-sm text-gray-500">Anexo da conta a pagar</p>
                </div>
              </div>
              <a
                href={conta.anexo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <FileDown className="h-5 w-5" />
                Baixar
              </a>
            </div>
          </div>
        )}

        {/* Metadados */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Criado em: </span>
              <span className="text-gray-900 font-medium">
                {formatDateSafe(conta.created_at)}
              </span>
            </div>
            {conta.updated_at && (
              <div>
                <span className="text-gray-500">Atualizado em: </span>
                <span className="text-gray-900 font-medium">
                  {formatDateSafe(conta.updated_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

