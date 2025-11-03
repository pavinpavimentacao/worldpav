import React, { useEffect, useState, useMemo } from 'react'
import { Search, Calendar, DollarSign, CheckCircle, FileText, CreditCard } from 'lucide-react'
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'
import { getAllNotasFiscais } from '../../lib/obrasNotasFiscaisApi'
import { getAllPagamentosDiretos } from '../../lib/obrasPagamentosDiretosApi'
import type { ObraNotaFiscal } from '../../types/obras-financeiro'
import type { ObraPagamentoDireto } from '../../types/obras-pagamentos'

// ⚙️ DADOS REAIS
const USE_MOCK = false

interface Recebimento {
  id: string
  tipo: 'nota_fiscal' | 'pagamento_direto'
  data_pagamento: string
  obra_nome: string
  descricao: string
  valor_recebido: number
  numero_nota_fiscal?: string
  forma_pagamento?: string
  status: string
}

interface RecebimentosTabProps {
  mesAno: { mes: number; ano: number }
}

export function RecebimentosTab({ mesAno }: RecebimentosTabProps) {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroData, setFiltroData] = useState('')

  useEffect(() => {
    loadRecebimentos()
  }, [mesAno])

  // Aplicar filtros usando useMemo para melhor performance
  const recebimentosFiltrados = useMemo(() => {
    let resultado = [...recebimentos]

    if (filtroObra) {
      resultado = resultado.filter(r => 
        (r.obra_nome || '').toLowerCase().includes(filtroObra.toLowerCase()) ||
        (r.rua_nome || '').toLowerCase().includes(filtroObra.toLowerCase())
      )
    }

    if (filtroData) {
      resultado = resultado.filter(r => r.data_pagamento?.startsWith(filtroData))
    }

    return resultado
  }, [recebimentos, filtroObra, filtroData])

  const loadRecebimentos = async () => {
    try {
      setLoading(true)

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setRecebimentos([
          {
            id: '1',
            tipo: 'nota_fiscal',
            data_pagamento: '2025-01-20',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            descricao: 'Nota Fiscal NF-001/2025',
            valor_recebido: 40500.00,
            numero_nota_fiscal: 'NF-001/2025',
            status: 'pago'
          },
          {
            id: '2',
            tipo: 'pagamento_direto',
            data_pagamento: '2025-01-25',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            descricao: 'PIX - Avanço de Pagamento',
            valor_recebido: 15000.00,
            forma_pagamento: 'PIX',
            status: 'pago'
          }
        ])
      } else {
        // Buscar recebimentos de DUAS fontes - IGUAL À PÁGINA RECEBIMENTOS
        const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
        const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
        const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

        // 1. Buscar TODAS as Notas Fiscais (sem filtro de status)
        const notasFiscais = await getAllNotasFiscais()
        console.log('📊 [RecebimentosTab] Notas fiscais totais:', (notasFiscais || []).length)
        
        // Filtrar apenas as PAGAS com data_pagamento no período
        const notasNoPeriodo = (notasFiscais || []).filter((nota: ObraNotaFiscal & { obra_nome?: string }) => {
          // Apenas notas com status 'paga'
          if (nota.status !== 'paga') return false
          
          // Usar data_pagamento (prioridade) ou vencimento
          const dataRef = nota.data_pagamento || nota.vencimento
          if (!dataRef) return false
          
          return dataRef >= dataInicio && dataRef <= dataFim
        })

        // 2. Buscar TODOS os Pagamentos Diretos
        const pagamentosDiretos = await getAllPagamentosDiretos()
        console.log('📊 [RecebimentosTab] Pagamentos diretos totais:', (pagamentosDiretos || []).length)
        
        // Filtrar apenas os que têm data_pagamento no período
        const pagamentosNoPeriodo = (pagamentosDiretos || []).filter((pag: ObraPagamentoDireto & { obra_nome?: string }) => {
          if (!pag.data_pagamento) return false
          return pag.data_pagamento >= dataInicio && pag.data_pagamento <= dataFim
        })

        // Combinar e formatar todos os recebimentos
        const recebimentosLista: Recebimento[] = []

        // Adicionar notas fiscais pagas
        notasNoPeriodo.forEach((nota: ObraNotaFiscal & { obra_nome?: string }) => {
          recebimentosLista.push({
            id: `nf-${nota.id}`,
            tipo: 'nota_fiscal',
            data_pagamento: nota.data_pagamento || nota.vencimento || '',
            obra_nome: nota.obra_nome || 'Obra não identificada',
            descricao: `Nota Fiscal ${nota.numero_nota}`,
            valor_recebido: nota.valor_liquido || 0,
            numero_nota_fiscal: nota.numero_nota,
            status: 'pago'
          })
        })

        // Adicionar pagamentos diretos
        pagamentosNoPeriodo.forEach((pag: ObraPagamentoDireto & { obra_nome?: string }) => {
          const formaTexto = pag.forma_pagamento?.toUpperCase() || 'N/A'
          recebimentosLista.push({
            id: `pd-${pag.id}`,
            tipo: 'pagamento_direto',
            data_pagamento: pag.data_pagamento || '',
            obra_nome: pag.obra_nome || 'Obra não identificada',
            descricao: pag.descricao || 'Pagamento Direto',
            valor_recebido: pag.valor || 0,
            forma_pagamento: formaTexto,
            status: 'pago'
          })
        })

        // Ordenar por data de pagamento (mais recente primeiro)
        recebimentosLista.sort((a, b) => {
          return new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime()
        })

        setRecebimentos(recebimentosLista)
        console.log('📊 [RecebimentosTab] Total recebimentos encontrados:', recebimentosLista.length, {
          notasFiscais: notasNoPeriodo.length,
          pagamentosDiretos: pagamentosNoPeriodo.length,
          periodo: `${dataInicio} a ${dataFim}`
        })
      }
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataString: string) => {
    if (!dataString) return '-'
    const data = new Date(dataString + 'T00:00:00')
    return data.toLocaleDateString('pt-BR')
  }

  const totalRecebimentos = recebimentosFiltrados.reduce((sum, r) => sum + r.valor_recebido, 0)
  const totalNotasFiscais = recebimentosFiltrados.filter(r => r.tipo === 'nota_fiscal').reduce((sum, r) => sum + r.valor_recebido, 0)
  const totalPagamentosDiretos = recebimentosFiltrados.filter(r => r.tipo === 'pagamento_direto').reduce((sum, r) => sum + r.valor_recebido, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando recebimentos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Obra ou Rua
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Digite o nome da obra ou rua..."
              value={filtroObra}
              onChange={(e) => setFiltroObra(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <DatePicker
            value={filtroData}
            onChange={setFiltroData}
            label="Filtrar por Data de Pagamento"
            placeholder="Selecione a data"
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700">Total Recebido</p>
              <p className="text-xs text-emerald-600 mt-1">
                {recebimentosFiltrados.length} recebimento{recebimentosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              R$ {totalRecebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700">Notas Fiscais</p>
              <p className="text-xs text-blue-600 mt-1">Pagas no período</p>
            </div>
            <span className="text-xl font-bold text-blue-600">
              R$ {totalNotasFiscais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-700">Pagamentos Diretos</p>
              <p className="text-xs text-purple-600 mt-1">PIX, Transferência, etc</p>
            </div>
            <span className="text-xl font-bold text-purple-600">
              R$ {totalPagamentosDiretos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Recebimentos */}
      {recebimentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Nenhum recebimento encontrado com os filtros aplicados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nº Nota / Forma
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data Pagamento
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor Recebido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recebimentosFiltrados.map((recebimento) => (
                <tr key={recebimento.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {recebimento.tipo === 'nota_fiscal' ? (
                        <>
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-semibold text-blue-700">NF</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 text-purple-500" />
                          <span className="text-xs font-semibold text-purple-700">Direto</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium">
                      {recebimento.obra_nome}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {recebimento.descricao}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600 font-medium">
                      {recebimento.numero_nota_fiscal || recebimento.forma_pagamento || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatarData(recebimento.data_pagamento)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      R$ {recebimento.valor_recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-900">
                  TOTAL RECEBIDO
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                  R$ {totalRecebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

